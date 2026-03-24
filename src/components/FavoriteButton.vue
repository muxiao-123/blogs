<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { api } from '@/api/index'
import { useUserStore } from '@/stores/user'

const props = defineProps<{
  articleId: string
  initialFavorited?: boolean
  initialFavorites?: number
}>()

const emit = defineEmits<{
  (e: 'favorite-change', favorited: boolean): void
}>()

const userStore = useUserStore()
const isFavorited = ref(false)
const favoritesCount = ref(0)
const isLoading = ref(false)

// 是否禁用（未登录时禁用）
const isDisabled = computed(() => !userStore.isLoggedIn || isLoading.value)

// 鼠标悬停提示
const favoriteTitle = computed(() => {
  if (!userStore.isLoggedIn) return '请先登录后再收藏文章'
  return ''
})

// 初始化收藏状态
onMounted(async () => {
  // 如果有初始收藏状态，直接使用
  if (props.initialFavorited !== undefined) {
    isFavorited.value = props.initialFavorited
    favoritesCount.value = props.initialFavorites || 0
    return
  }

  // 否则从 API 获取
  if (!userStore.isLoggedIn) return

  try {
    const result = await api.checkFavorite(props.articleId)
    isFavorited.value = result.favorited
  } catch (e) {
    console.error('Failed to check favorite:', e)
  }
})

const handleFavorite = async () => {
  if (!userStore.isLoggedIn) {
    return
  }

  isLoading.value = true
  try {
    const result = await api.toggleFavorite(props.articleId)
    isFavorited.value = result.favorited
    if (result.favorites !== undefined) {
      favoritesCount.value = result.favorites
    }
    emit('favorite-change', result.favorited)
  } catch (e) {
    console.error('Failed to toggle favorite:', e)
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <button
    class="favorite-button"
    :class="{ favorited: isFavorited, disabled: isDisabled }"
    :disabled="isDisabled"
    :title="favoriteTitle"
    @click="handleFavorite"
  >
    <svg
      class="star-icon"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      :fill="isFavorited ? 'currentColor' : 'none'"
      stroke="currentColor"
      stroke-width="2"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
    <span class="favorite-text">{{ isFavorited ? '已收藏' : '收藏' }}</span>
    <span v-if="favoritesCount > 0" class="favorite-count">({{ favoritesCount }})</span>
  </button>
</template>

<style scoped>
.favorite-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: 50px;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all var(--transition-base);
  cursor: pointer;
}

.favorite-button:hover {
  border-color: #fb923c;
  color: #fb923c;
}

.favorite-button.favorited {
  background: linear-gradient(135deg, #fbbf24, #f97316);
  border-color: #f97316;
  color: white;
}

.favorite-button.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.favorite-button.disabled:hover {
  border-color: var(--color-border);
  color: var(--color-text-secondary);
}

.star-icon {
  transition: transform var(--transition-base);
}

.favorite-button:hover .star-icon {
  transform: scale(1.1);
}

.favorite-button.favorited .star-icon {
  animation: star-pulse 0.3s ease;
}

@keyframes star-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}
</style>
