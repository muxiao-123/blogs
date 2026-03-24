import { UserModel, User } from '../models/User'
import { v4 as uuidv4 } from 'uuid'

let userModel: UserModel | null = null

export function initAuthService(model: UserModel) {
  userModel = model
}

class AuthService {
  // 注册用户
  async register(username: string, email: string, password: string): Promise<{ user: Omit<User, 'password'>; token: string } | null> {
    if (!userModel) throw new Error('AuthService not initialized')

    // 检查用户名是否存在
    const existingUser = await userModel.findByUsername(username)
    if (existingUser) {
      throw new Error('用户名已被使用')
    }

    // 检查邮箱是否存在
    const existingEmail = await userModel.findByEmail(email)
    if (existingEmail) {
      throw new Error('邮箱已被注册')
    }

    // 创建用户
    const user = await userModel.create({
      username,
      email,
      password, // 实际项目中应该加密
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      bio: '这个人很懒，什么都没写',
      favorites: [], // 初始化收藏列表
      likes: [] // 初始化点赞列表
    })

    // 生成简单token
    const token = this.generateToken(user.id)

    const { password: _, ...userWithoutPassword } = user
    return { user: userWithoutPassword, token }
  }

  // 登录
  async login(username: string, password: string): Promise<{ user: Omit<User, 'password'>; token: string } | null> {
    if (!userModel) throw new Error('AuthService not initialized')

    // 查找用户
    const user = await userModel.findByUsername(username)
    if (!user) {
      throw new Error('用户名或密码错误')
    }

    // 验证密码 (简单比较，实际项目应该加密比较)
    if (user.password !== password) {
      throw new Error('用户名或密码错误')
    }

    // 生成token
    const token = this.generateToken(user.id)

    const { password: _, ...userWithoutPassword } = user
    return { user: userWithoutPassword, token }
  }

  // 获取用户信息
  async getUserById(id: string): Promise<Omit<User, 'password'> | null> {
    if (!userModel) throw new Error('AuthService not initialized')

    let user = await userModel.findById(id)
    if (!user) return null

    // 确保旧用户有 favorites 字段
    if (!Array.isArray(user.favorites)) {
      user = await userModel.update(id, { favorites: [] })
      if (!user) return null
    }

    // 确保旧用户有 likes 字段
    if (!Array.isArray(user.likes)) {
      user = await userModel.update(id, { likes: [] })
      if (!user) return null
    }

    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  // 更新用户信息
  async updateUser(id: string, data: { username?: string; email?: string; bio?: string; avatar?: string }): Promise<Omit<User, 'password'> | null> {
    if (!userModel) throw new Error('AuthService not initialized')

    // 如果要更新用户名，检查是否已被使用
    if (data.username) {
      const existingUser = await userModel.findByUsername(data.username)
      if (existingUser && existingUser.id !== id) {
        throw new Error('用户名已被使用')
      }
    }

    // 如果要更新邮箱，检查是否已被使用
    if (data.email) {
      const existingEmail = await userModel.findByEmail(data.email)
      if (existingEmail && existingEmail.id !== id) {
        throw new Error('邮箱已被注册')
      }
    }

    const updatedUser = await userModel.update(id, data)
    if (!updatedUser) return null

    const { password, ...userWithoutPassword } = updatedUser
    return userWithoutPassword
  }

  // 验证token并获取用户
  async verifyToken(token: string): Promise<Omit<User, 'password'> | null> {
    if (!userModel) throw new Error('AuthService not initialized')

    try {
      // 清理token，移除可能的换行符或空格
      const cleanToken = token.replace(/\s/g, '').trim()
      const userId = this.parseToken(cleanToken)
      const user = await this.getUserById(userId)
      return user
    } catch (error) {
      return null
    }
  }

  // 生成简单token
  private generateToken(userId: string): string {
    return Buffer.from(`${userId}:${uuidv4()}`).toString('base64')
  }

  // 解析token获取userId
  private parseToken(token: string): string {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    return decoded.split(':')[0]
  }

  // 添加收藏
  async addFavorite(userId: string, articleId: string): Promise<Omit<User, 'password'> | null> {
    if (!userModel) throw new Error('AuthService not initialized')
    const user = await userModel.addFavorite(userId, articleId)
    if (!user) return null
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  // 移除收藏
  async removeFavorite(userId: string, articleId: string): Promise<Omit<User, 'password'> | null> {
    if (!userModel) throw new Error('AuthService not initialized')
    const user = await userModel.removeFavorite(userId, articleId)
    if (!user) return null
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  // 获取用户收藏列表
  async getFavorites(userId: string): Promise<string[]> {
    if (!userModel) throw new Error('AuthService not initialized')
    return userModel.getFavorites(userId)
  }

  // 添加点赞
  async addLike(userId: string, articleId: string): Promise<Omit<User, 'password'> | null> {
    if (!userModel) throw new Error('AuthService not initialized')
    const user = await userModel.addLike(userId, articleId)
    if (!user) return null
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  // 移除点赞
  async removeLike(userId: string, articleId: string): Promise<Omit<User, 'password'> | null> {
    if (!userModel) throw new Error('AuthService not initialized')
    const user = await userModel.removeLike(userId, articleId)
    if (!user) return null
    const { password, ...userWithoutPassword } = user
    return userWithoutPassword
  }

  // 获取用户点赞列表
  async getLikes(userId: string): Promise<string[]> {
    if (!userModel) throw new Error('AuthService not initialized')
    return userModel.getLikes(userId)
  }

  // 搜索用户
  async searchUsers(query: string, limit?: number): Promise<Omit<User, 'password'>[]> {
    if (!userModel) throw new Error('AuthService not initialized')
    return userModel.search(query, limit)
  }

  // 根据ID获取用户
  async getUserByIdSimple(id: string): Promise<Omit<User, 'password'> | null> {
    if (!userModel) throw new Error('AuthService not initialized')
    return userModel.findByIdWithoutPassword(id)
  }
}

export const authService = new AuthService()
