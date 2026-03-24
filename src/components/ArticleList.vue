<script setup lang="ts">
import { computed } from 'vue'
import { useArticleStore } from '@/stores/articles'
import ArticleCard from './ArticleCard.vue'

const articleStore = useArticleStore()

const sectionTitle = computed(() => {
  return articleStore.sortBy === 'views' ? '热门文章' : '最新文章'
})
</script>

<template>
  <section class="article-list">
    <div class="list-header" v-if="articleStore.filteredArticles.length > 0">
      <h2 class="section-title">
        <span class="title-accent">{{ sectionTitle }}</span>
      </h2>
      <p class="article-count">共 {{ articleStore.filteredArticles.length }} 篇文章</p>
    </div>

    <div class="articles-grid" v-if="articleStore.filteredArticles.length > 0">
      <ArticleCard
        v-for="(article, index) in articleStore.filteredArticles"
        :key="article.id"
        :article="article"
        :style="{ animationDelay: `${index * 0.1}s` }"
      />
    </div>

    <div class="empty-state" v-else>
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
