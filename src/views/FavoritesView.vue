<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import NavBar from '@/components/NavBar.vue'
import ArticleCard from '@/components/ArticleCard.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import type { Article } from '@/types'

const router = useRouter()
const userStore = useUserStore()

const favoriteArticles = ref<Article[]>([])
const isLoading = ref(true)

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001/api'

onMounted(async () => {
  await userStore.init()

  try {
    const response = await fetch(`${API_BASE}/articles/favorites`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    if (response.ok) {
      favoriteArticles.value = await response.json()
    }
  } catch (e) {
    console.error('Failed to fetch favorites:', e)
  } finally {
    isLoading.value = false
  }
})

const removeFavorite = async (articleId: string) => {
  try {
    const response = await fetch(`${API_BASE}/articles/${articleId}/favorite`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
    if (response.ok) {
      favoriteArticles.value = favoriteArticles.value.filter((a) => a.id !== articleId)
    }
  } catch (e) {
    console.error('Failed to remove favorite:', e)
  }
}

const clearAllFavorites = async () => {
  for (const article of favoriteArticles.value) {
    await removeFavorite(article.id)
  }
}
</script>

<template>
  <div class="favorites-view">
    <NavBar />

    <main class="favorites-main">
      <div class="favorites-container">
        <header class="favorites-header">
          <div class="header-left">
            <h1 class="page-title">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="#fbbf24"
                stroke="#fbbf24"
                stroke-width="2"
              >
                <polygon
                  points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                />
              </svg>
              我的收藏
            </h1>
            <p class="favorites-count">共收藏了 {{ favoriteArticles.length }} 篇文章</p>
          </div>
          <button v-if="favoriteArticles.length > 0" class="clear-btn" @click="clearAllFavorites">
            清空收藏
          </button>
        </header>

        <div class="loading-state" v-if="isLoading">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>

        <div class="favorites-grid" v-else-if="favoriteArticles.length > 0">
          <div v-for="article in favoriteArticles" :key="article.id" class="favorite-item">
            <ArticleCard :article="article" />
            <button class="remove-btn" @click.stop="removeFavorite(article.id)" title="取消收藏">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div class="empty-state" v-else>
          <div class="empty-icon">⭐</div>
          <h2>还没有收藏文章</h2>
          <p>去发现喜欢的文章并收藏起来吧</p>
          <button class="explore-btn" @click="router.push('/')">开始探索</button>
        </div>
      </div>
    </main>

    <SiteFooter />
  </div>
</template>

<style scoped>
.favorites-view {
  min-height: 100vh;
}

.favorites-main {
  padding-top: 100px;
  min-height: calc(100vh - 200px);
}

.favorites-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 24px;
}

.favorites-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 48px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--color-border);
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

.favorites-count {
  color: var(--color-text-secondary);
  font-size: 0.9375rem;
}

.clear-btn {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all var(--transition-base);
}

.clear-btn:hover {
  border-color: #ef4444;
  color: #ef4444;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 32px;
}

.favorite-item {
  position: relative;
}

.remove-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  opacity: 0;
  transition: all var(--transition-base);
  z-index: 10;
}

.favorite-item:hover .remove-btn {
  opacity: 1;
}

.remove-btn:hover {
  background: #ef4444;
}

.loading-state {
  text-align: center;
  padding: 80px 24px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  text-align: center;
  padding: 80px 24px;
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 24px;
}

.empty-state h2 {
  font-size: 1.5rem;
  color: var(--color-text-primary);
  margin-bottom: 12px;
}

.empty-state p {
  color: var(--color-text-secondary);
  margin-bottom: 32px;
}

.explore-btn {
  padding: 12px 32px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  border: none;
  border-radius: 50px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
}

.explore-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--glow-primary);
}

@media (max-width: 768px) {
  .favorites-grid {
    grid-template-columns: 1fr;
  }

  .favorites-header {
    flex-direction: column;
    gap: 16px;
  }

  .page-title {
    font-size: 1.5rem;
  }
}
</style>
