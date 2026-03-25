<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Article } from '@/types'
import { categories } from '@/data/articles'

const props = defineProps<{
  article: Article
}>()

// 默认图片
const defaultCover = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=200&fit=crop'
const defaultAvatar = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'

// 图片加载状态
const coverLoaded = ref(false)
const coverError = ref(false)
const avatarLoaded = ref(false)
const avatarError = ref(false)

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
  return categories.find(c => c.key === props.article.category) || categories[3]
})

const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<template>
  <article class="article-card" @click="$router.push(`/article/${article.id}`)">
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12,6 12,12 16,14"/>
            </svg>
            {{ article.readTime }} 分钟
          </span>
          <span class="meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
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
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
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
