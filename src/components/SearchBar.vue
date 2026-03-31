<script setup lang="ts">
import { ref } from 'vue'
import { useArticleStore } from '@/stores/articles'

const articleStore = useArticleStore()
const localQuery = ref(articleStore.searchQuery)

const handleSearch = () => {
  articleStore.setSearchQuery(localQuery.value)
}

const clearSearch = () => {
  localQuery.value = ''
  articleStore.setSearchQuery('')
}
</script>

<template>
  <div class="search-bar">
    <div class="search-input-wrapper">
      <svg
        class="search-icon"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        v-model="localQuery"
        type="text"
        placeholder="搜索文章..."
        class="search-input"
        @input="handleSearch"
        @keyup.enter="handleSearch"
      />
      <button v-if="localQuery" class="clear-btn" @click="clearSearch">×</button>
    </div>
  </div>
</template>

<style scoped>
.search-bar {
  width: 100%;
  max-width: 400px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: var(--space-md);
  color: var(--color-text-secondary);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: var(--space-md) var(--space-md) var(--space-md) calc(var(--space-md) * 2 + 20px);
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: 50px;
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--color-text-primary);
  transition: all var(--transition-base);
}

.search-input::placeholder {
  color: var(--color-text-secondary);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--glow-primary);
  position: relative;
  z-index: 10;
}

.clear-btn {
  position: absolute;
  right: var(--space-md);
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--color-text-secondary);
  color: var(--color-bg-deep);
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.clear-btn:hover {
  background: var(--color-accent);
}
</style>
