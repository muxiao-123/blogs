import { marked, RendererObject } from 'marked'
import domPurify from 'dompurify'
// import { markedHighlight } from 'marked-highlight'
import hljs from 'highlight.js'

function escapeHtml(str: string) {
  return str.replace(/[&<>]/g, (m) => {
    if (m === '&') return '&amp;'
    if (m === '<') return '&lt;'
    if (m === '>') return '&gt;'
    return m
  })
}
const renderer = {
  code({ text, lang }: { text: string; lang: string }) {
    // 获取有效的语言名称
    const validLang = lang && hljs.getLanguage(lang) ? lang : 'plaintext'
    // 高亮代码
    const highlighted = hljs.highlight(text, { language: validLang }).value

    return `
      <div class="code-block-wrapper">
        <div class="code-block-header">
          <span class="code-language">${validLang}</span>
          <button class="copy-code-btn" data-code="${escapeHtml(text)}">复制</button>
        </div>
        <pre class="hljs"><code class="language-${validLang}">${highlighted}</code></pre>
      </div>
    `
  }
}

export const formatContent = async (content: string) => {
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
  return res
}
