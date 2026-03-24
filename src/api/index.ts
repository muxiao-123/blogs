// 文章类型（需要与 types/index.ts 保持一致）
export interface Article {
  id: string
  title: string
  excerpt: string
  content: string
  cover: string
  category: string
  tags: string[]
  author: {
    id?: string
    name: string
    avatar: string
    bio?: string
  }
  publishDate: string
  readTime: number
  views: number
  likes: number
  isLiked?: boolean
  isFavorited?: boolean
  favorites: number
  comments: Comment[]
}

export interface Comment {
  id: string
  author: {
    id?: string
    name: string
    avatar: string
  }
  content: string
  createTime: string
  likes: number
  isRead?: boolean
}

export interface CategoryInfo {
  key: string
  label: string
  color: string
}

export interface CreateArticleInput {
  title: string
  content: string
  excerpt: string
  cover: string
  category: string
  tags: string[]
}

// 使用环境变量，支持开发/生产环境切换
console.log(import.meta.env.VITE_API_BASE)
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api'

// 用户类型
export interface User {
  id: string
  username: string
  email: string
  avatar: string
  bio: string
  favorites: string[]
  likes: string[]
  createdAt: string
}

// 消息相关类型
export interface Message {
  id: string
  senderId: string
  senderUsername: string
  senderAvatar: string
  receiverId: string
  receiverUsername: string
  content: string
  isRead: boolean
  createdAt: string
}

export interface Conversation {
  userId: string
  username: string
  avatar: string
  lastMessage: Message
  unreadCount: number
}

class ApiService {
  private async request<T>(url: string, options?: RequestInit): Promise<T> {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    // 添加自定义 headers
    if (options?.headers) {
      const customHeaders = options.headers as Record<string, string>
      Object.assign(headers, customHeaders)
    }
    
    // 如果存在token，添加到请求头
    if (token) {
      const cleanToken = token.trim()
      console.log('API request with token:', cleanToken.substring(0, 20) + '...')
      headers['Authorization'] = `Bearer ${cleanToken}`
    } else {
      console.log('API request without token')
    }
    
    const response = await fetch(url, {
      ...options,
      headers
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: '请求失败' }))
      throw new Error(error.error || '请求失败')
    }

    if (response.status === 204) {
      return null as T
    }

    return response.json()
  }

  // 获取所有文章
  async getArticles(params?: { category?: string; tag?: string; q?: string }): Promise<Article[]> {
    const searchParams = new URLSearchParams()
    if (params?.category) searchParams.set('category', params.category)
    if (params?.tag) searchParams.set('tag', params.tag)
    if (params?.q) searchParams.set('q', params.q)

    const query = searchParams.toString()
    return this.request<Article[]>(`${API_BASE}/articles${query ? `?${query}` : ''}`)
  }

  // 获取单个文章
  async getArticle(id: string): Promise<Article> {
    return this.request<Article>(`${API_BASE}/articles/${id}`)
  }

  // 获取单个文章（带用户点赞状态）
  async getArticleById(id: string): Promise<Article> {
    return this.request<Article>(`${API_BASE}/articles/${id}`)
  }

  // 创建文章
  async createArticle(input: CreateArticleInput): Promise<Article> {
    return this.request<Article>(`${API_BASE}/articles`, {
      method: 'POST',
      body: JSON.stringify(input)
    })
  }

  // 更新文章
  async updateArticle(id: string, input: Partial<CreateArticleInput>): Promise<Article> {
    return this.request<Article>(`${API_BASE}/articles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input)
    })
  }

  // 删除文章
  async deleteArticle(id: string): Promise<void> {
    return this.request<void>(`${API_BASE}/articles/${id}`, {
      method: 'DELETE'
    })
  }

  // 点赞/取消点赞文章
  async toggleArticleLike(id: string): Promise<{ likes: number; isLiked: boolean }> {
    return this.request<{ likes: number; isLiked: boolean }>(`${API_BASE}/articles/${id}/like`, {
      method: 'POST'
    })
  }

  // 获取所有分类
  async getCategories(): Promise<CategoryInfo[]> {
    return this.request<CategoryInfo[]>(`${API_BASE}/articles/categories`)
  }

  // 获取所有标签
  async getTags(): Promise<string[]> {
    return this.request<string[]>(`${API_BASE}/articles/tags`)
  }

  // 获取全局统计
  async getStats(): Promise<{ articleCount: number; totalViews: number; totalSubscribers: number }> {
    return this.request<{ articleCount: number; totalViews: number; totalSubscribers: number }>(`${API_BASE}/articles/stats`)
  }

  // 获取用户（作者）文章统计
  async getUserStats(author: string): Promise<{ articleCount: number; totalViews: number; totalLikes: number }> {
    return this.request<{ articleCount: number; totalViews: number; totalLikes: number }>(`${API_BASE}/articles/user/stats?author=${encodeURIComponent(author)}`)
  }

  // 获取用户收藏的文章
  async getFavorites(): Promise<Article[]> {
    return this.request<Article[]>(`${API_BASE}/articles/favorites`)
  }

  // 添加/取消收藏
  async toggleFavorite(articleId: string): Promise<{ favorited: boolean; favorites?: number }> {
    return this.request<{ favorited: boolean; favorites?: number }>(`${API_BASE}/articles/${articleId}/favorite`, {
      method: 'POST'
    })
  }

  // 检查文章是否已收藏
  async checkFavorite(articleId: string): Promise<{ favorited: boolean }> {
    return this.request<{ favorited: boolean }>(`${API_BASE}/articles/${articleId}/favorite`)
  }

  // 添加评论
  async addComment(articleId: string, content: string, author: { id?: string; name: string; avatar: string }): Promise<Comment> {
    return this.request<Comment>(`${API_BASE}/articles/${articleId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, author })
    })
  }

  // 删除评论
  async deleteComment(articleId: string, commentId: string): Promise<void> {
    return this.request<void>(`${API_BASE}/articles/${articleId}/comments/${commentId}`, {
      method: 'DELETE'
    })
  }

  // 点赞评论
  async toggleCommentLike(articleId: string, commentId: string): Promise<{ likes: number }> {
    return this.request<{ likes: number }>(`${API_BASE}/articles/${articleId}/comments/${commentId}/like`, {
      method: 'POST'
    })
  }

  // 上传图片
  async uploadImage(file: File): Promise<{ url: string }> {
    const token = localStorage.getItem('token')
    const formData = new FormData()
    formData.append('image', file)

    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token.trim()}`
    }

    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers,
      body: formData
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: '上传失败' }))
      throw new Error(error.error || '上传失败')
    }

    const result = await response.json()
    // 转换为完整URL
    return {
      url: result.url.startsWith('http') ? result.url : `${API_BASE.replace('/api', '')}${result.url}`
    }
  }

  // 搜索用户
  async searchUsers(query: string, limit?: number): Promise<Omit<User, 'password'>[]> {
    const params = new URLSearchParams()
    params.set('q', query)
    if (limit) params.set('limit', String(limit))
    return this.request<Omit<User, 'password'>[]>(`${API_BASE}/auth/search?${params.toString()}`)
  }

  // 根据ID获取用户信息
  async getUserById(id: string): Promise<Omit<User, 'password'> | null> {
    return this.request<Omit<User, 'password'> | null>(`${API_BASE}/auth/user/${id}`)
  }

  // 发送消息
  async sendMessage(receiverId: string, receiverUsername: string, content: string): Promise<Message> {
    return this.request<Message>(`${API_BASE}/messages/send`, {
      method: 'POST',
      body: JSON.stringify({ receiverId, receiverUsername, content })
    })
  }

  // 获取与某个用户的对话
  async getConversation(userId: string, limit?: number, skip?: number): Promise<Message[]> {
    const params = new URLSearchParams()
    if (limit) params.set('limit', String(limit))
    if (skip) params.set('skip', String(skip))
    const query = params.toString()
    return this.request<Message[]>(`${API_BASE}/messages/conversation/${userId}${query ? `?${query}` : ''}`)
  }

  // 获取所有对话列表
  async getConversations(): Promise<Conversation[]> {
    return this.request<Conversation[]>(`${API_BASE}/messages/conversations`)
  }

  // 获取未读消息数
  async getUnreadCount(): Promise<{ count: number }> {
    return this.request<{ count: number }>(`${API_BASE}/messages/unread`)
  }

  // 标记消息为已读
  async markAsRead(userId: string): Promise<{ count: number }> {
    return this.request<{ count: number }>(`${API_BASE}/messages/read/${userId}`, {
      method: 'PUT'
    })
  }

  // 标记所有消息为已读
  async markAllAsRead(): Promise<{ count: number }> {
    return this.request<{ count: number }>(`${API_BASE}/messages/read-all`, {
      method: 'PUT'
    })
  }

  // 获取评论通知列表
  async getComments(): Promise<{ comments: any[]; unreadCount: number }> {
    return this.request<{ comments: any[]; unreadCount: number }>(`${API_BASE}/comments/notifications`)
  }

  // 标记评论为已读
  async markCommentAsRead(commentId: string, articleId: string): Promise<void> {
    return this.request<void>(`${API_BASE}/comments/${commentId}/read`, {
      method: 'PUT',
      body: JSON.stringify({ articleId })
    })
  }
}

export const api = new ApiService()
