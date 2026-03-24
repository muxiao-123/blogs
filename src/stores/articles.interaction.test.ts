import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useArticleStore } from './articles'

describe('ArticleStore - Interaction', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('toggles like on article', () => {
    const store = useArticleStore()
    const article = store.articles[0]
    const initialLikes = article.likes
    const initialIsLiked = article.isLiked

    store.toggleLike(article.id)

    expect(article.isLiked).toBe(!initialIsLiked)
    expect(article.likes).toBe(initialIsLiked ? initialLikes - 1 : initialLikes + 1)
  })

  it('adds comment to article', () => {
    const store = useArticleStore()
    const article = store.articles[0]
    const initialCommentCount = article.comments.length

    const comment = store.addComment({
      articleId: article.id,
      content: '这是一条测试评论',
      author: {
        name: '测试用户',
        avatar: 'https://example.com/avatar.jpg'
      }
    })

    expect(comment).not.toBeNull()
    expect(article.comments.length).toBe(initialCommentCount + 1)
    expect(comment?.content).toBe('这是一条测试评论')
    expect(comment?.author.name).toBe('测试用户')
  })

  it('deletes comment from article', () => {
    const store = useArticleStore()
    const article = store.articles[0]

    // 先添加评论
    store.addComment({
      articleId: article.id,
      content: '要删除的评论',
      author: { name: '用户', avatar: '' }
    })

    const commentId = article.comments[0].id
    const initialCount = article.comments.length

    store.deleteComment(article.id, commentId)

    expect(article.comments.length).toBe(initialCount - 1)
  })

  it('newly created article has empty comments', () => {
    const store = useArticleStore()

    const newArticle = store.createArticle({
      title: '测试文章',
      excerpt: '摘要',
      content: '内容',
      cover: 'https://example.com/cover.jpg',
      category: 'frontend',
      tags: []
    })

    expect(newArticle.comments).toEqual([])
    expect(newArticle.likes).toBe(0)
    expect(newArticle.isLiked).toBe(false)
  })
})
