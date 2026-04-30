import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface User {
  id: string
  username: string
  email: string
  avatar: string
  bio: string
}

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api'

// 解析 RESTful 响应格式
function parseResponse<T>(result: any): T {
  if (result && typeof result === 'object' && 'success' in result) {
    if (!result.success) {
      throw new Error(result.error || result.message || '请求失败')
    }
    return result.data as T
  }
  return result as T
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const loading = ref(false)

  const isLoggedIn = computed(() => !!token.value && !!user.value)

  // 初始化 - 获取当前用户信息
  async function init() {
    if (!token.value) return

    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      })

      if (response.ok) {
        const result = await response.json()
        user.value = parseResponse<User>(result)
      } else if (response.status === 401) {
        // Token 过期或无效，清除 token 强制重新登录
        logout()
      }
    } catch (e) {
      console.error('Failed to get user:', e)
      logout()
    }
  }

  // 注册
  async function register(username: string, email: string, password: string) {
    loading.value = true
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      })

      const result = await response.json()
      const data = parseResponse<{ user: User; token: string }>(result)

      token.value = data.token
      user.value = data.user
      localStorage.setItem('token', data.token)
    } finally {
      loading.value = false
    }
  }

  // 登录
  async function login(username: string, password: string) {
    loading.value = true
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })

      const result = await response.json()
      const data = parseResponse<{ user: User; token: string }>(result)

      token.value = data.token
      user.value = data.user
      localStorage.setItem('token', data.token)
    } finally {
      loading.value = false
    }
  }

  // 登出
  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
  }

  // 获取 token
  function getToken() {
    return token.value
  }

  // 更新用户信息
  async function updateProfile(data: {
    username?: string
    email?: string
    bio?: string
    avatar?: string
  }) {
    if (!token.value) {
      throw new Error('未登录')
    }

    loading.value = true
    try {
      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.value}`
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()
      const parsed = parseResponse<User>(result)

      user.value = parsed
      return parsed
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    token,
    loading,
    isLoggedIn,
    init,
    register,
    login,
    logout,
    getToken,
    updateProfile
  }
})
