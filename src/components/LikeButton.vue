<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { api } from '@/api/index'

const props = defineProps<{
  articleId: string
  initialLikes?: number
  initialLiked?: boolean
}>()

const emit = defineEmits<{
  (e: 'like-change', liked: boolean, likes: number): void
}>()

const userStore = useUserStore()
const isLiked = ref(props.initialLiked || false)
const likes = ref(props.initialLikes || 0)
const isLoading = ref(false)

// 是否禁用（未登录时禁用）
const isDisabled = computed(() => !userStore.isLoggedIn || isLoading.value)

// 鼠标悬停提示
const likeTitle = computed(() => {
  if (!userStore.isLoggedIn) return '请先登录后再点赞文章'
  return ''
})

const handleLike = async () => {
  if (!userStore.isLoggedIn) {
    return
  }

  isLoading.value = true
  try {
    const result = await api.toggleArticleLike(props.articleId)
    isLiked.value = result.isLiked
    likes.value = result.likes
    emit('like-change', result.isLiked, result.likes)
  } catch (e) {
    console.error('Failed to toggle like:', e)
  } finally {
    isLoading.value = false
  }
}

const likeText = computed(() => {
  if (likes.value === 0) return '点赞'
  if (likes.value < 1000) return `${likes.value}`
  return `${(likes.value / 1000).toFixed(1)}k`
})
</script>

<template>
  <button
    class="like-button"
    :class="{ liked: isLiked, disabled: isDisabled }"
    :disabled="isDisabled"
    :title="likeTitle"
    @click="handleLike"
  >
    <svg
      class="heart-icon"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      :fill="isLiked ? 'currentColor' : 'none'"
      stroke="currentColor"
      stroke-width="2"
    >
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      />
    </svg>
    <span class="like-text">{{ likeText }}</span>
  </button>
</template>

<style scoped>
.like-button {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: 50px;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all var(--transition-base);
}

.like-button:hover {
  border-color: #e879f9;
  color: #e879f9;
}

.like-button.liked {
  background: linear-gradient(135deg, #f472b6, #ec4899);
  border-color: #ec4899;
  color: white;
}

.like-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.like-button.disabled:hover {
  border-color: var(--color-border);
  color: var(--color-text-secondary);
}

.heart-icon {
  transition: transform var(--transition-base);
}

.like-button:hover .heart-icon {
  transform: scale(1.1);
}

.like-button.liked .heart-icon {
  animation: pulse 0.3s ease;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
  100% {
    transform: scale(1);
  }
}
</style>
