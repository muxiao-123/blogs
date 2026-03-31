import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ArticleCard from '../components/ArticleCard.vue'
import type { Article } from '../types'

const mockArticle: Article = {
  id: '1',
  title: '测试文章标题',
  excerpt: '这是一篇测试文章的摘要内容',
  content: '文章内容...',
  cover: 'https://example.com/image.jpg',
  category: 'frontend',
  tags: ['Vue3', 'TypeScript'],
  author: {
    name: 'Test Author',
    avatar: 'https://example.com/avatar.jpg',
    bio: 'Test bio'
  },
  publishDate: '2024-01-15',
  readTime: 5,
  views: 100
}

describe('ArticleCard', () => {
  it('renders article title', () => {
    const wrapper = mount(ArticleCard, {
      props: { article: mockArticle }
    })

    expect(wrapper.text()).toContain('测试文章标题')
  })

  it('renders article excerpt', () => {
    const wrapper = mount(ArticleCard, {
      props: { article: mockArticle }
    })

    expect(wrapper.text()).toContain('这是一篇测试文章的摘要内容')
  })

  it('renders category tag', () => {
    const wrapper = mount(ArticleCard, {
      props: { article: mockArticle }
    })

    expect(wrapper.find('.category-tag').exists()).toBe(true)
  })

  it('renders author info', () => {
    const wrapper = mount(ArticleCard, {
      props: { article: mockArticle }
    })

    expect(wrapper.find('.author-avatar').exists()).toBe(true)
    expect(wrapper.text()).toContain('Test Author')
  })

  it('renders read time', () => {
    const wrapper = mount(ArticleCard, {
      props: { article: mockArticle }
    })

    expect(wrapper.text()).toContain('5 分钟')
  })
})
