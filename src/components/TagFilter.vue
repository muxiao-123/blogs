<script setup lang="ts">
import { useArticleStore } from '@/stores/articles'

const articleStore = useArticleStore()

const handleTagClick = (tag: string) => {
  articleStore.toggleTag(tag)
}
</script>

<template>
  <div class="tag-filter" v-if="articleStore.allTags.length > 0">
    <span class="tag-label">标签:</span>
    <div class="tags">
      <button
        v-for="tag in articleStore.allTags"
        :key="tag"
        class="tag-btn"
        :class="{ active: articleStore.selectedTags.includes(tag) }"
        @click="handleTagClick(tag)"
      >
        {{ tag }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.tag-filter {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex-wrap: wrap;
}

.tag-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.tags {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.tag-btn {
  padding: var(--space-xs) var(--space-sm);
  border-radius: 4px;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  background: transparent;
  border: 1px solid var(--color-border);
  transition: all var(--transition-fast);
}

.tag-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.tag-btn.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-bg-deep);
}
</style>
