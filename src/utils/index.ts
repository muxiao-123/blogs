import { marked, RendererObject } from 'marked'
import domPurify from 'dompurify'
import hljs from 'highlight.js'
import hljsDefineVue from 'highlightjs-vue'
import { ref, toRaw } from 'vue'
hljsDefineVue(hljs)

function escapeHtml(str: string) {
  return str.replace(/[&<>]/g, (m) => {
    if (m === '&') return '&amp;'
    if (m === '<') return '&lt;'
    if (m === '>') return '&gt;'
    return m
  })
}
const markDir = ref<{ id: string; text: string; level: number }[]>([])
let dirIndexID = 1
function slugify(text: string) {
  return text
    .toLowerCase() // 转换为小写
    .trim() // 去除首尾空格
    .replace(/[^\w\u4e00-\u9fa5\- ]/g, '') // 移除特殊字符，保留中文、字母、数字、空格和连字符
    .replace(/\s+/g, '-') // 将空格替换为连字符 '-'
    .replace(/-+$/, '') // 去除末尾多余的连字符
}
const renderer: RendererObject<string, string> = {
  code({ text, lang }) {
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
  },
  heading({ tokens, depth }) {
    // 1. 获取标题的纯文本内容
    const text = this.parser.parseInline(tokens)
    // 2. 调用 slugify 函数生成锚点 id
    const id = dirIndexID++ + '-' + slugify(text)
    markDir.value.push({ id, text, level: depth })
    return `<h${depth} id="${id}" style="scroll-margin-top: 80px">${text}</h${depth}>\n`
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
