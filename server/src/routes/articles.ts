import { Router, Request, Response, NextFunction } from 'express'
import { articleService } from '../services/articleService'
import { commentService } from '../services/commentService'
import { authService } from '../services/authService'
import { categories } from '../data'

const router = Router()

// 验证中间件
const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '未登录' })
    }
    
    const token = authHeader.replace(/^Bearer\s+/i, '').trim()
    
    if (!token) {
      return res.status(401).json({ error: 'Token无效' })
    }
    
    const user = await authService.verifyToken(token)
    
    if (!user) {
      return res.status(401).json({ error: 'Token无效' })
    }

    // 将用户信息附加到请求对象
    (req as any).user = user
    next()
  } catch (error) {
    res.status(401).json({ error: '认证失败' })
  }
}

// 获取所有分类
router.get('/categories', (_req: Request, res: Response) => {
  res.json(categories)
})

// 获取所有标签
router.get('/tags', async (_req: Request, res: Response) => {
  try {
    const tags = await articleService.getAllTags()
    res.json(tags)
  } catch (error) {
    res.status(500).json({ error: '获取标签失败' })
  }
})

// 获取所有文章
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, tag, q, author } = req.query

    let articles
    if (category) {
      articles = await articleService.getByCategory(category as string)
    } else if (tag) {
      articles = await articleService.getByTag(tag as string)
    } else if (q) {
      articles = await articleService.search(q as string)
    } else if (author) {
      articles = await articleService.getByAuthor(author as string)
    } else {
      articles = await articleService.getAll()
    }

    // 检查用户是否登录，如果登录则添加点赞和收藏状态
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace(/^Bearer\s+/i, '').trim()
      const user = await authService.verifyToken(token)
      if (user) {
        const userLikes = await authService.getLikes(user.id)
        const userFavorites = await authService.getFavorites(user.id)
        articles = articles.map(article => ({
          ...article,
          isLiked: userLikes.includes(article.id),
          isFavorited: userFavorites.includes(article.id),
          favorites: article.favorites || 0
        }))
      }
    }

    // 为所有文章添加收藏数量（未登录时）
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      articles = articles.map(article => ({
        ...article,
        favorites: article.favorites || 0
      }))
    }

    res.json(articles)
  } catch (error) {
    res.status(500).json({ error: '获取文章失败' })
  }
})

// 获取用户文章统计
router.get('/user/stats', async (req: Request, res: Response) => {
  try {
    const { author } = req.query

    if (!author) {
      return res.status(400).json({ error: '缺少作者参数' })
    }

    const articles = await articleService.getByAuthor(author as string)
    const totalViews = articles.reduce((sum, article) => sum + (article.views || 0), 0)
    const totalLikes = articles.reduce((sum, article) => sum + (article.likes || 0), 0)

    res.json({
      articleCount: articles.length,
      totalViews,
      totalLikes
    })
  } catch (error) {
    res.status(500).json({ error: '获取统计失败' })
  }
})

// 获取全局统计
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const articles = await articleService.getAll()
    const totalViews = articles.reduce((sum, article) => sum + (article.views || 0), 0)
    const totalLikes = articles.reduce((sum, article) => sum + (article.likes || 0), 0)

    // 订阅数可以基于所有文章的总订阅数，这里简化为点赞总数的十分之一作为订阅数
    // 如果需要真正的订阅功能，需要单独创建 subscribers 表
    const totalSubscribers = Math.floor(totalLikes / 10) || 0

    res.json({
      articleCount: articles.length,
      totalViews,
      totalSubscribers
    })
  } catch (error) {
    res.status(500).json({ error: '获取统计失败' })
  }
})

// 获取用户收藏的文章
router.get('/favorites', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user
    
    if (!user || !user.id) {
      return res.status(400).json({ error: '用户信息无效' })
    }
    
    const favoriteIds = await authService.getFavorites(user.id)

    // 获取收藏的文章详情
    const articles = await Promise.all(
      favoriteIds.map(id => articleService.getById(id))
    )

    // 过滤掉不存在的文章
    res.json(articles.filter(Boolean))
  } catch (error) {
    res.status(500).json({ error: '获取收藏失败' })
  }
})

// 检查文章是否已收藏
router.get('/:id/favorite', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user
    const articleId = req.params.id

    const favorites = await authService.getFavorites(user.id)
    res.json({ favorited: favorites.includes(articleId) })
  } catch (error) {
    res.status(500).json({ error: '检查失败' })
  }
})

// 添加/取消收藏
router.post('/:id/favorite', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user
    const articleId = req.params.id

    // 检查文章是否存在
    const article = await articleService.getById(articleId)
    if (!article) {
      return res.status(404).json({ error: '文章不存在' })
    }

    // 获取当前收藏状态
    const favorites = await authService.getFavorites(user.id)
    const isFavorited = favorites.includes(articleId)

    let newFavorites = article.favorites || 0

    if (isFavorited) {
      // 取消收藏
      await authService.removeFavorite(user.id, articleId)
      newFavorites = Math.max(0, newFavorites - 1)
    } else {
      // 添加收藏
      await authService.addFavorite(user.id, articleId)
      newFavorites = (newFavorites || 0) + 1
    }

    // 更新文章收藏数
    await articleService.updateFavorites(articleId, newFavorites)

    res.json({ favorited: !isFavorited, favorites: newFavorites })
  } catch (error) {
    res.status(500).json({ error: '操作失败' })
  }
})

// 获取单个文章
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const article = await articleService.getById(req.params.id)

    if (!article) {
      return res.status(404).json({ error: '文章不存在' })
    }

    // 增加浏览数
    await articleService.incrementViews(req.params.id)
    const updatedArticle = await articleService.getById(req.params.id)

    // 检查用户是否点赞和收藏
    let isLiked = false
    let isFavorited = false
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace(/^Bearer\s+/i, '').trim()
      const user = await authService.verifyToken(token)
      if (user) {
        const userLikes = await authService.getLikes(user.id)
        isLiked = userLikes.includes(article.id)
        const userFavorites = await authService.getFavorites(user.id)
        isFavorited = userFavorites.includes(article.id)
      }
    }

    res.json({
      ...updatedArticle,
      isLiked,
      isFavorited,
      favorites: updatedArticle.favorites || 0,
      views: updatedArticle.views || 0
    })
  } catch (error) {
    res.status(500).json({ error: '获取文章失败' })
  }
})

// 创建文章
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { title, excerpt, content, cover, category, tags } = req.body

    if (!title || !content || !category) {
      return res.status(400).json({ error: '缺少必要字段' })
    }

    const article = await articleService.create({
      title,
      excerpt: excerpt || content.slice(0, 100),
      content,
      cover: cover || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
      category,
      tags: tags || []
    }, (req as any).user)

    res.status(201).json(article)
  } catch (error) {
    res.status(500).json({ error: '创建文章失败' })
  }
})

// 更新文章
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { title, excerpt, content, cover, category, tags } = req.body

    const article = await articleService.update(req.params.id, {
      title,
      excerpt,
      content,
      cover,
      category,
      tags
    }, (req as any).user)

    if (!article) {
      return res.status(404).json({ error: '文章不存在或没有权限' })
    }

    res.json(article)
  } catch (error) {
    res.status(500).json({ error: '更新文章失败' })
  }
})

// 删除文章
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const success = await articleService.delete(req.params.id, (req as any).user)

    if (!success) {
      return res.status(404).json({ error: '文章不存在或没有权限' })
    }

    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: '删除文章失败' })
  }
})

// 点赞/取消点赞文章
router.post('/:id/like', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user
    const articleId = req.params.id

    // 检查文章是否存在
    const article = await articleService.getById(articleId)
    if (!article) {
      return res.status(404).json({ error: '文章不存在' })
    }

    // 获取用户点赞列表
    const userLikes = await authService.getLikes(user.id)
    const isLiked = userLikes.includes(articleId)

    let newLikes: number
    if (isLiked) {
      // 取消点赞
      await authService.removeLike(user.id, articleId)
      newLikes = Math.max(0, (article.likes || 0) - 1)
    } else {
      // 添加点赞
      await authService.addLike(user.id, articleId)
      newLikes = (article.likes || 0) + 1
    }

    // 更新文章的点赞数
    await articleService.updateLikes(articleId, newLikes)

    res.json({
      likes: newLikes,
      isLiked: !isLiked
    })
  } catch (error) {
    res.status(500).json({ error: '操作失败' })
  }
})

// 添加评论
router.post('/:id/comments', async (req: Request, res: Response) => {
  try {
    const { content, author } = req.body

    if (!content || !author || !author.name) {
      return res.status(400).json({ error: '缺少必要字段' })
    }

    const comment = await commentService.addComment({
      articleId: req.params.id,
      content,
      author: {
        id: author.id,
        name: author.name,
        avatar: author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${author.name}`
      }
    })

    if (!comment) {
      return res.status(404).json({ error: '文章不存在' })
    }

    res.status(201).json(comment)
  } catch (error) {
    res.status(500).json({ error: '添加评论失败' })
  }
})

// 删除评论
router.delete('/:id/comments/:commentId', async (req: Request, res: Response) => {
  try {
    const success = await commentService.deleteComment(req.params.id, req.params.commentId)

    if (!success) {
      return res.status(404).json({ error: '评论不存在' })
    }

    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: '删除评论失败' })
  }
})

// 点赞评论
router.post('/:id/comments/:commentId/like', async (req: Request, res: Response) => {
  try {
    const comment = await commentService.toggleCommentLike(req.params.id, req.params.commentId)

    if (!comment) {
      return res.status(404).json({ error: '评论不存在' })
    }

    res.json({ likes: comment.likes })
  } catch (error) {
    res.status(500).json({ error: '操作失败' })
  }
})

export default router
