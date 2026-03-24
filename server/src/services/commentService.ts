import { Comment, AddCommentInput } from '../types'
import { CommentModel } from '../models/Article'
import { articleService } from './articleService'
import { authService } from './authService'
import { v4 as uuidv4 } from 'uuid'

let commentModel: CommentModel | null = null

export function initCommentService(model: CommentModel) {
  commentModel = model
}

class CommentService {
  // 添加评论
  async addComment(input: AddCommentInput): Promise<Comment | null> {
    if (!commentModel) throw new Error('CommentService not initialized')

    const article = await articleService.getById(input.articleId)
    if (!article) return null

    const newComment: Comment = {
      id: uuidv4(),
      author: input.author,
      content: input.content,
      createTime: new Date().toISOString(),
      likes: 0,
      isRead: false
    }

    // 保存评论到数据库
    const savedComment = await commentModel.addComment(input.articleId, newComment)

    // 更新文章的评论数
    await articleService.update(input.articleId, {
      comments: [...article.comments, savedComment]
    } as any)

    return savedComment
  }

  // 删除评论
  async deleteComment(articleId: string, commentId: string): Promise<boolean> {
    if (!commentModel) throw new Error('CommentService not initialized')

    const article = await articleService.getById(articleId)
    if (!article) return false

    const success = await commentModel.deleteComment(articleId, commentId)
    if (success) {
      // 更新文章的评论列表
      const updatedComments = article.comments.filter(c => c.id !== commentId)
      await articleService.update(articleId, { comments: updatedComments } as any)
    }

    return success
  }

  // 点赞评论
  async toggleCommentLike(articleId: string, commentId: string): Promise<Comment | null> {
    if (!commentModel) throw new Error('CommentService not initialized')

    const article = await articleService.getById(articleId)
    if (!article) return null

    const comment = article.comments.find(c => c.id === commentId)
    if (!comment) return null

    // 更新数据库
    const updatedComment = await commentModel.toggleLike(articleId, commentId)
    if (updatedComment) {
      // 更新文章的评论列表
      const updatedComments = article.comments.map(c =>
        c.id === commentId ? { ...c, likes: updatedComment.likes } : c
      )
      await articleService.update(articleId, { comments: updatedComments } as any)
    }

    return updatedComment
  }

  // 获取当前用户的评论通知
  async getNotifications(userId: string): Promise<{ comments: any[]; unreadCount: number }> {
    const articles = await articleService.getAll()
    
    // 获取当前用户信息
    const user = await authService.getUserById(userId)
    if (!user) {
      return { comments: [], unreadCount: 0 }
    }
    
    const userComments: any[] = []
    let unreadCount = 0
    
    for (const article of articles) {
      // 检查是否是当前用户的文章：通过 id 或 username 匹配
      const isUserArticle = article.author.id === userId || 
                           article.author.name === user.username
      
      if (isUserArticle && article.comments) {
        for (const comment of article.comments) {
          // 排除自己的评论：通过 id 或 name 匹配
          const isOwnComment = comment.author.id === userId || 
                              comment.author.name === user.username
          
          if (!isOwnComment) {
            userComments.push({
              id: comment.id,
              content: comment.content,
              author: comment.author,
              articleId: article.id,
              articleTitle: article.title,
              isRead: comment.isRead || false,
              createdAt: comment.createTime
            })
            if (!comment.isRead) {
              unreadCount++
            }
          }
        }
      }
    }
    
    // 按时间倒序排列
    userComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    return { comments: userComments, unreadCount }
  }

  // 标记评论为已读
  async markAsRead(articleId: string, commentId: string): Promise<boolean> {
    if (!commentModel) throw new Error('CommentService not initialized')
    
    const article = await articleService.getById(articleId)
    if (!article) return false
    
    const comment = article.comments.find(c => c.id === commentId)
    if (!comment) return false
    
    // 更新评论的已读状态
    const updatedComment = await commentModel.updateComment(articleId, commentId, { isRead: true })
    return !!updatedComment
  }
}

export const commentService = new CommentService()
