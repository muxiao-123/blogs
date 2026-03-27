<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useArticleStore } from '@/stores/articles'
import { useUserStore } from '@/stores/user'
import { api } from '@/api/index'
import { categories } from '@/data/articles'
import NavBar from '@/components/NavBar.vue'
import LikeButton from '@/components/LikeButton.vue'
import FavoriteButton from '@/components/FavoriteButton.vue'
import CommentSection from '@/components/CommentSection.vue'
import type { Article } from '@/types'

const route = useRoute()
const router = useRouter()
const articleStore = useArticleStore()
const userStore = useUserStore()
const isLoading = ref(true)

// 发消息相关
const showMessageModal = ref(false)
const messageContent = ref('')
const sendingMessage = ref(false)
const authorUserId = ref('')
const authorUsername = ref('')

// 默认图片
const defaultCover = '/default-cover.svg'

// 背景图加载错误处理
const coverError = ref(false)

const handleCoverError = () => {
  coverError.value = true
}

// 发消息给作者
const handleMessageAuthor = async () => {
  if (!article.value?.author?.name) return
  
  // 如果不是登录状态，跳转到登录页
  if (!userStore.isLoggedIn) {
    router.push(`/auth?redirect=${route.fullPath}`)
    return
  }
  
  // 获取作者ID
  try {
    const users = await api.searchUsers(article.value.author.name, 1)
    const author = users.find(u => u.username === article.value?.author?.name)
    if (author) {
      authorUserId.value = author.id
      authorUsername.value = author.username
      showMessageModal.value = true
    } else {
      alert('无法获取作者信息')
    }
  } catch (e) {
    alert('获取作者信息失败')
  }
}

// 发送消息
const sendMessage = async () => {
  if (!messageContent.value.trim() || !authorUserId.value) return
  
  sendingMessage.value = true
  try {
    await api.sendMessage(authorUserId.value, authorUsername.value, messageContent.value.trim())
    showMessageModal.value = false
    messageContent.value = ''
    alert('消息已发送！')
  } catch (e: any) {
    alert(e.message || '发送失败')
  } finally {
    sendingMessage.value = false
  }
}

// 作者统计数据
const authorStats = ref({ articleCount: 0, totalViews: 0, totalLikes: 0 })

// 直接从API获取文章详情
const articleData = ref<Article | null>(null)

const article = computed(() => articleData.value)

const fetchArticle = async () => {
  const id = route.params.id as string
  try {
    const data = await api.getArticleById(id)
    articleData.value = data

    // 获取作者统计数据
    if (data.author?.name) {
      try {
        const stats = await api.getUserStats(data.author.name)
        authorStats.value = stats
      } catch (e) {
        console.error('Failed to fetch author stats:', e)
      }
    }
  } catch (e) {
    console.error('Failed to fetch article:', e)
  } finally {
    isLoading.value = false
  }
}

// 评论添加后刷新文章数据
const handleCommentAdded = async () => {
  await fetchArticle()
}

const categoryInfo = computed(() => {
  if (!article.value) return categories[3]
  return categories.find(c => c.key === article.value!.category) || categories[3]
})

// 获取相关文章（优先匹配度高的，没有则随机）
const relatedArticles = computed(() => {
  if (!article.value) return []

  const currentArticle = article.value
  const allArticles = articleStore.articles

  // 过滤掉当前文章
  let candidates = allArticles.filter(a => a.id !== currentArticle.id)

  // 计算每篇文章的相关度分数
  const scored = candidates.map(a => {
    let score = 0

    // 同分类 +3 分
    if (a.category === currentArticle.category) {
      score += 3
    }

    // 共同标签每个 +2 分
    const commonTags = a.tags?.filter(tag => currentArticle.tags?.includes(tag)) || []
    score += commonTags.length * 2

    // 同作者 +1 分
    if (a.author?.name === currentArticle.author?.name) {
      score += 1
    }

    return { article: a, score }
  })

  // 按相关度排序
  scored.sort((a, b) => b.score - a.score)

  // 取相关度最高的
  let result = scored.filter(s => s.score > 0).map(s => s.article)

  // 如果不足3篇，随机补充
  if (result.length < 3) {
    const remaining = scored
      .filter(s => s.score === 0)
      .map(s => s.article)
      .sort(() => Math.random() - 0.5)

    result = [...result, ...remaining].slice(0, 3)
  }

  return result.slice(0, 3)
})

const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const tocItems = ref<Array<{ id: string; text: string; level: number }>>([])

const hasToc = computed(() => tocItems.value.length > 0)

const parseToc = (content: string) => {
  const headingRegex = /^(#{1,3})\s+(.+)$/gm
  const items: Array<{ id: string; text: string; level: number }> = []
  let match

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2]
    const id = text.toLowerCase().replace(/[^\u4e00-\u9fa5a-z0-9]+/g, '-')
    items.push({ id, text, level })
  }

  return items
}

// 加载文章数据
const loadArticle = async () => {
  // 初始化用户状态
  await userStore.init()

  const id = route.params.id as string
  isLoading.value = true
  articleData.value = null // 清空旧数据
  try {
    if (!articleStore.articles.length) {
      await articleStore.init()
    }
    await fetchArticle()
    if (article.value) {
      tocItems.value = parseToc(article.value.content)
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await loadArticle()
})

// 监听路由变化，解决前进/后退时页面不更新的问题
watch(() => route.params.id, async (newId) => {
  if (newId) {
    await loadArticle()
  }
})

const scrollToSection = (id: string) => {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// 收藏状态变化时刷新页面数据
const handleFavoriteChange = (favorited: boolean) => {
  // 刷新当前文章数据
  articleStore.init()
}

// 点赞状态变化时刷新页面数据
const handleLikeChange = (liked: boolean, likes: number) => {
  // 刷新当前文章数据
  articleStore.init()
}

// 生成安全的 id
const toSafeId = (text: string): string => {
  return text.toLowerCase().replace(/[^\u4e00-\u9fa5a-z0-9]+/g, '-')
}

// Content rendering function
const renderContent = (content: string): string => {
  if (!content) return ''

  let html = content
    // Headers - 使用安全的 id
    .replace(/^### (.+)$/gm, (_match, p1) => `<h3 id="${toSafeId(p1)}">${p1}</h3>`)
    .replace(/^## (.+)$/gm, (_match, p1) => `<h2 id="${toSafeId(p1)}">${p1}</h2>`)
    .replace(/^# (.+)$/gm, (_match, p1) => `<h1 id="${toSafeId(p1)}">${p1}</h1>`)
    // Code blocks
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p>')
    // Wrap in paragraphs
    .replace(/^(?!<[hl]|<pre|<li|<p)(.+)$/gm, '<p>$1</p>')
    // Fix list items
    .replace(/(<li>.*<\/li>)+/g, '<ul>$&</ul>')

  return html
}
</script>

<template>
  <div class="article-view" v-if="!isLoading && article">
    <NavBar />

    <header class="article-header">
      <div class="header-bg">
        <img
          :src="coverError ? defaultCover : article.cover"
          :alt="article.title"
          @error="handleCoverError"
        />
        <div class="header-overlay"></div>
      </div>
      <div class="header-content">
        <div class="article-meta-top">
          <span
            class="category-badge"
            :style="{ background: categoryInfo.color }"
          >
            {{ categoryInfo.label }}
          </span>
          <span class="publish-date">{{ formatDate(article.publishDate) }}</span>
        </div>
        <h1 class="article-title">{{ article.title }}</h1>
        <div class="article-meta">
          <div class="author-info">
            <img :src="article.author.avatar" :alt="article.author.name" class="avatar" />
            <div class="author-details">
              <span class="author-name">{{ article.author.name }}</span>
              <span class="author-bio">{{ article.author.bio }}</span>
            </div>
          </div>
          <div class="article-stats">
            <span class="stat">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
              {{ article.readTime }} 分钟阅读
            </span>
            <span class="stat">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              {{ article.views }} 阅读
            </span>
          </div>
        </div>
      </div>
    </header>

    <main class="article-main" :class="{ 'has-toc': hasToc }">
      <aside class="article-sidebar" v-if="tocItems.length > 0">
        <div class="toc">
          <h4>目录</h4>
          <nav>
            <a
              v-for="item in tocItems"
              :key="item.id"
              :class="['toc-link', `level-${item.level}`]"
              @click.prevent="scrollToSection(item.id)"
            >
              {{ item.text }}
            </a>
          </nav>
        </div>
      </aside>

      <article class="article-content">
        <div class="content-body" v-html="renderContent(article.content)"></div>

        <div class="article-tags" v-if="article.tags && article.tags.length > 0">
          <span class="tags-label">标签:</span>
          <router-link
            v-for="tag in article.tags"
            :key="tag"
            :to="`/tag/${tag}`"
            class="tag"
          >
            {{ tag }}
          </router-link>
        </div>

        <div class="article-actions">
          <LikeButton
            :article-id="article.id"
            :initial-likes="article?.likes || 0"
            :initial-liked="article?.isLiked || false"
            @like-change="handleLikeChange"
          />
          <FavoriteButton
            :article-id="article.id"
            :initial-favorited="article?.isFavorited || false"
            :initial-favorites="article?.favorites || 0"
            @favorite-change="handleFavoriteChange"
          />
          <button class="back-btn" @click="router.push('/')">
            ← 返回首页
          </button>
        </div>
      </article>

      <!-- 右侧侧边栏 -->
      <aside class="article-right-sidebar">
        <!-- 作者信息 -->
        <div class="sidebar-widget author-widget">
          <h4>作者</h4>
          <div class="author-info">
            <img
              v-if="article?.author?.avatar"
              :src="article.author.avatar"
              :alt="article.author.name"
              class="author-avatar"
            />
            <div v-else class="author-avatar">
              <span>{{ article?.author?.name?.charAt(0) || 'L' }}</span>
            </div>
            <div class="author-details">
              <span class="author-name">{{ article?.author?.name || 'Lumina' }}</span>
              <span class="author-title">技术博主</span>
            </div>
          </div>
          <p class="author-bio">{{ article?.author?.bio || '热爱技术，分享开发经验，探索技术的星辰大海。' }}</p>
          
          <!-- 发消息按钮 -->
          <button 
            v-if="userStore.isLoggedIn && article?.author?.name !== userStore.user?.username"
            class="message-author-btn"
            @click="handleMessageAuthor"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            发消息
          </button>
          
          <!-- 作者统计数据 -->
          <div class="author-stats">
            <div class="author-stat">
              <span class="stat-num">{{ authorStats.articleCount }}</span>
              <span class="stat-label">文章</span>
            </div>
            <div class="author-stat">
              <span class="stat-num">{{ authorStats.totalLikes }}</span>
              <span class="stat-label">获赞</span>
            </div>
            <div class="author-stat">
              <span class="stat-num">{{ authorStats.totalViews }}</span>
              <span class="stat-label">访问</span>
            </div>
          </div>
        </div>

        <!-- 相关文章 -->
        <div class="sidebar-widget" v-if="relatedArticles.length > 0">
          <h4>相关文章</h4>
          <div class="related-articles">
            <router-link
              v-for="related in relatedArticles"
              :key="related.id"
              :to="`/article/${related.id}`"
              class="related-item"
            >
              <img :src="related.cover" :alt="related.title" class="related-cover" />
              <span class="related-title">{{ related.title }}</span>
            </router-link>
          </div>
        </div>

        <!-- 标签云 -->
        <div class="sidebar-widget" v-if="article.tags && article.tags.length > 0">
          <h4>标签云</h4>
          <div class="tag-cloud">
            <router-link
              v-for="tag in article.tags"
              :key="tag"
              :to="`/tag/${tag}`"
              class="tag-item"
            >
              {{ tag }}
            </router-link>
          </div>
        </div>

        <!-- 目录导航（移动端） -->
        <div class="sidebar-widget toc-widget" v-if="tocItems.length > 0">
          <h4>目录</h4>
          <nav class="toc-nav">
            <a
              v-for="item in tocItems"
              :key="item.id"
              :class="['toc-link', `level-${item.level}`]"
              @click.prevent="scrollToSection(item.id)"
            >
              {{ item.text }}
            </a>
          </nav>
        </div>
      </aside>
    </main>

    <!-- 评论区域 -->
    <section class="comments-section">
      <CommentSection
        v-if="article.comments"
        :article-id="article.id"
        :comments="article.comments"
        @comment-added="handleCommentAdded"
      />
    </section>
  </div>

  <div class="loading" v-else-if="isLoading">
    <div class="loading-spinner"></div>
    <p>加载中...</p>
  </div>

  <div class="not-found" v-else>
    <h1>文章不存在</h1>
    <p>抱歉，您访问的文章不存在或已被删除。</p>
    <router-link to="/" class="back-home">返回首页</router-link>
  </div>
  
  <!-- 发消息弹窗 -->
  <div v-if="showMessageModal" class="message-modal-overlay" @click.self="showMessageModal = false">
    <div class="message-modal">
      <div class="modal-header">
        <h3>发消息给 {{ authorUsername }}</h3>
        <button class="close-btn" @click="showMessageModal = false">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="modal-body">
        <textarea 
          v-model="messageContent" 
          placeholder="输入消息内容..." 
          rows="5"
          autofocus
        ></textarea>
      </div>
      <div class="modal-footer">
        <button class="cancel-btn" @click="showMessageModal = false">取消</button>
        <button 
          class="send-btn" 
          @click="sendMessage"
          :disabled="!messageContent.trim() || sendingMessage"
        >
          {{ sendingMessage ? '发送中...' : '发送' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.article-view {
  min-height: 100vh;
}

.article-header {
  position: relative;
  min-height: 350px;
  max-height: 500px;
  display: flex;
  align-items: flex-end;
  padding: 48px 24px;
  margin-top: 70px;
  overflow: hidden;
}

.header-bg {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 0;
}

.header-bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.header-overlay {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: linear-gradient(
    to bottom,
    rgba(10, 14, 23, 0.3) 0%,
    rgba(10, 14, 23, 0.8) 60%,
    var(--color-bg-deep) 100%
  );
}

.header-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 24px;
  box-sizing: border-box;
}

.article-meta-top {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.category-badge {
  padding: var(--space-xs) var(--space-md);
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
}

.publish-date {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.article-title {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 700;
  line-height: 1.25;
  margin-bottom: 20px;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-lg);
}

.author-info {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid var(--color-primary);
}

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 600;
  color: var(--color-text-primary);
}

.author-bio {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.article-stats {
  display: flex;
  gap: var(--space-lg);
}

.stat {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.article-main {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 24px;
  display: flex;
  flex-direction: row;
  gap: 48px;
  box-sizing: border-box;
}

.article-sidebar {
  position: sticky;
  top: 100px;
  flex-shrink: 0;
  width: 180px;
  height: fit-content;
}

.article-content {
  flex: 1;
  min-width: 0;
  max-width: 700px;
  margin: 0 auto;
}

/* 有目录时不居中 */
.article-main.has-toc .article-content {
  margin-left: 0;
}

.article-right-sidebar {
  position: sticky;
  top: 100px;
  flex-shrink: 0;
  width: 260px;
  height: fit-content;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.comments-section {
  max-width: 900px;
  margin: 0 auto;
  padding: 48px 24px;
}

.sidebar-widget {
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;
}

.sidebar-widget h4 {
  font-size: 0.9375rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--color-text-primary);
}

/* 作者信息 */
.author-widget .author-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.25rem;
  object-fit: cover;
}

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 0.9375rem;
}

.author-title {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.author-bio {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0 0 16px 0;
}

/* 作者统计数据 */
.author-stats {
  display: flex;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

.author-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.author-stat .stat-num {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.author-stat .stat-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

/* 发消息按钮 */
.message-author-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  margin-top: 12px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.message-author-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 217, 255, 0.3);
}

/* 发消息弹窗 */
.message-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.message-modal {
  width: 90%;
  max-width: 480px;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  overflow: hidden;
}

.message-modal .modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
}

.message-modal .modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--color-text-primary);
}

.message-modal .close-btn {
  padding: 4px;
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.message-modal .modal-body {
  padding: 20px;
}

.message-modal textarea {
  width: 100%;
  padding: 12px;
  background: var(--color-border);
  border: 1px solid transparent;
  border-radius: 8px;
  color: var(--color-text-primary);
  font-size: 0.95rem;
  resize: none;
  outline: none;
  transition: border-color 0.2s;
}

.message-modal textarea:focus {
  border-color: var(--color-primary);
}

.message-modal .modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--color-border);
}

.message-modal .cancel-btn {
  padding: 10px 20px;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.message-modal .send-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.message-modal .send-btn:hover:not(:disabled) {
  transform: scale(1.05);
}

.message-modal .send-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 相关文章 */
.related-articles {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.related-item {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  padding: 8px;
  border-radius: 8px;
  transition: background var(--transition-fast);
}

.related-item:hover {
  background: var(--color-bg-light);
}

.related-cover {
  width: 60px;
  height: 40px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}

.related-title {
  font-size: 0.8125rem;
  color: var(--color-text-primary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 标签云 */
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  padding: 4px 10px;
  background: var(--color-bg-light);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.tag-item:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* 目录导航（移动端） */
.toc-widget {
  display: none;
}

.toc-nav {
  display: flex;
  flex-direction: column;
}

.toc-nav .toc-link {
  font-size: 0.8125rem;
  padding: 6px 0;
  color: var(--color-text-secondary);
  text-decoration: none;
  border-left: 2px solid transparent;
  padding-left: 12px;
  margin-left: -12px;
  transition: all var(--transition-fast);
}

.toc-nav .toc-link:hover {
  color: var(--color-primary);
  border-left-color: var(--color-primary);
}

.toc {
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: var(--space-lg);
}

.toc h4 {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-md);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.toc nav {
  display: flex;
  flex-direction: column;
}

.toc-link {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  padding: var(--space-xs) 0;
  cursor: pointer;
  transition: color var(--transition-fast);
}

.toc-link:hover {
  color: var(--color-primary);
}

.toc-link.level-2 {
  padding-left: var(--space-md);
}

.toc-link.level-3 {
  padding-left: var(--space-xl);
  font-size: 0.8125rem;
}

.content-body {
  font-size: 1rem;
  line-height: 1.75;
  color: var(--color-text-primary);
}

.content-body :deep(h1),
.content-body :deep(h2),
.content-body :deep(h3) {
  margin-top: 36px;
  margin-bottom: 16px;
  scroll-margin-top: 100px;
}

.content-body :deep(h1) {
  font-size: 1.75rem;
}

.content-body :deep(h2) {
  font-size: 1.375rem;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--color-border);
}

.content-body :deep(h3) {
  font-size: 1.125rem;
}

.content-body :deep(p) {
  margin-bottom: 16px;
}

.content-body :deep(ul),
.content-body :deep(ol) {
  margin-bottom: 16px;
  padding-left: 24px;
}

.content-body :deep(li) {
  margin-bottom: 6px;
}

.content-body :deep(pre) {
  background: var(--color-bg-light);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;
  margin-bottom: 20px;
  font-size: 0.875rem;
}

.content-body :deep(code) {
  font-family: var(--font-mono);
  font-size: 0.875rem;
}

.content-body :deep(pre code) {
  background: none;
  padding: 0;
}

.content-body :deep(strong) {
  color: var(--color-primary);
}

.article-tags {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
  margin-top: var(--space-2xl);
  padding-top: var(--space-xl);
  border-top: 1px solid var(--color-border);
}

.tags-label {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.tag {
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}

.tag:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.article-actions {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-top: var(--space-2xl);
}

.back-btn {
  padding: var(--space-sm) var(--space-lg);
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: 50px;
  color: var(--color-text-primary);
  font-weight: 500;
  transition: all var(--transition-base);
}

.back-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.loading {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading p {
  color: var(--color-text-secondary);
}

.not-found {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-lg);
}

.not-found h1 {
  font-size: 2rem;
  margin-bottom: var(--space-md);
}

.not-found p {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-lg);
}

.back-home {
  padding: var(--space-sm) var(--space-lg);
  background: var(--color-primary);
  color: var(--color-bg-deep);
  border-radius: 50px;
  font-weight: 600;
}

@media (max-width: 1200px) {
  .article-main {
    max-width: 900px;
  }

  .article-right-sidebar {
    width: 220px;
  }
}

@media (max-width: 900px) {
  .article-main {
    flex-direction: column;
    max-width: 700px;
  }

  .article-sidebar {
    display: none;
  }

  .article-right-sidebar {
    display: none;
  }

  .toc-widget {
    display: block;
  }

  .article-content {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .article-header {
    min-height: 280px;
  }

  .article-meta {
    flex-direction: column;
    align-items: flex-start;
  }

  .article-actions {
    flex-wrap: wrap;
    gap: var(--space-sm);
  }

  .back-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
