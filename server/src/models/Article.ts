import { Db, Collection } from 'mongodb'
import { Article, Category, Comment } from '../types'

export class ArticleModel {
  private collection: Collection<Article>

  constructor(db: Db) {
    this.collection = db.collection<Article>('articles') as Collection<Article>
  }

  // 创建索引
  async createIndexes(): Promise<void> {
    await this.collection.createIndex({ id: 1 }, { unique: true })
    await this.collection.createIndex({ category: 1 })
    await this.collection.createIndex({ tags: 1 })
    await this.collection.createIndex({ publishDate: -1 })
  }

  // 获取所有文章
  async findAll(): Promise<Article[]> {
    const results = await this.collection.find().sort({ publishDate: -1 }).toArray()
    return results as Article[]
  }

  // 根据ID获取文章
  async findById(id: string): Promise<Article | null> {
    const result = await this.collection.findOne({ id })
    return result as Article | null
  }

  // 根据分类获取文章
  async findByCategory(category: Category): Promise<Article[]> {
    const results = await this.collection.find({ category }).sort({ publishDate: -1 }).toArray()
    return results as Article[]
  }

  // 根据标签获取文章
  async findByTag(tag: string): Promise<Article[]> {
    const results = await this.collection.find({ tags: tag }).sort({ publishDate: -1 }).toArray()
    return results as Article[]
  }

  // 根据作者获取文章
  async findByAuthor(authorName: string): Promise<Article[]> {
    const results = await this.collection.find({ 'author.name': authorName }).sort({ publishDate: -1 }).toArray()
    return results as Article[]
  }

  // 统计作者文章数
  async countByAuthor(authorName: string): Promise<number> {
    return this.collection.countDocuments({ 'author.name': authorName })
  }

  // 搜索文章
  async search(query: string): Promise<Article[]> {
    const lowerQuery = query.toLowerCase()
    const results = await this.collection.find({
      $or: [
        { title: { $regex: lowerQuery, $options: 'i' } },
        { excerpt: { $regex: lowerQuery, $options: 'i' } }
      ]
    }).sort({ publishDate: -1 }).toArray()
    return results as Article[]
  }

  // 创建文章
  async create(article: Article): Promise<Article> {
    await this.collection.insertOne(article)
    return article
  }

  // 更新文章
  async update(id: string, input: Partial<Article>): Promise<Article | null> {
    const result = await this.collection.findOneAndUpdate(
      { id },
      { $set: input },
      { returnDocument: 'after' }
    )
    return result as Article | null
  }

  // 删除文章
  async delete(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ id })
    return result.deletedCount > 0
  }

  // 获取所有标签
  async getAllTags(): Promise<string[]> {
    const articles = await this.collection.find({}, { projection: { tags: 1 } }).toArray()
    const tagSet = new Set<string>()
    articles.forEach((article: any) => {
      article.tags?.forEach((tag: string) => tagSet.add(tag))
    })
    return Array.from(tagSet)
  }

  // 初始化文章数据（如果不存在）
  async initData(articles: Article[]): Promise<void> {
    const count = await this.collection.countDocuments()
    if (count === 0) {
      console.log('Initializing articles data...')
      await this.collection.insertMany(articles)
      console.log(`Inserted ${articles.length} articles`)
    }
  }
}

export class CommentModel {
  private collection: Collection<Comment>

  constructor(db: Db) {
    this.collection = db.collection<Comment>('comments') as Collection<Comment>
  }

  // 添加评论到文章
  async addComment(articleId: string, comment: Comment): Promise<Comment | null> {
    const result = await this.collection.insertOne({
      ...comment,
      articleId
    } as any)
    return { ...comment } as Comment
  }

  // 删除评论
  async deleteComment(articleId: string, commentId: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ articleId, id: commentId })
    return result.deletedCount > 0
  }

  // 点赞评论
  async toggleLike(articleId: string, commentId: string): Promise<Comment | null> {
    const comment = await this.collection.findOne({ articleId, id: commentId })
    if (!comment) return null

    const newLikes = (comment.likes || 0) + 1
    await this.collection.updateOne(
      { articleId, id: commentId },
      { $set: { likes: newLikes } }
    )
    return { ...comment, likes: newLikes } as Comment
  }

  // 获取文章的所有评论
  async getCommentsByArticleId(articleId: string): Promise<Comment[]> {
    const results = await this.collection.find({ articleId }).sort({ createTime: -1 }).toArray()
    return results as Comment[]
  }

  // 更新评论
  async updateComment(articleId: string, commentId: string, updates: Partial<Comment>): Promise<Comment | null> {
    await this.collection.updateOne(
      { articleId, id: commentId },
      { $set: updates }
    )
    const updated = await this.collection.findOne({ articleId, id: commentId })
    return updated as Comment | null
  }
}
