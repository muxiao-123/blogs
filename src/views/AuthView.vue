<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-card">
        <h1 class="auth-title">{{ isLogin ? '登录' : '注册' }}</h1>

        <form @submit.prevent="handleSubmit" class="auth-form">
          <div class="form-group" v-if="!isLogin">
            <label>用户名</label>
            <input type="text" v-model="formData.username" placeholder="请输入用户名" required />
          </div>

          <div class="form-group" v-if="!isLogin">
            <label>邮箱</label>
            <input type="email" v-model="formData.email" placeholder="请输入邮箱" required />
          </div>

          <div class="form-group">
            <label>账号</label>
            <input type="text" v-model="formData.username" placeholder="请输入账号" required />
          </div>

          <div class="form-group">
            <label>密码</label>
            <input type="password" v-model="formData.password" placeholder="请输入密码" required />
          </div>

          <div class="form-group" v-if="!isLogin">
            <label>确认密码</label>
            <input
              type="password"
              v-model="formData.confirmPassword"
              placeholder="请再次输入密码"
              required
            />
          </div>

          <div class="error-message" v-if="error">{{ error }}</div>

          <button type="submit" class="submit-btn" :disabled="loading">
            {{ loading ? '处理中...' : isLogin ? '登录' : '注册' }}
          </button>
        </form>

        <div class="auth-switch">
          <span>{{ isLogin ? '还没有账号？' : '已有账号？' }}</span>
          <a href="#" @click.prevent="toggleMode">
            {{ isLogin ? '立即注册' : '立即登录' }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const isLogin = ref(true)
const loading = ref(false)
const error = ref('')

const formData = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const toggleMode = () => {
  isLogin.value = !isLogin.value
  error.value = ''
  formData.username = ''
  formData.email = ''
  formData.password = ''
  formData.confirmPassword = ''
}

const handleSubmit = async () => {
  error.value = ''

  if (!isLogin.value) {
    if (formData.password !== formData.confirmPassword) {
      error.value = '两次输入的密码不一致'
      return
    }
    if (formData.password.length < 6) {
      error.value = '密码长度至少6位'
      return
    }
  }

  loading.value = true

  try {
    if (isLogin.value) {
      await userStore.login(formData.username, formData.password)
    } else {
      await userStore.register(formData.username, formData.email, formData.password)
    }

    // 登录成功后跳转到redirect参数指定的页面，或默认跳转首页
    const redirectUrl = (route.query.redirect as string) || localStorage.getItem('targetPath')
    const targetPath = redirectUrl || '/'

    // 清除保存的数据
    localStorage.removeItem('targetScrollY')
    localStorage.removeItem('targetPath')

    // 使用 Vue Router 跳转，不刷新页面
    router.push(targetPath)
  } catch (e: any) {
    error.value = e.message || '操作失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding: 40px 20px;
}

.auth-container {
  width: 100%;
  max-width: 420px;
}

.auth-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
}

.auth-title {
  text-align: center;
  color: #fff;
  font-size: 2rem;
  margin-bottom: 30px;
  font-weight: 600;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.form-group input {
  width: 100%;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  color: #fff;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #00d9ff;
  background: rgba(255, 255, 255, 0.12);
}

.form-group input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.error-message {
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  font-size: 0.9rem;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #00d9ff 0%, #7b61ff 100%);
  border: none;
  border-radius: 10px;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 217, 255, 0.3);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-switch {
  text-align: center;
  margin-top: 24px;
  color: rgba(255, 255, 255, 0.6);
}

.auth-switch a {
  color: #00d9ff;
  text-decoration: none;
  margin-left: 8px;
  font-weight: 500;
  transition: color 0.3s ease;
}

.auth-switch a:hover {
  color: #7b61ff;
}
</style>
