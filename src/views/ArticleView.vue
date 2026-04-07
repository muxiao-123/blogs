<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useArticleStore } from '@/stores/articles'
import { useUserStore } from '@/stores/user'
import { api } from '@/api/index'
import { categories } from '@/data/articles'
import NavBar from '@/components/NavBar.vue'
import LikeButton from '@/components/LikeButton.vue'
import FavoriteButton from '@/components/FavoriteButton.vue'
import CommentSection from '@/components/CommentSection.vue'
import type { Article } from '@/types'
// import { marked } from 'marked'
// import domPurify from 'dompurify'
// import { markedHighlight } from 'marked-highlight'
// import hljs from 'highlight.js'
import { formatContent } from '../utils'
const route = useRoute()
const router = useRouter()
const articleStore = useArticleStore()
const userStore = useUserStore()
const isLoading = ref(true)

// 发消息相关
const showMessageModal = ref(false)
const messageContent = ref('')
const sendingMessage = ref(false)
const authorUserId = ref('')
const authorUsername = ref('')

// 默认图片
const defaultCover = '/default-cover.svg'

// 背景图加载错误处理
const coverError = ref(false)

const handleCoverError = () => {
  coverError.value = true
}

// 发消息给作者
const handleMessageAuthor = async () => {
  if (!article.value?.author?.name) return

  // 如果不是登录状态，跳转到登录页
  if (!userStore.isLoggedIn) {
    router.push(`/auth?redirect=${route.fullPath}`)
    return
  }

  // 获取作者ID
  try {
    const users = await api.searchUsers(article.value.author.name, 1)
    const author = users.find((u) => u.username === article.value?.author?.name)
    if (author) {
      authorUserId.value = author.id
      authorUsername.value = author.username
      showMessageModal.value = true
    } else {
      alert('无法获取作者信息')
    }
  } catch (e) {
    alert('获取作者信息失败')
  }
}

// 发送消息
const sendMessage = async () => {
  if (!messageContent.value.trim() || !authorUserId.value) return

  sendingMessage.value = true
  try {
    await api.sendMessage(authorUserId.value, authorUsername.value, messageContent.value.trim())
    showMessageModal.value = false
    messageContent.value = ''
    alert('消息已发送！')
  } catch (e: any) {
    alert(e.message || '发送失败')
  } finally {
    sendingMessage.value = false
  }
}

// 作者统计数据
const authorStats = ref({ articleCount: 0, totalViews: 0, totalLikes: 0 })

// 直接从API获取文章详情
const articleData = ref<Article | null>(null)

const article = computed(() => articleData.value)
const showArticleContent = ref('')
const fetchArticle = async () => {
  const id = route.params.id as string
  try {
    const data = await api.getArticleById(id)
    articleData.value = data

    // 获取作者统计数据
    if (data.author?.name) {
      try {
        const stats = await api.getUserStats(data.author.name)
        authorStats.value = stats
      } catch (e) {
        console.error('Failed to fetch author stats:', e)
      }
    }
  } catch (e) {
    console.error('Failed to fetch article:', e)
  } finally {
    isLoading.value = false
  }
}

// 评论添加后刷新文章数据
const handleCommentAdded = async () => {
  await fetchArticle()
}

const categoryInfo = computed(() => {
  if (!article.value) return categories[3]
  return categories.find((c) => c.key === article.value!.category) || categories[3]
})

// 获取相关文章（优先匹配度高的，没有则随机）
const relatedArticles = computed(() => {
  if (!article.value) return []

  const currentArticle = article.value
  const allArticles = articleStore.articles

  // 过滤掉当前文章
  let candidates = allArticles.filter((a) => a.id !== currentArticle.id)

  // 计算每篇文章的相关度分数
  const scored = candidates.map((a) => {
    let score = 0

    // 同分类 +3 分
    if (a.category === currentArticle.category) {
      score += 3
    }

    // 共同标签每个 +2 分
    const commonTags = a.tags?.filter((tag) => currentArticle.tags?.includes(tag)) || []
    score += commonTags.length * 2

    // 同作者 +1 分
    if (a.author?.name === currentArticle.author?.name) {
      score += 1
    }

    return { article: a, score }
  })

  // 按相关度排序
  scored.sort((a, b) => b.score - a.score)

  // 取相关度最高的
  let result = scored.filter((s) => s.score > 0).map((s) => s.article)

  // 如果不足3篇，随机补充
  if (result.length < 3) {
    const remaining = scored
      .filter((s) => s.score === 0)
      .map((s) => s.article)
      .sort(() => Math.random() - 0.5)

    result = [...result, ...remaining].slice(0, 3)
  }

  return result.slice(0, 3)
})

const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 判断当前用户是否有权限编辑（作者本人或 lumina 用户）
const canEdit = computed(() => {
  if (!article.value || !userStore.user) return false
  return (
    article.value.author.name === userStore.user.username || userStore.user.username === 'lumina'
  )
})

const goToEdit = () => {
  if (!article.value) return
  router.push({ name: 'CreateArticle', query: { id: article.value.id } })
}

const tocItems = ref<Array<{ id: string; text: string; level: number }>>([])

const hasToc = computed(() => tocItems.value.length > 0)

const parseToc = (content: string) => {
  const items: Array<{ id: string; text: string; level: number }> = []

  // 1. 优先尝试解析 HTML 格式标题 (Tiptap)
  const htmlRegex = /<h([1-3])[^>]*>([^<]+)<\/h[1-3]>/gi
  let match

  while ((match = htmlRegex.exec(content)) !== null) {
    const level = parseInt(match[1])
    const text = match[2].trim()
    const id = text.toLowerCase().replace(/[^\u4e00-\u9fa5a-z0-9]+/g, '-')
    items.push({ id, text, level })
  }

  // 2. 尝试解析 p 标签内的 Markdown 标题格式
  if (items.length === 0) {
    const pMdRegex = /<p>(#{1,3})\s(.+?)<\/p>/gi
    while ((match = pMdRegex.exec(content)) !== null) {
      const level = match[1].length
      const text = match[2].trim()
      const id = text.toLowerCase().replace(/[^\u4e00-\u9fa5a-z0-9]+/g, '-')
      items.push({ id, text, level })
    }
  }

  // 3. 如果没有 HTML 标题，再尝试纯 Markdown 格式
  if (items.length === 0) {
    const mdRegex = /^(#{1,3})\s+(.+)$/gm
    while ((match = mdRegex.exec(content)) !== null) {
      const level = match[1].length
      const text = match[2].trim()
      const id = text.toLowerCase().replace(/[^\u4e00-\u9fa5a-z0-9]+/g, '-')
      items.push({ id, text, level })
    }
  }

  return items
}

// 加载文章数据
const loadArticle = async () => {
  // 初始化用户状态
  await userStore.init()

  const id = route.params.id as string
  isLoading.value = true
  articleData.value = null // 清空旧数据
  try {
    if (!articleStore.articles.length) {
      await articleStore.init()
    }
    await fetchArticle()
    if (article.value) {
      const content = await formatContent(article.value.content)
      showArticleContent.value = content.res
      // tocItems.value = parseToc(content.res)
      tocItems.value = content.markDir ?? []
    }
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await loadArticle()
})

// 监听路由变化，解决前进/后退时页面不更新的问题
watch(
  () => route.params.id,
  async (newId) => {
    if (newId) {
      await loadArticle()
    }
  }
)

const scrollToSection = (id: string) => {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// 收藏状态变化时刷新页面数据
const handleFavoriteChange = (favorited: boolean) => {
  // 刷新当前文章数据
  articleStore.init()
}

// 点赞状态变化时刷新页面数据
const handleLikeChange = (liked: boolean, likes: number) => {
  // 刷新当前文章数据
  articleStore.init()
}

// 生成安全的 id
const toSafeId = (text: string): string => {
  return text.toLowerCase().replace(/[^\u4e00-\u9fa5a-z0-9]+/g, '-')
}

// HTML 反转义
const unescapeHtml = (text: string): string => {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
}

// Content rendering function
const renderContent = (content: string): string => {
  if (!content) return ''

  // 检测是否有 p 标签内的 Markdown 语法（如 <p>## 标题</p> 或 <p>**粗体**</p>）
  const hasMarkdownInP = /<p>[#*`>\\-]/.test(content)

  // 检测是否包含任何 HTML 标签（是 HTML 内容）
  const hasAnyHtml =
    /<\/?(p|h[1-6]|div|span|strong|em|code|pre|blockquote|ul|ol|li|a|img)[^>]*>/i.test(content)

  // 如果包含 HTML 标签，直接返回（已经是有效 HTML）
  if (hasAnyHtml && !hasMarkdownInP) {
    // 给标题添加 id
    return content.replace(/<h([1-3])([^>]*)>([^<]+)<\/h[1-3]>/gi, (_m, level, attrs, text) => {
      const id = toSafeId(text.trim())
      return `<h${level}${attrs} id="${id}">${text}</h${level}>`
    })
  }

  if (hasMarkdownInP) {
    // 内容混合了 HTML 和 Markdown（Markdown 在 p 标签内）
    // 需要把 p 标签内的 Markdown 语法转换为 HTML
    let result = content

    // 第一步：处理代码块（需要特殊处理，因为它可能跨多个 p 标签）
    result = processCodeBlocksInP(result)

    // 第二步：处理其他 p 标签内的 Markdown
    result = result
      // 处理 h1, h2, h3（支持带 emoji 或其他前缀的情况）
      .replace(/<p>(#{1,3})\s(.+?)<\/p>/g, (_m, hashes, text) => {
        const level = hashes.length
        const id = toSafeId(text.trim())
        return `<h${level} id="${id}">${text}</h${level}>`
      })
      // 处理引用块
      .replace(/<p>(&gt;)\s(.+?)<\/p>/g, '<blockquote><p>$2</p></blockquote>')
      // 处理无序列表（列表标记后必须有空格，且不是连续的两个标记）
      .replace(/<p>([-*+])\s{1,}(?![*+-])(.+?)<\/p>/g, '<li>$2</li>')
      // 处理有序列表
      .replace(/<p>(\d+)\.\s(.+?)<\/p>/g, '<li>$2</li>')
      // 处理水平线
      .replace(/<p>[-*_]{3,}<\/p>/g, '<hr>')
      // 给已有的 HTML 标题添加 id
      .replace(/<h([1-3])([^>]*)>([^<]+)<\/h[1-3]>/gi, (_m, level, attrs, text) => {
        const id = toSafeId(text.trim())
        return `<h${level}${attrs} id="${id}">${text}</h${level}>`
      })

    // 第三步：合并连续的列表项
    result = result.replace(/(<li>[\s\S]*?<\/li>\n?)+/g, (match) => {
      return '<ul>' + match + '</ul>'
    })

    // 第四步：处理行内 Markdown（粗体、斜体、行内代码、链接）
    result = processInlineMarkdownInHtml(result)

    return result
  }

  // 纯 Markdown 格式
  return parseMarkdown(content)
}

// 处理 p 标签内的代码块
const processCodeBlocksInP = (content: string): string => {
  // 匹配代码块开始和结束之间的所有 <p>...</p>
  // 使用占位符保护已处理的代码块，防止后续处理干扰
  const codeBlocks: string[] = []
  let blockIndex = 0

  const processed = content.replace(
    /<p>```(\w*)<\/p>([\s\S]*?)<p>```<\/p>/g,
    (_m, lang, innerContent) => {
      // 提取所有 <p> 标签内的内容并合并
      const lines: string[] = innerContent.match(/<p>([\s\S]*?)<\/p>/g) || []
      let code = lines
        .map((line) => {
          // 移除 <p> 和 </p> 标签
          return line.replace(/^<p>/, '').replace(/<\/p>$/, '')
        })
        .join('\n')

      // 转义 HTML 特殊字符
      code = escapeHtml(code.trim())

      // 保存代码块并用占位符替换
      const placeholder = `___CODE_BLOCK_${blockIndex}___`
      codeBlocks.push(`<pre><code class="language-${lang}">${code}</code></pre>`)
      blockIndex++

      return placeholder
    }
  )

  // 将占位符替换回代码块
  let result = processed
  codeBlocks.forEach((block, i) => {
    result = result.replace(`___CODE_BLOCK_${i}___`, block)
  })

  return result
}

// 在已转换的 HTML 中处理行内 Markdown（不再处理代码块内的内容）
const processInlineMarkdownInHtml = (content: string): string => {
  // 先转义 HTML 特殊字符，但保留已转换的标签
  let result = content

  // 处理行内代码
  result = result.replace(/<p>`([^`]+)`<\/p>/g, '<p><code>$1</code></p>')
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>')

  // 处理粗体
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

  // 处理斜体
  result = result.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // 处理链接
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

  return result
}

// 解析纯 Markdown 格式
const parseMarkdown = (content: string): string => {
  const lines = content.split('\n')
  const result: string[] = []
  let inCodeBlock = false
  let codeBlockContent = ''
  let codeBlockLang = ''
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // 代码块处理
    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true
        codeBlockLang = line.trim().slice(3)
        codeBlockContent = ''
      } else {
        inCodeBlock = false
        const lang = escapeHtml(codeBlockLang)
        const displayLang = codeBlockLang || 'code'
        result.push(
          `<pre class="code-block" data-lang="${lang}"><div class="code-header"><span class="code-lang">${displayLang}</span><button class="copy-btn" onclick="copyCode(this)">复制</button></div><div class="code-content"><code class="language-${lang}">${escapeHtml(codeBlockContent.trim())}</code></div></pre>`
        )
      }
      i++
      continue
    }

    if (inCodeBlock) {
      codeBlockContent += line + '\n'
      i++
      continue
    }

    // 标题处理
    if (line.startsWith('### ')) {
      const text = line.slice(4)
      result.push(`<h3 id="${toSafeId(text)}">${escapeHtml(text)}</h3>`)
      i++
      continue
    }
    if (line.startsWith('## ')) {
      const text = line.slice(3)
      result.push(`<h2 id="${toSafeId(text)}">${escapeHtml(text)}</h2>`)
      i++
      continue
    }
    if (line.startsWith('# ')) {
      const text = line.slice(2)
      result.push(`<h1 id="${toSafeId(text)}">${escapeHtml(text)}</h1>`)
      i++
      continue
    }

    // 列表处理
    if (line.match(/^[-*+]\s/)) {
      result.push(`<li>${processInlineMarkdown(line.slice(2))}</li>`)
      i++
      continue
    }
    if (/^\d+\.\s/.test(line)) {
      result.push(`<li>${processInlineMarkdown(line.replace(/^\d+\.\s/, ''))}</li>`)
      i++
      continue
    }

    // 水平线
    if (line.trim().match(/^[-*_]{3,}$/)) {
      result.push('<hr>')
      i++
      continue
    }

    // 空行
    if (line.trim() === '') {
      i++
      continue
    }

    // 普通段落
    result.push(`<p>${processInlineMarkdown(line)}</p>`)
    i++
  }

  // 合并连续的无序列表项
  let merged = result.join('\n')
  merged = merged.replace(/(<li>[\s\S]*?<\/li>\n?)+/g, (match) => {
    return '<ul>' + match + '</ul>'
  })

  return merged
}

// 处理行内 markdown 格式
const processInlineMarkdown = (text: string): string => {
  // 先转义 HTML 特殊字符
  let result = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

  // 处理 Markdown 语法
  // Inline code
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>')
  // Bold
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  // Italic
  result = result.replace(/\*(.+?)\*/g, '<em>$1</em>')
  // Link
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

  return result
}

// HTML 转义
const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// 复制代码功能
;(window as any).copyCode = function (btn: HTMLButtonElement) {
  const pre = btn.closest('pre')
  const code = pre?.querySelector('code')
  if (code) {
    navigator.clipboard.writeText(code.textContent || '').then(() => {
      btn.textContent = '已复制!'
      setTimeout(() => {
        btn.textContent = '复制'
      }, 2000)
    })
  }
}
</script>

<template>
  <div class="article-view" v-if="!isLoading && article">
    <NavBar />

    <header class="article-header">
      <div class="header-bg">
        <img
          :src="coverError ? defaultCover : article.cover"
          :alt="article.title"
          @error="handleCoverError"
        />
        <div class="header-overlay"></div>
      </div>
      <div class="header-content">
        <div class="article-meta-top">
          <span class="category-badge" :style="{ background: categoryInfo.color }">
            {{ categoryInfo.label }}
          </span>
          <span class="publish-date">{{ formatDate(article.publishDate) }}</span>
        </div>
        <h1 class="article-title">
          {{ article.title }}
          <!-- 私有标识 -->
          <span v-if="article.isPrivate" class="private-badge" title="私有文章">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 1C8.676 1 6 3.676 6 7v2H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v2H8V7c0-2.276 1.724-4 4-4zm0 10a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"
              />
            </svg>
            私有
          </span>
          <!-- 编辑按钮 -->
          <button v-if="canEdit" class="edit-btn" @click="goToEdit" title="编辑文章">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            编辑
          </button>
        </h1>
        <div class="article-meta">
          <div class="author-info">
            <img :src="article.author.avatar" :alt="article.author.name" class="avatar" />
            <div class="author-details">
              <span class="author-name">{{ article.author.name }}</span>
              <span class="author-bio">{{ article.author.bio }}</span>
            </div>
          </div>
          <div class="article-stats">
            <span class="stat">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12,6 12,12 16,14" />
              </svg>
              {{ article.readTime }} 分钟阅读
            </span>
            <span class="stat">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {{ article.views }} 阅读
            </span>
          </div>
        </div>
      </div>
    </header>

    <main class="article-main" :class="{ 'has-toc': hasToc }">
      <aside class="article-sidebar" v-if="tocItems.length > 0">
        <div class="toc">
          <h4>目录</h4>
          <nav>
            <a
              v-for="item in tocItems"
              :key="item.id"
              :class="['toc-link', `level-${item.level}`]"
              @click.prevent="scrollToSection(item.id)"
            >
              {{ item.text }}
            </a>
          </nav>
        </div>
      </aside>

      <article class="article-content">
        <!-- <div class="content-body" v-html="renderContent(article.content)"></div> -->
        <div class="markdown-body" v-html="showArticleContent"></div>

        <div class="article-tags" v-if="article.tags && article.tags.length > 0">
          <span class="tags-label">标签:</span>
          <router-link v-for="tag in article.tags" :key="tag" :to="`/tag/${tag}`" class="tag">
            {{ tag }}
          </router-link>
        </div>

        <div class="article-actions">
          <LikeButton
            :article-id="article.id"
            :initial-likes="article?.likes || 0"
            :initial-liked="article?.isLiked || false"
            @like-change="handleLikeChange"
          />
          <FavoriteButton
            :article-id="article.id"
            :initial-favorited="article?.isFavorited || false"
            :initial-favorites="article?.favorites || 0"
            @favorite-change="handleFavoriteChange"
          />
          <button class="back-btn" @click="router.push('/')">← 返回首页</button>
        </div>
      </article>

      <!-- 右侧侧边栏 -->
      <aside class="article-right-sidebar">
        <!-- 作者信息 -->
        <div class="sidebar-widget author-widget">
          <h4>作者</h4>
          <div class="author-info">
            <img
              v-if="article?.author?.avatar"
              :src="article.author.avatar"
              :alt="article.author.name"
              class="author-avatar"
            />
            <div v-else class="author-avatar">
              <span>{{ article?.author?.name?.charAt(0) || 'L' }}</span>
            </div>
            <div class="author-details">
              <span class="author-name">{{ article?.author?.name || 'Lumina' }}</span>
              <span class="author-title">技术博主</span>
            </div>
          </div>
          <p class="author-bio">
            {{ article?.author?.bio || '热爱技术，分享开发经验，探索技术的星辰大海。' }}
          </p>

          <!-- 发消息按钮 -->
          <button
            v-if="userStore.isLoggedIn && article?.author?.name !== userStore.user?.username"
            class="message-author-btn"
            @click="handleMessageAuthor"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            发消息
          </button>

          <!-- 作者统计数据 -->
          <div class="author-stats">
            <div class="author-stat">
              <span class="stat-num">{{ authorStats.articleCount }}</span>
              <span class="stat-label">文章</span>
            </div>
            <div class="author-stat">
              <span class="stat-num">{{ authorStats.totalLikes }}</span>
              <span class="stat-label">获赞</span>
            </div>
            <div class="author-stat">
              <span class="stat-num">{{ authorStats.totalViews }}</span>
              <span class="stat-label">访问</span>
            </div>
          </div>
        </div>

        <!-- 相关文章 -->
        <div class="sidebar-widget" v-if="relatedArticles.length > 0">
          <h4>相关文章</h4>
          <div class="related-articles">
            <router-link
              v-for="related in relatedArticles"
              :key="related.id"
              :to="`/article/${related.id}`"
              class="related-item"
            >
              <img :src="related.cover" :alt="related.title" class="related-cover" />
              <span class="related-title">{{ related.title }}</span>
            </router-link>
          </div>
        </div>

        <!-- 标签云 -->
        <div class="sidebar-widget" v-if="article.tags && article.tags.length > 0">
          <h4>标签云</h4>
          <div class="tag-cloud">
            <router-link
              v-for="tag in article.tags"
              :key="tag"
              :to="`/tag/${tag}`"
              class="tag-item"
            >
              {{ tag }}
            </router-link>
          </div>
        </div>

        <!-- 目录导航（移动端） -->
        <div class="sidebar-widget toc-widget" v-if="tocItems.length > 0">
          <h4>目录</h4>
          <nav class="toc-nav">
            <a
              v-for="item in tocItems"
              :key="item.id"
              :class="['toc-link', `level-${item.level}`]"
              @click.prevent="scrollToSection(item.id)"
            >
              {{ item.text }}
            </a>
          </nav>
        </div>
      </aside>
    </main>

    <!-- 评论区域 -->
    <section class="comments-section">
      <CommentSection
        v-if="article.comments"
        :article-id="article.id"
        :comments="article.comments"
        @comment-added="handleCommentAdded"
      />
    </section>
  </div>

  <div class="loading" v-else-if="isLoading">
    <div class="loading-spinner"></div>
    <p>加载中...</p>
  </div>

  <div class="not-found" v-else>
    <h1>文章不存在</h1>
    <p>抱歉，您访问的文章不存在或已被删除。</p>
    <router-link to="/" class="back-home">返回首页</router-link>
  </div>

  <!-- 发消息弹窗 -->
  <div v-if="showMessageModal" class="message-modal-overlay" @click.self="showMessageModal = false">
    <div class="message-modal">
      <div class="modal-header">
        <h3>发消息给 {{ authorUsername }}</h3>
        <button class="close-btn" @click="showMessageModal = false">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="modal-body">
        <textarea
          v-model="messageContent"
          placeholder="输入消息内容..."
          rows="5"
          autofocus
        ></textarea>
      </div>
      <div class="modal-footer">
        <button class="cancel-btn" @click="showMessageModal = false">取消</button>
        <button
          class="send-btn"
          @click="sendMessage"
          :disabled="!messageContent.trim() || sendingMessage"
        >
          {{ sendingMessage ? '发送中...' : '发送' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.article-view {
  min-height: 100vh;
}

.article-header {
  position: relative;
  min-height: 350px;
  max-height: 500px;
  display: flex;
  align-items: flex-end;
  padding: 48px 24px;
  margin-top: 70px;
  overflow: hidden;
}

.header-bg {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 0;
}

.header-bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.header-overlay {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: linear-gradient(
    to bottom,
    rgba(10, 14, 23, 0.3) 0%,
    rgba(10, 14, 23, 0.8) 60%,
    var(--color-bg-deep) 100%
  );
}

.header-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 24px;
  box-sizing: border-box;
}

.article-meta-top {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.category-badge {
  padding: var(--space-xs) var(--space-md);
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 600;
  color: white;
}

.publish-date {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.article-title {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 700;
  line-height: 1.25;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.private-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
  background: rgba(123, 97, 255, 0.9);
  border-radius: 20px;
}

.edit-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  background: var(--color-bg-tertiary);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-btn:hover {
  color: var(--color-primary);
  background: rgba(99, 102, 241, 0.1);
  border-color: var(--color-primary);
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-lg);
}

.author-info {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 2px solid var(--color-primary);
}

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 600;
  color: var(--color-text-primary);
}

.author-bio {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.article-stats {
  display: flex;
  gap: var(--space-lg);
}

.stat {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.article-main {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 24px;
  display: flex;
  flex-direction: row;
  gap: 48px;
  box-sizing: border-box;
}

.article-sidebar {
  position: sticky;
  top: 100px;
  flex-shrink: 0;
  width: 180px;
  height: fit-content;
}

.article-content {
  flex: 1;
  min-width: 0;
  max-width: 700px;
  margin: 0 auto;
}

/* 有目录时不居中 */
.article-main.has-toc .article-content {
  margin-left: 0;
}

.article-right-sidebar {
  position: sticky;
  top: 100px;
  flex-shrink: 0;
  width: 260px;
  height: fit-content;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.comments-section {
  max-width: 900px;
  margin: 0 auto;
  padding: 48px 24px;
}

.sidebar-widget {
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 20px;
}

.sidebar-widget h4 {
  font-size: 0.9375rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--color-text-primary);
}

/* 作者信息 */
.author-widget .author-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.25rem;
  object-fit: cover;
}

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 0.9375rem;
}

.author-title {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.author-bio {
  font-size: 0.8125rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0 0 16px 0;
}

/* 作者统计数据 */
.author-stats {
  display: flex;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

.author-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.author-stat .stat-num {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.author-stat .stat-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

/* 发消息按钮 */
.message-author-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  margin-top: 12px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.message-author-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 217, 255, 0.3);
}

/* 发消息弹窗 */
.message-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.message-modal {
  width: 90%;
  max-width: 480px;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  overflow: hidden;
}

.message-modal .modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
}

.message-modal .modal-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--color-text-primary);
}

.message-modal .close-btn {
  padding: 4px;
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.message-modal .modal-body {
  padding: 20px;
}

.message-modal textarea {
  width: 100%;
  padding: 12px;
  background: var(--color-border);
  border: 1px solid transparent;
  border-radius: 8px;
  color: var(--color-text-primary);
  font-size: 0.95rem;
  resize: none;
  outline: none;
  transition: border-color 0.2s;
}

.message-modal textarea:focus {
  border-color: var(--color-primary);
}

.message-modal .modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--color-border);
}

.message-modal .cancel-btn {
  padding: 10px 20px;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.message-modal .send-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.message-modal .send-btn:hover:not(:disabled) {
  transform: scale(1.05);
}

.message-modal .send-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 相关文章 */
.related-articles {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.related-item {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  padding: 8px;
  border-radius: 8px;
  transition: background var(--transition-fast);
}

.related-item:hover {
  background: var(--color-bg-light);
}

.related-cover {
  width: 60px;
  height: 40px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}

.related-title {
  font-size: 0.8125rem;
  color: var(--color-text-primary);
  line-height: 1.4;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 标签云 */
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  padding: 4px 10px;
  background: var(--color-bg-light);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.tag-item:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* 目录导航（移动端） */
.toc-widget {
  display: none;
}

.toc-nav {
  display: flex;
  flex-direction: column;
}

.toc-nav .toc-link {
  font-size: 0.8125rem;
  padding: 6px 0;
  color: var(--color-text-secondary);
  text-decoration: none;
  border-left: 2px solid transparent;
  padding-left: 12px;
  margin-left: -12px;
  transition: all var(--transition-fast);
}

.toc-nav .toc-link:hover {
  color: var(--color-primary);
  border-left-color: var(--color-primary);
}

.toc {
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: var(--space-lg);
}

.toc h4 {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  margin-bottom: var(--space-md);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.toc nav {
  display: flex;
  flex-direction: column;
}

.toc-link {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  padding: var(--space-xs) 0;
  cursor: pointer;
  transition: color var(--transition-fast);
}

.toc-link:hover {
  color: var(--color-primary);
}

.toc-link.level-2 {
  padding-left: var(--space-md);
}

.toc-link.level-3 {
  padding-left: var(--space-xl);
  font-size: 0.8125rem;
}
.markdown-body {
  background-color: transparent;
}
.article-tags {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
  margin-top: var(--space-2xl);
  padding-top: var(--space-xl);
  border-top: 1px solid var(--color-border);
}

.tags-label {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.tag {
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  transition: all var(--transition-fast);
}

.tag:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.article-actions {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-top: var(--space-2xl);
}

.back-btn {
  padding: var(--space-sm) var(--space-lg);
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: 50px;
  color: var(--color-text-primary);
  font-weight: 500;
  transition: all var(--transition-base);
}

.back-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.loading {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading p {
  color: var(--color-text-secondary);
}

.not-found {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-lg);
}

.not-found h1 {
  font-size: 2rem;
  margin-bottom: var(--space-md);
}

.not-found p {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-lg);
}

.back-home {
  padding: var(--space-sm) var(--space-lg);
  background: var(--color-primary);
  color: var(--color-bg-deep);
  border-radius: 50px;
  font-weight: 600;
}

@media (max-width: 1200px) {
  .article-main {
    max-width: 900px;
  }

  .article-right-sidebar {
    width: 220px;
  }
}

@media (max-width: 900px) {
  .article-main {
    flex-direction: column;
    max-width: 700px;
  }

  .article-sidebar {
    display: none;
  }

  .article-right-sidebar {
    display: none;
  }

  .toc-widget {
    display: block;
  }

  .article-content {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .article-header {
    min-height: 280px;
  }

  .article-meta {
    flex-direction: column;
    align-items: flex-start;
  }

  .article-actions {
    flex-wrap: wrap;
    gap: var(--space-sm);
  }

  .back-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
