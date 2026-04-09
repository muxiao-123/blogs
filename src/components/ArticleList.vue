<script setup lang="ts">
import { computed } from 'vue'
import { useArticleStore } from '@/stores/articles'
import ArticleCard from './ArticleCard.vue'

const articleStore = useArticleStore()

const sectionTitle = computed(() => {
  return articleStore.sortBy === 'views' ? '热门文章' : '最新文章'
})

const totalCount = computed(() => {
  return articleStore.filteredArticles.length
})

// 生成分页页码数组
const pageNumbers = computed(() => {
  const total = articleStore.totalPages
  const current = articleStore.currentPage
  const pages: (number | string)[] = []

  if (total <= 7) {
    // 总页数小于等于7，全部显示
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // 总页数大于7，显示省略号版本
    if (current <= 3) {
      // 靠近开头
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 2) {
      // 靠近结尾
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      // 中间位置
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    }
  }

  return pages
})

const getAnimationDelay = (index: number) => {
  return `${index * 0.05}s`
}
</script>

<template>
  <section class="article-list">
    <div class="list-header" v-if="articleStore.filteredArticles.length > 0">
      <h2 class="section-title">
        <span class="title-accent">{{ sectionTitle }}</span>
      </h2>
      <p class="article-count">共 {{ totalCount }} 篇</p>
    </div>

    <div class="articles-grid" v-if="articleStore.filteredArticles.length > 0">
      <ArticleCard
        v-for="(article, index) in articleStore.paginatedArticles"
        :key="article.id"
        :article="article"
        :style="{ animationDelay: getAnimationDelay(index) }"
      />
    </div>

    <!-- 分页导航 -->
    <div class="pagination-wrapper" v-if="articleStore.totalPages > 1">
      <button
        class="page-btn page-nav"
        :disabled="articleStore.currentPage === 1"
        @click="articleStore.goToPage(articleStore.currentPage - 1)"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <button
        v-for="(page, index) in pageNumbers"
        :key="index"
        class="page-btn"
        :class="{
          active: page === articleStore.currentPage,
          ellipsis: page === '...'
        }"
        :disabled="page === '...'"
        @click="page !== '...' && articleStore.goToPage(page as number)"
      >
        {{ page }}
      </button>

      <button
        class="page-btn page-nav"
        :disabled="articleStore.currentPage === articleStore.totalPages"
        @click="articleStore.goToPage(articleStore.currentPage + 1)"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>

    <div class="empty-state" v-if="articleStore.filteredArticles.length === 0">
      <div class="empty-icon">🔍</div>
      <h3>没有找到相关文章</h3>
      <p>试试调整筛选条件或搜索关键词</p>
      <button class="reset-btn" @click="articleStore.clearFilters">清除筛选</button>
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

.pagination-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-top: var(--space-xl);
  flex-wrap: wrap;
}

.page-btn {
  min-width: 40px;
  height: 40px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.page-btn:hover:not(:disabled):not(.active):not(.ellipsis) {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.page-btn.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-btn.ellipsis {
  border: none;
  cursor: default;
}

.page-btn.ellipsis:hover {
  color: var(--color-text-secondary);
  border-color: var(--color-border);
}

.page-nav {
  padding: 0 8px;
}

.page-nav svg {
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .articles-grid {
    grid-template-columns: 1fr;
  }

  .list-header {
    flex-direction: column;
    gap: var(--space-sm);
  }

  .pagination-wrapper {
    gap: 4px;
  }

  .page-btn {
    min-width: 36px;
    height: 36px;
    padding: 0 8px;
    font-size: 13px;
  }
}
</style>
