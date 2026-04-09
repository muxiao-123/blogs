import { Article, CreateArticleInput } from '../types'
import { ArticleModel } from '../models/Article'
import { v4 as uuidv4 } from 'uuid'

let articleModel: ArticleModel | null = null

export function initArticleService(model: ArticleModel) {
  articleModel = model
}

class ArticleService {
  // 获取所有文章
  async getAll(): Promise<Article[]> {
    if (!articleModel) throw new Error('ArticleService not initialized')
    return articleModel.findAll()
  }

  // 根据ID获取文章
  async getById(id: string): Promise<Article | undefined> {
    if (!articleModel) throw new Error('ArticleService not initialized')
    const article = await articleModel.findById(id)
    return article ?? undefined
  }

  // 根据分类获取文章
  async getByCategory(category: string): Promise<Article[]> {
    if (!articleModel) throw new Error('ArticleService not initialized')
    return articleModel.findByCategory(category as any)
  }

  // 根据标签获取文章
  async getByTag(tag: string): Promise<Article[]> {
    if (!articleModel) throw new Error('ArticleService not initialized')
    return articleModel.findByTag(tag)
  }

  // 搜索文章
  async search(query: string): Promise<Article[]> {
    if (!articleModel) throw new Error('ArticleService not initialized')
    return articleModel.search(query)
  }

  // 创建文章
  async create(input: CreateArticleInput, currentUser?: any): Promise<Article> {
    if (!articleModel) throw new Error('ArticleService not initialized')

    const id = uuidv4()
    const contentLength = input.content.length
    const readTime = Math.ceil(contentLength / 500)

    const newArticle: Article = {
      id,
      title: input.title,
      excerpt: input.excerpt,
      content: input.content,
      cover: input.cover,
      category: input.category,
      tags: input.tags,
      author: currentUser
        ? {
            name: currentUser.username,
            avatar:
              currentUser.avatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.username}`,
            bio: currentUser.bio || '热爱技术的开发者'
          }
        : {
            name: 'Lumina',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lumina',
            bio: '热爱技术的开发者'
          },
      publishDate: new Date().toISOString().split('T')[0],
      readTime,
      views: 0,
      likes: 0,
      isLiked: false,
      comments: [],
      isPrivate: input.isPrivate || false
    }

    await articleModel.create(newArticle)
    return newArticle
  }

  // 更新文章
  async update(
    id: string,
    input: Partial<CreateArticleInput>,
    currentUser?: any
  ): Promise<Article | null> {
    if (!articleModel) throw new Error('ArticleService not initialized')

    const existing = await articleModel.findById(id)
    if (!existing) return null

    // 检查权限：只有文章作者可以编辑
    if (currentUser && existing.author.name !== currentUser.username) {
      return null
    }

    const updateData: Partial<Article> = {
      title: input.title,
      excerpt: input.excerpt,
      content: input.content,
      cover: input.cover,
      category: input.category,
      tags: input.tags,
      readTime: input.content ? Math.ceil(input.content.length / 500) : existing.readTime
    }

    // 只有当 input.isPrivate 明确传入时才更新
    if (input.isPrivate !== undefined) {
      updateData.isPrivate = input.isPrivate
    }

    return articleModel.update(id, updateData)
  }

  // 更新文章点赞数
  async updateLikes(id: string, likes: number): Promise<Article | null> {
    if (!articleModel) throw new Error('ArticleService not initialized')
    return articleModel.update(id, { likes })
  }

  // 更新文章收藏数
  async updateFavorites(id: string, favorites: number): Promise<Article | null> {
    if (!articleModel) throw new Error('ArticleService not initialized')
    return articleModel.update(id, { favorites })
  }

  // 增加文章浏览数
  async incrementViews(id: string): Promise<Article | null> {
    if (!articleModel) throw new Error('ArticleService not initialized')
    const article = await articleModel.findById(id)
    if (!article) return null
    const newViews = (article.views || 0) + 1
    return articleModel.update(id, {
      views: newViews,
      lastViewedAt: new Date().toISOString()
    })
  }

  // 删除文章
  async delete(id: string, currentUser?: any): Promise<boolean> {
    if (!articleModel) throw new Error('ArticleService not initialized')

    const existing = await articleModel.findById(id)
    if (!existing) return false

    // 检查权限：只有文章作者可以删除
    if (currentUser && existing.author.name !== currentUser.username) {
      return false
    }

    return articleModel.delete(id)
  }

  // 切换文章点赞
  async toggleLike(id: string): Promise<Article | null> {
    if (!articleModel) throw new Error('ArticleService not initialized')

    const article = await articleModel.findById(id)
    if (!article) return null

    const newLikes = article.isLiked ? article.likes - 1 : article.likes + 1
    const newIsLiked = !article.isLiked

    return articleModel.update(id, {
      likes: newLikes,
      isLiked: newIsLiked
    })
  }

  // 获取所有标签
  async getAllTags(): Promise<string[]> {
    if (!articleModel) throw new Error('ArticleService not initialized')
    return articleModel.getAllTags()
  }

  // 根据作者获取文章
  async getByAuthor(author: string): Promise<Article[]> {
    if (!articleModel) throw new Error('ArticleService not initialized')
    return articleModel.findByAuthor(author)
  }

  // 统计作者文章数
  async countByAuthor(author: string): Promise<number> {
    if (!articleModel) throw new Error('ArticleService not initialized')
    return articleModel.countByAuthor(author)
  }
}

export const articleService = new ArticleService()
