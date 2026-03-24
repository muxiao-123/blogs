import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useArticleStore, type CreateArticleInput } from './articles'

describe('ArticleStore - Create Article', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('creates a new article with correct structure', () => {
    const store = useArticleStore()
    const initialCount = store.articles.length

    const input: CreateArticleInput = {
      title: '新文章标题',
      excerpt: '这是一篇新文章的摘要',
      content: '这是文章的具体内容，需要足够长以计算阅读时间。' + 'x'.repeat(500),
      cover: 'https://example.com/cover.jpg',
      category: 'frontend',
      tags: ['Vue3', 'TypeScript']
    }

    const newArticle = store.createArticle(input)

    expect(newArticle.id).toBeDefined()
    expect(newArticle.title).toBe(input.title)
    expect(newArticle.excerpt).toBe(input.excerpt)
    expect(newArticle.content).toBe(input.content)
    expect(newArticle.cover).toBe(input.cover)
    expect(newArticle.category).toBe(input.category)
    expect(newArticle.tags).toEqual(input.tags)
    expect(newArticle.author.name).toBe('Lumina')
    expect(newArticle.publishDate).toBeDefined()
    expect(newArticle.views).toBe(0)
    expect(store.articles.length).toBe(initialCount + 1)
  })

  it('calculates read time correctly', () => {
    const store = useArticleStore()

    // 内容约1500字符，应该阅读时间约3分钟
    const input: CreateArticleInput = {
      title: '测试阅读时间',
      excerpt: '摘要',
      content: 'x'.repeat(1500),
      cover: 'https://example.com/cover.jpg',
      category: 'frontend',
      tags: []
    }

    const newArticle = store.createArticle(input)
    expect(newArticle.readTime).toBe(3)
  })

  it('adds new article at the beginning of list', () => {
    const store = useArticleStore()
    const firstArticleId = store.articles[0]?.id

    const input: CreateArticleInput = {
      title: '最新文章',
      excerpt: '摘要',
      content: '内容'.repeat(50),
      cover: 'https://example.com/cover.jpg',
      category: 'backend',
      tags: ['test']
    }

    store.createArticle(input)
    expect(store.articles[0].title).toBe('最新文章')
  })
})
