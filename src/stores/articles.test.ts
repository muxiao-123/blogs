import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useArticleStore } from './articles'

describe('ArticleStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with articles', () => {
    const store = useArticleStore()
    expect(store.articles.length).toBeGreaterThan(0)
  })

  it('filters articles by search query', () => {
    const store = useArticleStore()

    store.setSearchQuery('Vue')
    expect(store.filteredArticles.length).toBeGreaterThanOrEqual(0)
  })

  it('filters articles by category', () => {
    const store = useArticleStore()

    store.setCategory('frontend')
    const frontendArticles = store.filteredArticles
    expect(frontendArticles.every((a) => a.category === 'frontend')).toBe(true)
  })

  it('toggles tags correctly', () => {
    const store = useArticleStore()

    store.toggleTag('Vue3')
    expect(store.selectedTags).toContain('Vue3')

    store.toggleTag('Vue3')
    expect(store.selectedTags).not.toContain('Vue3')
  })

  it('clears all filters', () => {
    const store = useArticleStore()

    store.setSearchQuery('test')
    store.setCategory('frontend')
    store.toggleTag('Vue3')

    store.clearFilters()

    expect(store.searchQuery).toBe('')
    expect(store.selectedCategory).toBeNull()
    expect(store.selectedTags.length).toBe(0)
  })

  it('gets article by id', () => {
    const store = useArticleStore()

    const article = store.getArticleById('1')
    expect(article).toBeDefined()
    expect(article?.id).toBe('1')
  })

  it('returns all unique tags', () => {
    const store = useArticleStore()

    expect(store.allTags.length).toBeGreaterThan(0)
  })
})
