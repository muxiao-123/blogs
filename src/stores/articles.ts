import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Article, Category } from '@/types'
import { api } from '@/api/index'

export interface CreateArticleInput {
  title: string
  excerpt: string
  content: string
  cover: string
  category: Category
  tags: string[]
}

export interface AddCommentInput {
  articleId: string
  content: string
  author: {
    id?: string
    name: string
    avatar: string
  }
}

export const useArticleStore = defineStore('articles', () => {
  const articles = ref<Article[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const selectedCategory = ref<Category | null>(null)
  const selectedTags = ref<string[]>([])
  const sortBy = ref<'publishDate' | 'views'>('publishDate')

  // 分页相关
  const currentPage = ref(1)
  const pageSize = 20
  const hasMore = computed(() => {
    return filteredArticles.value.length > currentPage.value * pageSize
  })

  // 初始化加载数据
  const init = async () => {
    loading.value = true
    error.value = null
    try {
      articles.value = await api.getArticles()
    } catch (e) {
      error.value = e instanceof Error ? e.message : '加载失败'
      console.error('Failed to load articles:', e)
    } finally {
      loading.value = false
    }
  }

  const filteredArticles = computed(() => {
    let result = [...articles.value]

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      result = result.filter(
        (article) =>
          article.title.toLowerCase().includes(query) ||
          article.excerpt.toLowerCase().includes(query)
      )
    }

    if (selectedCategory.value) {
      result = result.filter((article) => article.category === selectedCategory.value)
    }

    if (selectedTags.value.length > 0) {
      result = result.filter((article) =>
        selectedTags.value.some((tag) => article.tags.includes(tag))
      )
    }

    // 排序
    if (sortBy.value === 'views') {
      result.sort((a, b) => (b.views || 0) - (a.views || 0))
    } else {
      // 默认按发布时间排序（最新的在前）
      result.sort(
        (a, b) => new Date(b.publishDate || '').getTime() - new Date(a.publishDate || '').getTime()
      )
    }

    return result
  })

  // 分页后的文章列表
  const paginatedArticles = computed(() => {
    const start = 0
    const end = currentPage.value * pageSize
    return filteredArticles.value.slice(start, end)
  })

  // 加载更多
  const loadMore = () => {
    if (hasMore.value) {
      currentPage.value++
    }
  }

  // 重置分页（当筛选条件变化时）
  const resetPagination = () => {
    currentPage.value = 1
  }

  const allTags = computed(() => {
    const tagSet = new Set<string>()
    articles.value.forEach((article) => {
      article.tags.forEach((tag) => tagSet.add(tag))
    })
    return Array.from(tagSet)
  })

  const getArticleById = (id: string) => {
    return articles.value.find((article) => article.id === id)
  }

  const setSearchQuery = (query: string) => {
    searchQuery.value = query
    resetPagination()
  }

  const setSortBy = (sort: 'publishDate' | 'views') => {
    sortBy.value = sort
  }

  const setCategory = (category: Category | null) => {
    selectedCategory.value = category
    resetPagination()
  }

  const toggleTag = (tag: string) => {
    const index = selectedTags.value.indexOf(tag)
    if (index === -1) {
      selectedTags.value.push(tag)
    } else {
      selectedTags.value.splice(index, 1)
    }
    resetPagination()
  }

  const clearFilters = () => {
    searchQuery.value = ''
    selectedCategory.value = null
    selectedTags.value = []
    resetPagination()
  }

  const createArticle = async (input: CreateArticleInput): Promise<Article | null> => {
    try {
      const newArticle = await api.createArticle(input)
      articles.value.unshift(newArticle)
      return newArticle
    } catch (e) {
      error.value = e instanceof Error ? e.message : '创建失败'
      return null
    }
  }

  // 更新文章
  const updateArticle = async (
    id: string,
    input: Partial<CreateArticleInput>
  ): Promise<Article | null> => {
    try {
      const updated = await api.updateArticle(id, input)
      const index = articles.value.findIndex((a) => a.id === id)
      if (index !== -1) {
        articles.value[index] = updated
      }
      return updated
    } catch (e) {
      error.value = e instanceof Error ? e.message : '更新失败'
      return null
    }
  }

  // 删除文章
  const deleteArticle = async (id: string): Promise<boolean> => {
    try {
      await api.deleteArticle(id)
      articles.value = articles.value.filter((a) => a.id !== id)
      return true
    } catch (e) {
      error.value = e instanceof Error ? e.message : '删除失败'
      return false
    }
  }

  // 点赞/取消点赞
  const toggleLike = async (articleId: string) => {
    try {
      const result = await api.toggleArticleLike(articleId)
      const index = articles.value.findIndex((a) => a.id === articleId)
      if (index !== -1) {
        articles.value[index] = {
          ...articles.value[index],
          likes: result.likes,
          isLiked: result.isLiked
        }
      }
    } catch (e) {
      console.error('Failed to toggle like:', e)
    }
  }

  // 添加评论
  const addComment = async (input: AddCommentInput) => {
    try {
      const newComment = await api.addComment(input.articleId, input.content, input.author)
      const index = articles.value.findIndex((a) => a.id === input.articleId)
      if (index !== -1) {
        const existingComments = articles.value[index].comments || []
        articles.value[index] = {
          ...articles.value[index],
          comments: [newComment, ...existingComments]
        }
      }
      return newComment
    } catch (e) {
      error.value = e instanceof Error ? e.message : '评论失败'
      return null
    }
  }

  // 删除评论
  const deleteComment = async (articleId: string, commentId: string) => {
    try {
      await api.deleteComment(articleId, commentId)
      const index = articles.value.findIndex((a) => a.id === articleId)
      if (index !== -1) {
        const existingComments = articles.value[index].comments || []
        articles.value[index] = {
          ...articles.value[index],
          comments: existingComments.filter((c) => c.id !== commentId)
        }
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '删除失败'
    }
  }

  // 评论点赞
  const toggleCommentLike = async (articleId: string, commentId: string) => {
    try {
      const result = await api.toggleCommentLike(articleId, commentId)
      const articleIndex = articles.value.findIndex((a) => a.id === articleId)
      if (articleIndex !== -1) {
        const existingComments = articles.value[articleIndex].comments || []
        const commentIndex = existingComments.findIndex((c) => c.id === commentId)
        if (commentIndex !== -1) {
          const newComments = [...existingComments]
          newComments[commentIndex] = {
            ...newComments[commentIndex],
            likes: result.likes
          }
          articles.value[articleIndex] = {
            ...articles.value[articleIndex],
            comments: newComments
          }
        }
      }
    } catch (e) {
      console.error('Failed to toggle comment like:', e)
    }
  }

  // 刷新单个文章
  const refreshArticle = async (id: string) => {
    try {
      const article = await api.getArticle(id)
      const index = articles.value.findIndex((a) => a.id === id)
      if (index !== -1) {
        articles.value[index] = article
      }
      return article
    } catch (e) {
      console.error('Failed to refresh article:', e)
      return null
    }
  }

  return {
    articles,
    loading,
    error,
    searchQuery,
    selectedCategory,
    selectedTags,
    sortBy,
    filteredArticles,
    paginatedArticles,
    hasMore,
    currentPage,
    allTags,
    init,
    getArticleById,
    setSearchQuery,
    setSortBy,
    setCategory,
    toggleTag,
    clearFilters,
    loadMore,
    createArticle,
    updateArticle,
    deleteArticle,
    toggleLike,
    addComment,
    deleteComment,
    toggleCommentLike,
    refreshArticle
  }
})
