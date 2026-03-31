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
        user.value = await response.json()
      } else {
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

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '注册失败')
      }

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

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '登录失败')
      }

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

      if (!response.ok) {
        throw new Error(result.error || '更新失败')
      }

      user.value = result
      return result
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
