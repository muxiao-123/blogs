<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useArticleStore } from '@/stores/articles'
import ArticleCard from './ArticleCard.vue'

const articleStore = useArticleStore()

const sectionTitle = computed(() => {
  return articleStore.sortBy === 'views' ? '热门文章' : '最新文章'
})

const displayedCount = computed(() => {
  return articleStore.paginatedArticles.length
})

const totalCount = computed(() => {
  return articleStore.filteredArticles.length
})

// 记录首次加载状态
const isInitialLoad = ref(true)

watch(() => articleStore.currentPage, (newPage) => {
  if (newPage === 1) {
    isInitialLoad.value = true
  } else {
    isInitialLoad.value = false
  }
})

const getAnimationDelay = (index: number) => {
  // 只有首次加载时才有动画延迟，加载更多时立即显示
  if (!isInitialLoad.value) return '0s'
  return `${index * 0.05}s`
}
</script>

<template>
  <section class="article-list">
    <div class="list-header" v-if="articleStore.filteredArticles.length > 0">
      <h2 class="section-title">
        <span class="title-accent">{{ sectionTitle }}</span>
      </h2>
      <p class="article-count">共 {{ totalCount }} 篇，已加载 {{ displayedCount }} 篇</p>
    </div>

    <div class="articles-grid" v-if="articleStore.filteredArticles.length > 0">
      <ArticleCard
        v-for="(article, index) in articleStore.paginatedArticles"
        :key="article.id"
        :article="article"
        :style="{ animationDelay: getAnimationDelay(index) }"
      />
    </div>

    <div class="load-more-wrapper" v-if="articleStore.hasMore">
      <button class="load-more-btn" @click="articleStore.loadMore">
        加载更多
      </button>
    </div>

    <div class="empty-state" v-if="articleStore.filteredArticles.length === 0">
      <div class="empty-icon">🔍</div>
      <h3>没有找到相关文章</h3>
      <p>试试调整筛选条件或搜索关键词</p>
      <button class="reset-btn" @click="articleStore.clearFilters">
        清除筛选
      </button>
    </div>
  </section>
</template>

<style scoped>
.article-list {
  padding: 40px 0;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: var(--space-xl);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
}

.title-accent {
  color: var(--color-primary);
}

.article-count {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 32px;
}

.empty-state {
  text-align: center;
  padding: var(--space-3xl);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--space-lg);
}

.empty-state h3 {
  font-size: 1.5rem;
  margin-bottom: var(--space-sm);
}

.empty-state p {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-lg);
}

.reset-btn {
  padding: var(--space-sm) var(--space-lg);
  background: var(--color-primary);
  color: var(--color-bg-deep);
  border-radius: 50px;
  font-weight: 600;
  transition: all var(--transition-base);
}

.reset-btn:hover {
  box-shadow: var(--glow-primary);
  transform: scale(1.05);
}

.load-more-wrapper {
  display: flex;
  justify-content: center;
  margin-top: var(--space-xl);
}

.load-more-btn {
  padding: var(--space-md) var(--space-2xl);
  background: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
}

.load-more-btn:hover {
  background: var(--color-primary);
  color: var(--color-bg-deep);
  box-shadow: var(--glow-primary);
}

@media (max-width: 768px) {
  .articles-grid {
    grid-template-columns: 1fr;
  }

  .list-header {
    flex-direction: column;
    gap: var(--space-sm);
  }
}
</style>
