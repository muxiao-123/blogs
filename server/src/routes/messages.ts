import { Router, Request, Response } from 'express'
import { authService } from '../services/authService'
import { 
  sendMessage, 
  getConversation, 
  getConversations, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead,
  deleteMessage 
} from '../services/messageService'

const router = Router()

// 发送消息
router.post('/send', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: '未登录' })
    }
    
    const currentUser = await authService.verifyToken(token)
    if (!currentUser) {
      return res.status(401).json({ error: 'Token无效' })
    }
    
    const { receiverId, receiverUsername, content } = req.body
    
    if (!receiverId || !receiverUsername || !content) {
      return res.status(400).json({ error: '缺少必要字段' })
    }
    
    if (!content.trim()) {
      return res.status(400).json({ error: '消息内容不能为空' })
    }
    
    // 不能给自己发消息
    if (receiverId === currentUser.id) {
      return res.status(400).json({ error: '不能给自己发消息' })
    }
    
    const message = await sendMessage(
      currentUser.id,
      currentUser.username,
      currentUser.avatar,
      receiverId,
      receiverUsername,
      content
    )
    
    res.status(201).json(message)
  } catch (error: any) {
    res.status(400).json({ error: error.message || '发送消息失败' })
  }
})

// 获取与某个用户的对话
router.get('/conversation/:userId', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: '未登录' })
    }
    
    const currentUser = await authService.verifyToken(token)
    if (!currentUser) {
      return res.status(401).json({ error: 'Token无效' })
    }
    
    const { userId } = req.params
    const limit = parseInt(req.query.limit as string) || 50
    const skip = parseInt(req.query.skip as string) || 0
    
    const messages = await getConversation(currentUser.id, userId, limit, skip)
    
    res.json(messages)
  } catch (error: any) {
    res.status(400).json({ error: error.message || '获取对话失败' })
  }
})

// 获取所有对话列表
router.get('/conversations', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: '未登录' })
    }
    
    const currentUser = await authService.verifyToken(token)
    if (!currentUser) {
      return res.status(401).json({ error: 'Token无效' })
    }
    
    const conversations = await getConversations(currentUser.id)
    
    res.json(conversations)
  } catch (error: any) {
    res.status(400).json({ error: error.message || '获取对话列表失败' })
  }
})

// 获取未读消息数
router.get('/unread', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: '未登录' })
    }
    
    const currentUser = await authService.verifyToken(token)
    if (!currentUser) {
      return res.status(401).json({ error: 'Token无效' })
    }
    
    const count = await getUnreadCount(currentUser.id)
    
    res.json({ count })
  } catch (error: any) {
    res.status(400).json({ error: error.message || '获取未读消息数失败' })
  }
})

// 标记与某个用户的消息为已读
router.put('/read/:userId', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: '未登录' })
    }
    
    const currentUser = await authService.verifyToken(token)
    if (!currentUser) {
      return res.status(401).json({ error: 'Token无效' })
    }
    
    const { userId } = req.params
    
    const count = await markAsRead(currentUser.id, userId)
    
    res.json({ count })
  } catch (error: any) {
    res.status(400).json({ error: error.message || '标记已读失败' })
  }
})

// 标记所有消息为已读
router.put('/read-all', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: '未登录' })
    }
    
    const currentUser = await authService.verifyToken(token)
    if (!currentUser) {
      return res.status(401).json({ error: 'Token无效' })
    }
    
    const count = await markAllAsRead(currentUser.id)
    
    res.json({ count })
  } catch (error: any) {
    res.status(400).json({ error: error.message || '标记已读失败' })
  }
})

// 删除消息
router.delete('/:messageId', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: '未登录' })
    }
    
    const currentUser = await authService.verifyToken(token)
    if (!currentUser) {
      return res.status(401).json({ error: 'Token无效' })
    }
    
    const { messageId } = req.params
    
    const success = await deleteMessage(messageId, currentUser.id)
    
    if (!success) {
      return res.status(404).json({ error: '消息不存在' })
    }
    
    res.json({ success: true })
  } catch (error: any) {
    res.status(400).json({ error: error.message || '删除消息失败' })
  }
})

export default router
