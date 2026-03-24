import { Router, Request, Response } from 'express'
import { authService } from '../services/authService'

const router = Router()

// 搜索用户
router.get('/search', async (req: Request, res: Response) => {
  try {
    const { q, limit } = req.query
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: '请提供搜索关键词' })
    }
    
    const users = await authService.searchUsers(q, limit ? parseInt(limit as string) : 10)
    
    res.json(users)
  } catch (error: any) {
    res.status(400).json({ error: error.message || '搜索失败' })
  }
})

// 根据ID获取用户信息
router.get('/user/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    
    const user = await authService.getUserByIdSimple(id)
    
    if (!user) {
      return res.status(404).json({ error: '用户不存在' })
    }
    
    res.json(user)
  } catch (error: any) {
    res.status(400).json({ error: error.message || '获取用户信息失败' })
  }
})

// 注册
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({ error: '缺少必要字段' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: '密码长度至少6位' })
    }

    const result = await authService.register(username, email, password)

    res.status(201).json(result)
  } catch (error: any) {
    res.status(400).json({ error: error.message || '注册失败' })
  }
})

// 登录
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: '缺少必要字段' })
    }

    const result = await authService.login(username, password)

    res.json(result)
  } catch (error: any) {
    res.status(401).json({ error: error.message || '登录失败' })
  }
})

// 获取当前用户信息
router.get('/me', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ error: '未登录' })
    }

    const user = await authService.verifyToken(token)

    if (!user) {
      return res.status(401).json({ error: 'Token无效' })
    }

    res.json(user)
  } catch (error: any) {
    res.status(401).json({ error: '获取用户信息失败' })
  }
})

// 更新用户信息
router.put('/profile', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({ error: '未登录' })
    }

    const currentUser = await authService.verifyToken(token)
    if (!currentUser) {
      return res.status(401).json({ error: 'Token无效' })
    }

    const { username, email, bio, avatar } = req.body

    const updatedUser = await authService.updateUser(currentUser.id, {
      username,
      email,
      bio,
      avatar
    })

    if (!updatedUser) {
      return res.status(404).json({ error: '用户不存在' })
    }

    res.json(updatedUser)
  } catch (error: any) {
    res.status(400).json({ error: error.message || '更新失败' })
  }
})

export default router
