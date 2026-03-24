<script setup lang="ts">
import { useArticleStore } from '@/stores/articles'
import { categories } from '@/data/articles'
import type { Category } from '@/types'

const articleStore = useArticleStore()

const handleCategoryClick = (category: Category | null) => {
  articleStore.setCategory(category)
}
</script>

<template>
  <div class="category-tabs">
    <button
      class="category-tab"
      :class="{ active: articleStore.selectedCategory === null }"
      @click="handleCategoryClick(null)"
    >
      全部
    </button>
    <button
      v-for="cat in categories"
      :key="cat.key"
      class="category-tab"
      :class="{ active: articleStore.selectedCategory === cat.key }"
      :style="{
        '--cat-color': cat.color,
        '--cat-glow': `0 0 10px ${cat.color}40`
      }"
      @click="handleCategoryClick(cat.key)"
    >
      {{ cat.label }}
    </button>
  </div>
</template>

<style scoped>
.category-tabs {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.category-tab {
  padding: var(--space-sm) var(--space-md);
  border-radius: 50px;
  font-family: var(--font-display);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  transition: all var(--transition-base);
}

.category-tab:hover {
  color: var(--color-text-primary);
  border-color: var(--cat-color, var(--color-primary));
  box-shadow: var(--cat-glow, var(--glow-primary));
}

.category-tab.active {
  background: var(--cat-color, var(--color-primary));
  color: white;
  border-color: var(--cat-color, var(--color-primary));
  box-shadow: var(--cat-glow, var(--glow-primary));
}
</style>
