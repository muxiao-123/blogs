import { Router, Request, Response } from 'express'
import { commentService } from '../services/commentService'
import { authService } from '../services/authService'

const router = Router()

// 获取当前用户的评论通知列表
router.get('/notifications', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: '未登录' })
    }

    const user = await authService.verifyToken(token)
    if (!user) {
      return res.status(401).json({ error: 'token无效' })
    }

    const result = await commentService.getNotifications(user.id)
    res.json(result)
  } catch (error) {
    console.error('获取评论通知失败:', error)
    res.status(500).json({ error: '获取评论通知失败' })
  }
})

// 标记评论为已读
router.put('/:commentId/read', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ error: '未登录' })
    }

    const user = await authService.verifyToken(token)
    if (!user) {
      return res.status(401).json({ error: 'token无效' })
    }

    // 需要文章ID来标记评论为已读
    const { articleId } = req.body
    if (!articleId) {
      return res.status(400).json({ error: '缺少文章ID' })
    }

    const success = await commentService.markAsRead(articleId, req.params.commentId)
    if (!success) {
      return res.status(404).json({ error: '评论不存在' })
    }

    res.json({ success: true })
  } catch (error) {
    console.error('标记评论已读失败:', error)
    res.status(500).json({ error: '标记评论已读失败' })
  }
})

export default router
