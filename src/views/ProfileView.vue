<template>
  <div class="profile-view">
    <NavBar />
    <main class="main-content">
      <!-- 头部封面 -->
      <div class="profile-cover">
        <div class="cover-gradient"></div>
      </div>

      <div class="content-container">
        <!-- 用户信息卡片 -->
        <div class="profile-card">
          <div class="profile-header">
            <div class="avatar-wrapper">
              <img :src="formData.avatar" alt="头像" class="profile-avatar" />
              <button class="edit-avatar-btn" @click="showEditModal = true">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
                  ></path>
                  <circle cx="12" cy="13" r="4"></circle>
                </svg>
              </button>
            </div>

            <div class="profile-info">
              <div class="name-row">
                <h1 class="profile-username">{{ userStore.user?.username }}</h1>
                <button class="edit-btn" @click="showEditModal = true">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  编辑资料
                </button>
              </div>
              <p class="profile-email">{{ userStore.user?.email }}</p>
              <p class="profile-bio">{{ formData.bio || '这个人很懒，什么都没写~' }}</p>
            </div>
          </div>

          <!-- 统计数据 -->
          <div class="stats-row">
            <div class="stat-item">
              <span class="stat-value">{{ stats.articleCount }}</span>
              <span class="stat-label">文章</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ stats.totalLikes }}</span>
              <span class="stat-label">获赞</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ stats.totalViews }}</span>
              <span class="stat-label">访问</span>
            </div>
          </div>
        </div>

        <!-- 内容标签页 -->
        <div class="content-tabs">
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'articles' }"
            @click="activeTab = 'articles'"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
            我的文章
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'drafts' }"
            @click="activeTab = 'drafts'"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            草稿箱
          </button>
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'liked' }"
            @click="activeTab = 'liked'"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polygon
                points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
              />
            </svg>
            收藏的文章
          </button>
        </div>

        <!-- 文章列表 -->
        <div class="articles-section">
          <div v-if="loading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>加载中...</p>
          </div>

          <div v-else-if="activeTab === 'liked' && likedArticles.length === 0" class="empty-state">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <polygon
                points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
              />
            </svg>
            <p>还没有收藏的文章</p>
            <router-link to="/" class="create-link">开始探索</router-link>
          </div>

          <div
            v-else-if="activeTab === 'articles' && userArticles.length === 0"
            class="empty-state"
          >
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            <p>还没有发布任何文章</p>
            <router-link to="/create" class="create-link">写一篇新文章</router-link>
          </div>

          <div
            v-else-if="activeTab === 'drafts' && draftsArticles.length === 0"
            class="empty-state"
          >
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            <p>草稿箱是空的</p>
          </div>

          <div v-else>
            <!-- 排序按钮 -->
            <div class="sort-section">
              <span class="sort-label">排序：</span>
              <button
                class="sort-btn"
                :class="{ active: sortBy === 'publishDate' }"
                @click="handleSortChange('publishDate')"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                最新
              </button>
              <button
                class="sort-btn"
                :class="{ active: sortBy === 'views' }"
                @click="handleSortChange('views')"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                热门
              </button>
              <span class="article-count">({{ currentArticles.length }}篇文章)</span>
            </div>

            <div class="article-list">
              <article v-for="article in currentArticles" :key="article.id" class="article-item">
                <div class="article-cover-wrapper">
                  <router-link
                    :to="activeTab === 'articles' ? `/article/${article.id}` : '#'"
                    class="article-cover-link"
                  >
                    <img :src="article.cover" :alt="article.title" class="article-cover" />
                  </router-link>
                  <!-- 编辑和删除按钮，仅在文章列表显示 -->
                  <div v-if="activeTab === 'articles'" class="article-actions">
                    <button
                      class="action-btn edit"
                      @click.stop="handleEdit(article.id)"
                      title="编辑"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button
                      class="action-btn delete"
                      @click.stop="confirmDelete(article.id)"
                      title="删除"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path
                          d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                        ></path>
                      </svg>
                    </button>
                  </div>
                </div>
                <div class="article-content">
                  <div class="article-meta">
                    <span class="article-category">{{ article.category }}</span>
                    <span class="article-date">{{ formatDate(article.publishDate) }}</span>
                  </div>
                  <router-link :to="`/article/${article.id}`" class="article-title">
                    {{ article.title }}
                  </router-link>
                  <p class="article-excerpt">{{ article.excerpt }}</p>
                  <div class="article-stats">
                    <span class="stat">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      {{ article.views }}
                    </span>
                    <span class="stat">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                        ></path>
                      </svg>
                      {{ article.likes }}
                    </span>
                    <span class="stat">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <path
                          d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                        ></path>
                      </svg>
                      {{ article.comments?.length || 0 }}
                    </span>
                    <span class="stat">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      {{ article.readTime }} min
                    </span>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 删除确认弹窗 -->
    <div class="modal-overlay" v-show="showDeleteModal" @click.self="cancelDelete">
      <div class="delete-modal">
        <div class="delete-icon">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h3>确认删除</h3>
        <p>确定要删除这篇文章吗？此操作不可恢复，请谨慎操作。</p>
        <div class="delete-actions">
          <button class="cancel-btn" @click="cancelDelete">取消</button>
          <button class="confirm-delete-btn" @click="handleDelete">确认删除</button>
        </div>
      </div>
    </div>

    <SiteFooter />

    <!-- 编辑资料弹窗 -->
    <div class="modal-overlay" v-show="showEditModal" @click.self="showEditModal = false">
      <div class="edit-modal">
        <div class="modal-header">
          <h2>编辑资料</h2>
          <button class="close-btn" @click="showEditModal = false">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="edit-form">
          <div class="form-group">
            <label>用户名</label>
            <input type="text" v-model="formData.username" placeholder="请输入用户名" required />
          </div>

          <div class="form-group">
            <label>邮箱</label>
            <input type="email" v-model="formData.email" placeholder="请输入邮箱" required />
          </div>

          <div class="form-group">
            <label>头像链接</label>
            <input type="url" v-model="formData.avatar" placeholder="请输入头像链接" />
          </div>

          <div class="form-group">
            <label>个人简介</label>
            <textarea v-model="formData.bio" placeholder="请输入个人简介" rows="3"></textarea>
          </div>

          <div class="error-message" v-if="error">{{ error }}</div>
          <div class="success-message" v-if="success">{{ success }}</div>

          <button type="submit" class="submit-btn" :disabled="loading">
            {{ loading ? '保存中...' : '保存修改' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useArticleStore } from '@/stores/articles'
import NavBar from '@/components/NavBar.vue'
import SiteFooter from '@/components/SiteFooter.vue'

const router = useRouter()
const articleStore = useArticleStore()
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api'

interface Article {
  id: string
  title: string
  excerpt: string
  cover: string
  category: string
  tags: string[]
  author: { name: string; avatar: string }
  publishDate: string
  readTime: number
  views: number
  likes: number
  comments: any[]
}

const userStore = useUserStore()

const loading = ref(false)
const error = ref('')
const success = ref('')
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const articleToDelete = ref<string | null>(null)
const activeTab = ref('articles')
const userArticles = ref<Article[]>([])
const sortBy = ref<'publishDate' | 'views'>('publishDate')

// 排序后的用户文章
const sortedUserArticles = computed(() => {
  console.log('Computing sortedUserArticles, userArticles:', userArticles.value.length)
  if (userArticles.value.length === 0) {
    console.log('No articles to sort')
    return []
  }
  const articles = [...userArticles.value]
  console.log('Articles after spread:', articles.length, 'first article:', articles[0])
  console.log('First article fields:', {
    id: articles[0].id,
    title: articles[0].title,
    publishDate: articles[0].publishDate,
    views: articles[0].views,
    author: articles[0].author
  })
  if (sortBy.value === 'views') {
    const sorted = articles.sort((a, b) => b.views - a.views)
    console.log('Sorted by views, first article views:', sorted[0]?.views)
    return sorted
  }
  const sorted = articles.sort(
    (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  )
  console.log('Sorted by date, first article date:', sorted[0]?.publishDate)
  return sorted
})

// 草稿箱文章（暂用userArticles，之后可以添加drafts API）
const draftsArticles = computed(() => {
  const articles = [...userArticles.value]
  if (sortBy.value === 'views') {
    return articles.sort((a, b) => b.views - a.views)
  }
  return articles.sort(
    (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  )
})

// 喜欢的文章（从API获取收藏）
const favoriteArticles = ref<Article[]>([])

const fetchFavoriteArticles = async () => {
  const token = localStorage.getItem('token')
  try {
    const response = await fetch(`${API_BASE}/articles/favorites`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    if (response.ok) {
      favoriteArticles.value = await response.json()
    }
  } catch (e) {
    console.error('Failed to fetch favorites:', e)
  }
}

const likedArticles = computed(() => {
  const articles = [...favoriteArticles.value]
  if (sortBy.value === 'views') {
    return articles.sort((a, b) => b.views - a.views)
  }
  return articles.sort(
    (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  )
})

// 当前活动的文章列表
const currentArticles = computed(() => {
  switch (activeTab.value) {
    case 'drafts':
      return draftsArticles.value
    case 'liked':
      return likedArticles.value
    default:
      return sortedUserArticles.value
  }
})

const handleSortChange = (sort: 'publishDate' | 'views') => {
  sortBy.value = sort
}

const stats = ref({
  articleCount: 0,
  totalLikes: 0,
  totalViews: 0
})

const formData = reactive({
  username: '',
  email: '',
  avatar: '',
  bio: ''
})

const fetchUserArticles = async () => {
  if (!userStore.user) {
    console.log('No user, cannot fetch articles')
    return
  }

  loading.value = true
  try {
    const authorName = userStore.user.username
    console.log('Fetching articles for author:', authorName)

    const response = await fetch(`${API_BASE}/articles?author=${authorName}`)
    const data = await response.json()
    console.log('Articles response:', data)
    userArticles.value = data

    // 获取统计数据
    const statsResponse = await fetch(`${API_BASE}/articles/user/stats?author=${authorName}`)
    stats.value = await statsResponse.json()
  } catch (e) {
    console.error('Failed to fetch articles:', e)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  // 先初始化用户信息
  await userStore.init()

  if (userStore.user) {
    formData.username = userStore.user.username
    formData.email = userStore.user.email
    formData.avatar = userStore.user.avatar
    formData.bio = userStore.user.bio
    fetchUserArticles()
    fetchFavoriteArticles()
  }
})

watch(activeTab, (newTab) => {
  // 切换到收藏 tab 时重新获取数据
  if (newTab === 'liked') {
    fetchFavoriteArticles()
  }
})

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

const handleEdit = (articleId: string) => {
  router.push(`/edit/${articleId}`)
}

const confirmDelete = (articleId: string) => {
  articleToDelete.value = articleId
  showDeleteModal.value = true
}

const handleDelete = async () => {
  if (!articleToDelete.value) return

  const success = await articleStore.deleteArticle(articleToDelete.value)
  if (success) {
    userArticles.value = userArticles.value.filter((a) => a.id !== articleToDelete.value)
    stats.value.articleCount--
  }
  showDeleteModal.value = false
  articleToDelete.value = null
}

const cancelDelete = () => {
  showDeleteModal.value = false
  articleToDelete.value = null
}

const handleSubmit = async () => {
  error.value = ''
  success.value = ''

  if (!formData.username.trim()) {
    error.value = '用户名不能为空'
    return
  }

  if (!formData.email.trim()) {
    error.value = '邮箱不能为空'
    return
  }

  loading.value = true

  try {
    await userStore.updateProfile({
      username: formData.username,
      email: formData.email,
      bio: formData.bio,
      avatar: formData.avatar
    })
    success.value = '保存成功'
    setTimeout(() => {
      showEditModal.value = false
      success.value = ''
    }, 1500)
  } catch (e: any) {
    error.value = e.message || '保存失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.profile-view {
  min-height: 100vh;
  overflow-x: hidden;
}

.main-content {
  position: relative;
  background: var(--color-bg-deep);
  padding-bottom: var(--space-2xl);
  overflow-x: hidden;
}

/* 头部封面 */
.profile-cover {
  height: 200px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  position: relative;
}

.cover-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: linear-gradient(to top, var(--color-bg-deep), transparent);
}

.content-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 var(--space-lg);
  position: relative;
  z-index: 2;
  margin-top: -60px;
  overflow-x: hidden;
}

/* 用户信息卡片 */
.profile-card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: var(--space-lg);
}

.profile-header {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
}

.avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.profile-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 4px solid var(--color-bg-deep);
  object-fit: cover;
}

.edit-avatar-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--color-primary);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s;
}

.edit-avatar-btn:hover {
  transform: scale(1.1);
}

.profile-info {
  flex: 1;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 4px;
}

.profile-username {
  color: var(--color-text-primary);
  font-size: 1.5rem;
  font-weight: 700;
}

.edit-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 20px;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.profile-email {
  color: var(--color-text-muted);
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.profile-bio {
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  line-height: 1.5;
}

/* 统计数据 */
.stats-row {
  display: flex;
  gap: 32px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-value {
  color: var(--color-text-primary);
  font-size: 1.25rem;
  font-weight: 700;
}

.stat-label {
  color: var(--color-text-muted);
  font-size: 0.8rem;
}

/* 内容标签页 */
.content-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: var(--space-lg);
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: var(--glass-bg);
}

.tab-btn.active {
  background: var(--color-primary);
  color: white;
}

/* 文章列表 */
.articles-section {
  min-height: 300px;
}

.sort-section {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
}

.sort-label {
  color: var(--color-text-secondary);
  font-size: 14px;
}

.sort-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sort-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.sort-btn.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: var(--color-text-muted);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: var(--color-text-muted);
}

.empty-state svg {
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  margin-bottom: 16px;
}

.create-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
}

.create-link:hover {
  text-decoration: underline;
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.article-item {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: var(--glass-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  transition: all 0.2s;
  overflow-x: hidden;
}

.article-item:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

.article-cover-link {
  flex-shrink: 0;
}

.article-cover-wrapper {
  position: relative;
  flex-shrink: 0;
}

.article-cover {
  width: 200px;
  height: 130px;
  object-fit: cover;
  border-radius: 8px;
}

.article-cover-wrapper .article-actions {
  position: absolute;
  top: 8px;
  left: 8px;
  flex-direction: column;
  gap: 6px;
}

.article-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.article-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.article-category {
  padding: 2px 10px;
  background: rgba(0, 217, 255, 0.15);
  color: var(--color-primary);
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.article-date {
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

.article-title {
  color: var(--color-text-primary);
  font-size: 1.15rem;
  font-weight: 600;
  text-decoration: none;
  margin-bottom: 8px;
  transition: color 0.2s;
}

.article-title:hover {
  color: var(--color-primary);
}

.article-excerpt {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-stats {
  display: flex;
  gap: 16px;
  margin-top: auto;
}

.stat {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.edit-modal {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border);
}

.modal-header h2 {
  color: var(--color-text-primary);
  font-size: 1.25rem;
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 4px;
  display: flex;
  transition: color 0.2s;
}

.close-btn:hover {
  color: var(--color-text-primary);
}

.edit-form {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  background: var(--color-bg-deep);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-primary);
  font-size: 1rem;
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: var(--color-text-muted);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
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

.success-message {
  color: #51cf66;
  background: rgba(81, 207, 102, 0.1);
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
  font-size: 0.9rem;
}

.submit-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--glow-primary);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.article-count {
  color: var(--color-text-muted);
  font-size: 13px;
  margin-left: 8px;
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .name-row {
    flex-direction: column;
  }

  .stats-row {
    justify-content: center;
  }

  .content-tabs {
    flex-wrap: wrap;
    gap: 6px;
  }

  .tab-btn {
    flex: 1;
    min-width: calc(33% - 6px);
    justify-content: center;
    padding: 8px 12px;
    font-size: 0.85rem;
  }

  .tab-btn svg {
    display: none;
  }

  .article-item {
    flex-direction: column;
  }

  .article-cover {
    width: 100%;
    height: 180px;
  }

  .article-stats {
    flex-wrap: wrap;
    gap: 12px;
  }

  .sort-section {
    flex-wrap: wrap;
  }

  .article-count {
    width: 100%;
    margin-left: 0;
    margin-top: 8px;
  }
}

@media (max-width: 480px) {
  .content-container {
    padding: 0 var(--space-md);
  }

  .profile-card {
    padding: 16px;
  }

  .profile-avatar {
    width: 80px;
    height: 80px;
  }

  .stats-row {
    gap: 16px;
  }

  .stat-item {
    flex: 1;
  }

  .stat-value {
    font-size: 1.1rem;
  }
}

/* 文章操作按钮 */
.article-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-btn.edit {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(99, 102, 241, 0.2));
  color: #6366f1;
}

.action-btn.edit:hover {
  background: linear-gradient(135deg, #6366f1, #818cf8);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.action-btn.delete {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.2));
  color: #ef4444;
}

.action-btn.delete:hover {
  background: linear-gradient(135deg, #ef4444, #f87171);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.action-btn svg {
  width: 18px;
  height: 18px;
}

/* 删除确认弹窗 */
.delete-modal {
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 32px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  animation: modal-in 0.3s ease;
}

@keyframes modal-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.delete-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.2));
  border-radius: 50%;
  color: #ef4444;
  margin-bottom: 20px;
}

.delete-modal h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--color-text-primary);
}

.delete-modal p {
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: 28px;
}

.delete-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.delete-modal .cancel-btn {
  padding: 12px 24px;
  background: var(--color-bg-deep);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  color: var(--color-text-primary);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
}

.delete-modal .cancel-btn:hover {
  border-color: var(--color-text-secondary);
  background: var(--color-bg-light);
}

.delete-modal .confirm-delete-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #ef4444, #f87171);
  border: none;
  border-radius: 10px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}

.delete-modal .confirm-delete-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4);
}
</style>
