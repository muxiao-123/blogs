<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Article } from '@/types'
import { categories } from '@/data/articles'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const props = defineProps<{
  article: Article
}>()

const router = useRouter()
const userStore = useUserStore()

// 默认图片
const defaultCover = '/default-cover.svg'
const defaultAvatar =
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'

// 图片加载状态
const coverLoaded = ref(false)
const coverError = ref(false)
const avatarLoaded = ref(false)
const avatarError = ref(false)

// 判断当前用户是否有权限编辑（作者本人或 lumina 用户）
const canEdit = computed(() => {
  if (!userStore.user) return false
  return (
    props.article.author.name === userStore.user.username || userStore.user.username === 'lumina'
  )
})

const handleCoverLoad = () => {
  coverLoaded.value = true
}

const handleCoverError = () => {
  coverError.value = true
  coverLoaded.value = true
}

const handleAvatarLoad = () => {
  avatarLoaded.value = true
}

const handleAvatarError = () => {
  avatarError.value = true
  avatarLoaded.value = true
}

const categoryInfo = computed(() => {
  return categories.find((c) => c.key === props.article.category) || categories[3]
})

const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const openArticle = (e: Event) => {
  // 如果点击的是编辑按钮，不打开文章
  if ((e.target as HTMLElement).closest('.edit-btn')) return

  const routeUrl = router.resolve({
    name: 'Article',
    params: { id: props.article.id }
  }).href
  window.open(routeUrl, '_blank')
}

const goToEdit = () => {
  router.push({ name: 'CreateArticle', query: { id: props.article.id } })
}
</script>
<template>
  <article class="article-card" @click="openArticle">
    <div class="card-image">
      <div v-if="!coverLoaded" class="image-placeholder"></div>
      <img
        :src="coverError ? defaultCover : article.cover"
        :alt="article.title"
        loading="lazy"
        @load="handleCoverLoad"
        @error="handleCoverError"
      />
      <div class="card-overlay"></div>
      <span class="category-tag" :style="{ background: categoryInfo.color }">
        {{ categoryInfo.label }}
      </span>
      <!-- 私有标识 -->
      <span v-if="article.isPrivate" class="private-tag" title="私有文章">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M12 1C8.676 1 6 3.676 6 7v2H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v2H8V7c0-2.276 1.724-4 4-4zm0 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"
          />
        </svg>
        私有
      </span>
      <!-- 编辑按钮 -->
      <button v-if="canEdit" class="edit-btn" @click.stop="goToEdit" title="编辑文章">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>
    </div>
    <div class="card-content">
      <h3 class="card-title">{{ article.title }}</h3>
      <p class="card-excerpt">{{ article.excerpt }}</p>
      <div class="card-meta">
        <div class="meta-left">
          <img
            :src="avatarError ? defaultAvatar : article.author.avatar"
            :alt="article.author.name"
            class="author-avatar"
            @error="handleAvatarError"
          />
          <span class="author-name">{{ article.author.name }}</span>
        </div>
        <div class="meta-right">
          <span class="meta-item">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12,6 12,12 16,14" />
            </svg>
            {{ article.readTime }} 分钟
          </span>
          <span class="meta-item">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {{ article.views }}
          </span>
        </div>
      </div>
      <div class="card-date">{{ formatDate(article.publishDate) }}</div>
    </div>
  </article>
</template>

<style scoped>
.article-card {
  background: transparent;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: fade-in-up 0.6s ease-out both;
}

.article-card:hover .card-image img {
  transform: scale(1.05);
}

.card-image {
  position: relative;
  height: 180px;
  overflow: hidden;
  border-radius: 12px;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.image-placeholder {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #e8e8e8 0%, #f5f5f5 100%);
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}

.category-tag {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.private-tag {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  color: white;
  background: rgba(123, 97, 255, 0.9);
  backdrop-filter: blur(4px);
}

.edit-btn {
  position: absolute;
  bottom: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: var(--color-text-secondary);
  cursor: pointer;
  opacity: 0;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
}

.article-card:hover .edit-btn {
  opacity: 1;
}

.edit-btn:hover {
  background: var(--color-primary);
  color: white;
  transform: scale(1.1);
}

.card-content {
  padding: 16px 4px;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--color-text-primary);
  line-height: 1.5;
  transition: color 0.3s ease;
}

.article-card:hover .card-title {
  color: var(--color-primary);
}

.card-excerpt {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
}

.meta-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

.author-name {
  color: var(--color-text-primary);
}

.meta-right {
  display: flex;
  gap: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-date {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  opacity: 0.7;
  margin-top: 8px;
}
</style>
