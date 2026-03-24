import { Db, Collection } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'

export interface User {
  id: string
  username: string
  email: string
  password: string
  avatar: string
  bio: string
  createdAt: string
  favorites: string[]  // 收藏的文章ID列表
  likes: string[]  // 点赞的文章ID列表
}

export class UserModel {
  private collection: Collection

  constructor(db: Db) {
    this.collection = db.collection<User>('users')
  }

  // 创建索引
  async createIndexes(): Promise<void> {
    await this.collection.createIndex({ username: 1 }, { unique: true })
    await this.collection.createIndex({ email: 1 }, { unique: true })
  }

  // 根据用户名查找用户
  async findByUsername(username: string): Promise<User | null> {
    return this.collection.findOne({ username })
  }

  // 根据邮箱查找用户
  async findByEmail(email: string): Promise<User | null> {
    return this.collection.findOne({ email })
  }

  // 根据ID查找用户
  async findById(id: string): Promise<User | null> {
    return this.collection.findOne({ id })
  }

  // 创建用户
  async create(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const newUser: User = {
      id: uuidv4(),
      ...user,
      createdAt: new Date().toISOString()
    }
    await this.collection.insertOne(newUser)
    return newUser
  }

  // 更新用户
  async update(id: string, data: Partial<User>): Promise<User | null> {
    const result = await this.collection.findOneAndUpdate(
      { id },
      { $set: data },
      { returnDocument: 'after' }
    )
    return result
  }

  // 添加收藏
  async addFavorite(userId: string, articleId: string): Promise<User | null> {
    return this.collection.findOneAndUpdate(
      { id: userId },
      { $addToSet: { favorites: articleId } },
      { returnDocument: 'after' }
    )
  }

  // 移除收藏
  async removeFavorite(userId: string, articleId: string): Promise<User | null> {
    return this.collection.findOneAndUpdate(
      { id: userId },
      { $pull: { favorites: articleId } },
      { returnDocument: 'after' }
    )
  }

  // 获取用户收藏
  async getFavorites(userId: string): Promise<string[]> {
    const user = await this.collection.findOne({ id: userId })
    if (!user) return []
    
    // 如果没有 favorites 字段，初始化为空数组
    if (!Array.isArray(user.favorites)) {
      await this.collection.updateOne(
        { id: userId },
        { $set: { favorites: [] } }
      )
      return []
    }
    
    return user.favorites
  }

  // 添加点赞
  async addLike(userId: string, articleId: string): Promise<User | null> {
    return this.collection.findOneAndUpdate(
      { id: userId },
      { $addToSet: { likes: articleId } },
      { returnDocument: 'after' }
    )
  }

  // 移除点赞
  async removeLike(userId: string, articleId: string): Promise<User | null> {
    return this.collection.findOneAndUpdate(
      { id: userId },
      { $pull: { likes: articleId } },
      { returnDocument: 'after' }
    )
  }

  // 获取用户点赞列表
  async getLikes(userId: string): Promise<string[]> {
    const user = await this.collection.findOne({ id: userId })
    if (!user) return []
    
    // 如果没有 likes 字段，初始化为空数组
    if (!Array.isArray(user.likes)) {
      await this.collection.updateOne(
        { id: userId },
        { $set: { likes: [] } }
      )
      return []
    }
    
    return user.likes
  }

  // 搜索用户（模糊匹配用户名）
  async search(query: string, limit = 10): Promise<Omit<User, 'password'>[]> {
    const users = await this.collection.find({
      username: { $regex: query, $options: 'i' }
    })
      .limit(limit)
      .toArray()
    
    return users.map(({ password, ...user }) => user as Omit<User, 'password'>)
  }

  // 根据ID获取用户（不含密码）
  async findByIdWithoutPassword(id: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.collection.findOne({ id })
    if (!user) return null
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  }
}
