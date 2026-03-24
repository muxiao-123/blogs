<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useArticleStore } from '@/stores/articles'
import type { Category } from '@/types'
import NavBar from '@/components/NavBar.vue'
import HeroSection from '@/components/HeroSection.vue'
import SearchBar from '@/components/SearchBar.vue'
import CategoryTabs from '@/components/CategoryTabs.vue'
import TagFilter from '@/components/TagFilter.vue'
import ArticleList from '@/components/ArticleList.vue'
import SiteFooter from '@/components/SiteFooter.vue'

const route = useRoute()
const articleStore = useArticleStore()

const handleSortChange = (sort: 'publishDate' | 'views') => {
  articleStore.setSortBy(sort)
}

onMounted(async () => {
  await articleStore.init()
  const category = route.params.category as Category
  if (category) {
    articleStore.setCategory(category)
  }
})

watch(() => route.params.category, (newCategory) => {
  if (newCategory) {
    articleStore.setCategory(newCategory as Category)
  } else {
    articleStore.setCategory(null)
  }
})
</script>

<template>
  <div class="home-view">
    <NavBar />
    <HeroSection />
    <main class="main-content">
      <div class="content-container">
        <div class="filters-section">
          <SearchBar />
          <CategoryTabs />
          <TagFilter />
          <div class="sort-section">
            <span class="sort-label">排序：</span>
            <button
              class="sort-btn"
              :class="{ active: articleStore.sortBy === 'publishDate' }"
              @click="handleSortChange('publishDate')"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              最新
            </button>
            <button
              class="sort-btn"
              :class="{ active: articleStore.sortBy === 'views' }"
              @click="handleSortChange('views')"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              热门
            </button>
          </div>
        </div>
        <ArticleList />
      </div>
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped>
.home-view {
  min-height: 100vh;
}

.main-content {
  position: relative;
  background: var(--color-bg-deep);
}

.main-content::before {
  content: '';
  position: absolute;
  top: -100px;
  left: 0;
  right: 0;
  height: 150px;
  background: linear-gradient(180deg, transparent 0%, var(--color-bg-deep) 100%);
  pointer-events: none;
  z-index: 1;
}

.content-container {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-lg);
}

.filters-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  padding: var(--space-2xl) 0;
  border-bottom: 1px solid var(--color-border);
}

.sort-section {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.sort-label {
  color: var(--color-text-secondary);
  font-size: 14px;
}

.sort-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 14px;
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

@media (max-width: 768px) {
  .filters-section {
    gap: var(--space-md);
  }
}
</style>
