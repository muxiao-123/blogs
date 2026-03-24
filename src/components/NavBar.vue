<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { api } from '@/api'
import ThemeToggle from './ThemeToggle.vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)
const isUserMenuOpen = ref(false)
const unreadCount = ref(0)

const loginRedirect = computed(() => route.fullPath)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  // 打开/关闭菜单时控制页面滚动
  if (isMobileMenuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
  document.body.style.overflow = ''
}

// 点击登录按钮时保存当前滚动位置
const handleLoginClick = () => {
  const scrollY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop
  localStorage.setItem('targetScrollY', String(scrollY))
  // 同时保存当前路径作为备用
  localStorage.setItem('targetPath', route.fullPath)
  closeMobileMenu()
}

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

const closeUserMenu = () => {
  isUserMenuOpen.value = false
}

const handleLogout = () => {
  userStore.logout()
  isMobileMenuOpen.value = false
  isUserMenuOpen.value = false
  router.push('/')
}

const menuItems = [
  { icon: 'user', label: '我的主页', path: '/profile' },
  { icon: 'message', label: '消息', path: '/messages', hasBadge: true },
  { icon: 'heart', label: '收藏夹', path: '/favorites' },
  { icon: 'settings', label: '设置', path: '/settings' },
  { icon: 'help', label: '帮助与反馈', path: '/help' },
]

// 加载未读消息数
const loadUnreadCount = async () => {
  if (!userStore.isLoggedIn) return
  try {
    const result = await api.getUnreadCount()
    unreadCount.value = result.count
  } catch (e) {
    console.error('获取未读消息数失败:', e)
  }
}

onMounted(async () => {
  window.addEventListener('scroll', handleScroll)
  await userStore.init()
  
  if (userStore.isLoggedIn) {
    loadUnreadCount()
  }
  
  // 点击其他区域关闭用户菜单
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.user-menu-wrapper')) {
      isUserMenuOpen.value = false
    }
  })
})

// 监听登录状态变化
watch(() => userStore.isLoggedIn, (loggedIn) => {
  if (loggedIn) {
    loadUnreadCount()
  } else {
    unreadCount.value = 0
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', () => {})
})
</script>

<template>
  <nav class="navbar" :class="{ scrolled: isScrolled }">
    <div class="navbar-container">
      <router-link to="/" class="logo">
        <span class="logo-icon">◈</span>
        <span class="logo-text">Lumina</span>
      </router-link>

      <button class="mobile-toggle" @click="toggleMobileMenu" aria-label="Toggle menu">
        <span class="bar" :class="{ active: isMobileMenuOpen }"></span>
        <span class="bar" :class="{ active: isMobileMenuOpen }"></span>
        <span class="bar" :class="{ active: isMobileMenuOpen }"></span>
      </button>

      <div class="nav-links" :class="{ open: isMobileMenuOpen }">
        <router-link to="/" class="nav-link" @click="closeMobileMenu">首页</router-link>
        <router-link to="/category/frontend" class="nav-link" @click="closeMobileMenu">前端</router-link>
        <router-link to="/category/backend" class="nav-link" @click="closeMobileMenu">后端</router-link>
        <router-link to="/category/fullstack" class="nav-link" @click="closeMobileMenu">全栈</router-link>
        
        <!-- 消息入口 -->
        <router-link to="/messages" class="message-link" @click="closeMobileMenu">
          消息
          <span v-if="unreadCount > 0" class="message-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
        </router-link>
        
        <ThemeToggle />
        
        <!-- 登录/注册或用户信息 -->
        <template v-if="!userStore.isLoggedIn">
          <router-link :to="`/auth?redirect=${loginRedirect}`" class="auth-btn" @click="handleLoginClick">
            登录
          </router-link>
          <!-- 写文章按钮 -->
          <router-link to="/create" class="create-btn" @click="closeMobileMenu">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            写文章
          </router-link>
        </template>
        <template v-else>
          <div class="user-menu-wrapper">
            <button class="user-trigger" @click="toggleUserMenu">
              <img :src="userStore.user?.avatar" alt="avatar" class="user-avatar" />
              <span class="user-name">{{ userStore.user?.username }}</span>
              <svg class="arrow-icon" :class="{ open: isUserMenuOpen }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            
            <div class="user-dropdown" v-show="isUserMenuOpen">
              <div class="dropdown-user-info">
                <img :src="userStore.user?.avatar" alt="avatar" class="dropdown-avatar" />
                <div class="dropdown-user-text">
                  <span class="dropdown-username">{{ userStore.user?.username }}</span>
                  <span class="dropdown-email">{{ userStore.user?.email }}</span>
                </div>
              </div>
              
              <div class="dropdown-divider"></div>
              
              <router-link 
                v-for="item in menuItems" 
                :key="item.path"
                :to="item.path" 
                class="dropdown-item"
                @click="closeUserMenu"
              >
                <svg v-if="item.icon === 'user'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <svg v-if="item.icon === 'message'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <span v-if="item.hasBadge && unreadCount > 0" class="dropdown-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
                <svg v-if="item.icon === 'heart'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <svg v-if="item.icon === 'star'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                <svg v-if="item.icon === 'settings'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                <svg v-if="item.icon === 'help'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                {{ item.label }}
              </router-link>
              
              <div class="dropdown-divider"></div>
              
              <button class="dropdown-item logout" @click="handleLogout">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                退出登录
              </button>
            </div>
          </div>
        </template>

        <!-- 写文章按钮 - 仅登录用户显示 -->
        <router-link v-if="userStore.isLoggedIn" to="/create" class="create-btn" @click="closeMobileMenu">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          写文章
        </router-link>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: var(--space-md) 0;
  background: transparent;
  transition: all var(--transition-base);
}

.navbar.scrolled {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border-bottom: 1px solid var(--color-border);
  padding: var(--space-sm) 0;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.logo-icon {
  color: var(--color-primary);
  font-size: 1.8rem;
  animation: float 3s ease-in-out infinite;
}

.logo-text {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: var(--space-xl);
}

.nav-link {
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  position: relative;
  transition: color var(--transition-fast);
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--color-primary);
  transition: width var(--transition-base);
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--color-primary);
}

.nav-link:hover::after,
.nav-link.router-link-active::after {
  width: 100%;
}

.favorites-link {
  display: flex;
  align-items: center;
  gap: 4px;
}

.favorites-link:hover,
.favorites-link.router-link-active {
  color: #fbbf24;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  border-radius: 50px;
  font-family: var(--font-display);
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
  transition: all var(--transition-base);
}

.create-btn:hover {
  box-shadow: var(--glow-primary);
  transform: translateY(-2px);
}

/* 消息链接 */
.message-link {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all var(--transition-base);
}

.message-link:hover {
  color: var(--color-primary);
  background: rgba(0, 217, 255, 0.1);
}

.message-badge {
  position: absolute;
  top: 0;
  right: 0;
  min-width: 18px;
  height: 18px;
  background: #ff6b6b;
  color: white;
  font-size: 0.65rem;
  font-weight: 600;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

/* 下拉菜单徽章 */
.dropdown-badge {
  min-width: 16px;
  height: 16px;
  background: #ff6b6b;
  color: white;
  font-size: 0.6rem;
  font-weight: 600;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  margin-left: auto;
}

.dropdown-item .dropdown-badge {
  position: static;
}

.mobile-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  padding: var(--space-sm);
}

.bar {
  width: 24px;
  height: 2px;
  background: var(--color-text-primary);
  transition: all var(--transition-base);
}

.bar.active:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.bar.active:nth-child(2) {
  opacity: 0;
}

.bar.active:nth-child(3) {
  transform: rotate(-45deg) translate(5px, -5px);
}

.auth-btn {
  padding: 8px 20px;
  background: transparent;
  border: 1px solid var(--color-primary);
  border-radius: 50px;
  color: var(--color-primary);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all var(--transition-base);
}

.auth-btn:hover {
  background: var(--color-primary);
  color: white;
}

/* 用户菜单 */
.user-menu-wrapper {
  position: relative;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 50px;
  cursor: pointer;
  transition: all var(--transition-base);
}

.user-trigger:hover {
  background: var(--glass-bg);
  border-color: var(--color-border);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--color-primary);
  object-fit: cover;
}

.user-name {
  color: var(--color-text-primary);
  font-size: 0.9rem;
  font-weight: 500;
}

.arrow-icon {
  color: var(--color-text-secondary);
  transition: transform var(--transition-fast);
}

.arrow-icon.open {
  transform: rotate(180deg);
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 240px;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  z-index: 1001;
  animation: dropdownFadeIn 0.2s ease;
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
}

.dropdown-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid var(--color-primary);
  object-fit: cover;
}

.dropdown-user-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dropdown-username {
  color: var(--color-text-primary);
  font-size: 0.95rem;
  font-weight: 600;
}

.dropdown-email {
  color: var(--color-text-muted);
  font-size: 0.8rem;
}

.dropdown-divider {
  height: 1px;
  background: var(--color-border);
  margin: 0 12px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  text-decoration: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.dropdown-item:hover {
  background: rgba(0, 217, 255, 0.1);
  color: var(--color-primary);
}

.dropdown-item.logout {
  color: var(--color-text-secondary);
}

.dropdown-item.logout:hover {
  background: rgba(255, 107, 107, 0.1);
  color: #ff6b6b;
}

@media (max-width: 768px) {
  .mobile-toggle {
    display: flex;
  }

  .nav-links {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    padding: var(--space-lg);
    gap: var(--space-md);
    border-bottom: 1px solid var(--color-border);
    transform: translateY(-100%);
    opacity: 0;
    pointer-events: none;
    transition: all var(--transition-base);
  }

  .nav-links.open {
    transform: translateY(0);
    opacity: 1;
    pointer-events: auto;
  }

  /* 用户菜单响应式 */
  .user-menu-wrapper {
    width: 100%;
  }

  .user-trigger {
    width: 100%;
    justify-content: center;
    padding: 12px 8px;
  }

  .user-name {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .user-dropdown {
    position: fixed;
    top: auto;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    max-height: 70vh;
    overflow-y: auto;
    border-radius: 16px 16px 0 0;
    border-bottom: none;
    box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.3);
  }

  .dropdown-user-info {
    padding: 20px;
  }

  .dropdown-item {
    padding: 16px 20px;
    font-size: 1rem;
  }
}
</style>
