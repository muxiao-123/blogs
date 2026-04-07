import { marked, RendererObject } from 'marked'
import domPurify from 'dompurify'
import { toHtml } from 'hast-util-to-html'
import lowlight from '@/utils//lowlight-tool'
import { ref, toRaw } from 'vue'

// ==================== 通用工具函数 ====================

export const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export const unescapeHtml = (text: string): string => {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
}

export const toSafeId = (text: string): string => {
  return text.toLowerCase().replace(/[^\u4e00-\u9fa5a-z0-9]+/g, '-')
}

// ==================== Markdown 解析函数 ====================

const markDir = ref<{ id: string; text: string; level: number }[]>([])
let dirIndexID = 1
function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\u4e00-\u9fa5\- ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+$/, '')
}

const renderer: RendererObject<string, string> = {
  code({ text, lang }) {
    const validLang = lang && lowlight.registered(lang) ? lang : 'plaintext'
    try {
      // 2. highlight 返回的是 AST 对象，不是字符串
      const result = lowlight.highlight(validLang, text)
      // 3. 使用 hast-util-to-html 将 AST 转换为 HTML 字符串
      const highlightedHtml = toHtml(result)
      return `
        <div class="code-block-wrapper">
          <div class="code-block-header">
            <span class="code-language">${validLang}</span>
            <button class="copy-code-btn" data-code="${escapeHtml(text)}">复制</button>
          </div>
          <pre class="hljs"><code class="language-${validLang}">${highlightedHtml}</code></pre>
        </div>
      `
    } catch (err) {
      // 高亮失败时返回纯文本
      return `
        <div class="code-block-wrapper">
          <div class="code-block-header">
            <span class="code-language">${validLang}</span>
            <button class="copy-code-btn" data-code="${escapeHtml(text)}">复制</button>
          </div>
          <pre class="hljs"><code>${escapeHtml(text)}</code></pre>
        </div>
      `
    }
  },
  heading({ tokens, depth }) {
    const text = this.parser.parseInline(tokens)
    const id = dirIndexID++ + '-' + slugify(text)
    markDir.value.push({ id, text, level: depth })
    return `<h${depth} id="${id}" style="scroll-margin-top: 80px">${text}</h${depth}>\n`
  }
}

// 复制代码功能
if (typeof window !== 'undefined') {
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
}

export const formatContent = async (content: string) => {
  markDir.value = []
  marked.use({ renderer: renderer as RendererObject<string, string> })
  let res = await marked.parse(content)
  res = domPurify.sanitize(res)
  document.addEventListener('click', async (e) => {
    const btn = (e.target as Element)?.closest('.copy-code-btn')
    if (!btn) return
    try {
      const code = btn.getAttribute('data-code')
      await navigator.clipboard.writeText(code!)
      const original = btn.textContent
      btn.textContent = '已复制！'
      setTimeout(() => (btn.textContent = original), 2000)
    } catch (error) {
      console.log(error)
    }
  })
  const rawMarkDir = toRaw(markDir.value)
  markDir.value = []
  dirIndexID = 1
  return {
    res,
    markDir: rawMarkDir
  }
}
