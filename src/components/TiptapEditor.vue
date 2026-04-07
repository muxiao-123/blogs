<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { watch, onBeforeUnmount } from 'vue'
import { Markdown } from 'tiptap-markdown-3'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3]
      },
      link: false,
      codeBlock: false,
      underline: false,
      horizontalRule: false
    }),
    Placeholder.configure({
      placeholder: props.placeholder || '开始编写内容...'
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'editor-link'
      }
    }),
    Underline,
    TextStyle,
    Color.configure({
      types: ['textStyle']
    }),
    Highlight.configure({
      multicolor: true
    }),
    TextAlign.configure({
      types: ['heading', 'paragraph'],
      alignments: ['left', 'center', 'right', 'justify']
    }),
    CodeBlockLowlight.configure({
      lowlight: createLowlight(common)
    }),
    HorizontalRule,
    Table.configure({
      resizable: true,
      HTMLAttributes: {
        class: 'editor-table'
      }
    }),
    TableRow,
    TableCell,
    TableHeader,
    Markdown.configure({
      html: true, // 关键：允许 HTML 输入/输出，解决混合格式需求
      linkify: false, // 自动识别 URL
      breaks: false, // 换行符转 <br>
      transformPastedText: true, // 粘贴时自动解析 Markdown
      transformCopiedText: true // 复制时转为 Markdown
      // 🎯 核心：自定义代码块的序列化逻辑
    })
  ],
  editorProps: {
    attributes: {
      spellcheck: 'false'
    }
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  }
})

watch(
  () => props.modelValue,
  (newValue) => {
    const editorInstance = editor.value
    if (editorInstance && newValue !== editorInstance.getHTML()) {
      editorInstance.commands.setContent(newValue, { emitUpdate: false })
    }
  }
)

const isActive = (type: string, attrs?: Record<string, unknown>) => {
  return editor.value?.isActive(type, attrs) ?? false
}

const isTextAlignActive = (align: 'left' | 'center' | 'right' | 'justify') => {
  return editor.value?.isActive({ textAlign: align }) ?? false
}

// 文本格式
const toggleBold = () => editor.value?.chain().focus().toggleBold().run()
const toggleItalic = () => editor.value?.chain().focus().toggleItalic().run()
const toggleUnderline = () => editor.value?.chain().focus().toggleUnderline().run()
const toggleStrike = () => editor.value?.chain().focus().toggleStrike().run()
const toggleCode = () => editor.value?.chain().focus().toggleCode().run()
const toggleCodeBlock = () => editor.value?.chain().focus().toggleCodeBlock().run()
const clearFormat = () => editor.value?.chain().focus().clearNodes().unsetAllMarks().run()

// 标题
const toggleHeading = (level: 1 | 2 | 3) =>
  editor.value?.chain().focus().toggleHeading({ level }).run()

// 列表
const toggleBulletList = () => editor.value?.chain().focus().toggleBulletList().run()
const toggleOrderedList = () => editor.value?.chain().focus().toggleOrderedList().run()
const toggleBlockquote = () => editor.value?.chain().focus().toggleBlockquote().run()
const setHorizontalRule = () => editor.value?.chain().focus().setHorizontalRule().run()

// 表格操作
const insertTable = () => {
  editor.value?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
}
const addColumnBefore = () => editor.value?.chain().focus().addColumnBefore().run()
const addColumnAfter = () => editor.value?.chain().focus().addColumnAfter().run()
const deleteColumn = () => editor.value?.chain().focus().deleteColumn().run()
const addRowBefore = () => editor.value?.chain().focus().addRowBefore().run()
const addRowAfter = () => editor.value?.chain().focus().addRowAfter().run()
const deleteRow = () => editor.value?.chain().focus().deleteRow().run()
const deleteTable = () => editor.value?.chain().focus().deleteTable().run()
const mergeCells = () => editor.value?.chain().focus().mergeCells().run()
const splitCell = () => editor.value?.chain().focus().splitCell().run()
const toggleHeaderColumn = () => editor.value?.chain().focus().toggleHeaderColumn().run()
const toggleHeaderRow = () => editor.value?.chain().focus().toggleHeaderRow().run()
const toggleHeaderCell = () => editor.value?.chain().focus().toggleHeaderCell().run()

// 对齐
const setTextAlign = (align: 'left' | 'center' | 'right' | 'justify') => {
  editor.value?.chain().focus().setTextAlign(align).run()
}

let tempTextColor: string | null
// 颜色
const setTextColor = () => {
  if (tempTextColor) {
    tempTextColor = ''
    editor.value?.chain().focus().unsetColor().run()
    return
  }
  const color = window.prompt('请输入字体颜色 (如 #ff0000):')
  tempTextColor = color
  if (color) {
    editor.value?.chain().focus().setColor(color).run()
  }
}
let tempColor: string | null
const setHighlight = () => {
  if (tempColor) {
    tempColor = ''
    editor.value?.chain().focus().unsetHighlight().run()
    return
  }
  const color = window.prompt('请输入高亮颜色 (如 #ffff00):')
  tempColor = color
  if (color) {
    editor.value?.chain().focus().setHighlight({ color }).run()
  }
}

// 链接
const setLink = () => {
  const url = window.prompt('请输入链接地址:')
  if (url) {
    editor.value?.chain().focus().setLink({ href: url }).run()
  }
}

const unsetLink = () => {
  editor.value?.chain().focus().unsetLink().run()
}

// 撤销/重做
const undo = () => editor.value?.chain().focus().undo().run()
const redo = () => editor.value?.chain().focus().redo().run()

onBeforeUnmount(() => {
  editor.value?.destroy()
})
const getMarkdown = () => {
  return (
    editor.value?.storage as unknown as { markdown: { getMarkdown: () => string } }
  ).markdown?.getMarkdown()
}
defineExpose({
  getMarkdown
})
</script>

<template>
  <div class="tiptap-editor">
    <!-- 工具栏 -->
    <div class="editor-toolbar">
      <!-- 撤销/重做 -->
      <div class="toolbar-group">
        <button type="button" @click="undo" title="撤销 (Ctrl+Z)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"
            />
          </svg>
        </button>
        <button type="button" @click="redo" title="重做 (Ctrl+Y)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"
            />
          </svg>
        </button>
      </div>

      <!-- 标题 -->
      <div class="toolbar-group">
        <button
          type="button"
          :class="{ active: isActive('heading', { level: 1 }) }"
          @click="toggleHeading(1)"
          title="一级标题"
        >
          H1
        </button>
        <button
          type="button"
          :class="{ active: isActive('heading', { level: 2 }) }"
          @click="toggleHeading(2)"
          title="二级标题"
        >
          H2
        </button>
        <button
          type="button"
          :class="{ active: isActive('heading', { level: 3 }) }"
          @click="toggleHeading(3)"
          title="三级标题"
        >
          H3
        </button>
      </div>

      <!-- 文本格式 -->
      <div class="toolbar-group">
        <button
          type="button"
          :class="{ active: isActive('bold') }"
          @click="toggleBold"
          title="粗体 (Ctrl+B)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"
            />
          </svg>
        </button>
        <button
          type="button"
          :class="{ active: isActive('italic') }"
          @click="toggleItalic"
          title="斜体 (Ctrl+I)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z" />
          </svg>
        </button>
        <button
          type="button"
          :class="{ active: isActive('underline') }"
          @click="toggleUnderline"
          title="下划线 (Ctrl+U)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"
            />
          </svg>
        </button>
        <button
          type="button"
          :class="{ active: isActive('strike') }"
          @click="toggleStrike"
          title="删除线"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z" />
          </svg>
        </button>
        <button type="button" @click="clearFormat" title="清除格式">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
            />
          </svg>
        </button>
      </div>

      <!-- 代码 -->
      <div class="toolbar-group">
        <button
          type="button"
          :class="{ active: isActive('code') }"
          @click="toggleCode"
          title="行内代码"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"
            />
          </svg>
        </button>
        <button
          type="button"
          :class="{ active: isActive('codeBlock') }"
          @click="toggleCodeBlock"
          title="代码块"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L20 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4zM5 18h14v2H5z"
            />
          </svg>
        </button>
      </div>

      <!-- 颜色 -->
      <div class="toolbar-group">
        <button type="button" @click="setTextColor" title="字体颜色">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M11 3L5.5 17h2.25l1.12-3h6.25l1.12 3h2.25L13 3h-2zm-1.38 9L12 5.67 14.38 12H9.62z"
            />
          </svg>
        </button>
        <button type="button" @click="setHighlight" title="文字高亮">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.5 4l-5-1-5 1v6l5-1 5 1V4zm0 8l-5 1-5-1v-2l5 1 5-1v2z" />
          </svg>
        </button>
      </div>

      <!-- 对齐 -->
      <div class="toolbar-group">
        <button
          type="button"
          :class="{ active: isTextAlignActive('left') }"
          @click="setTextAlign('left')"
          title="左对齐"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z"
            />
          </svg>
        </button>
        <button
          type="button"
          :class="{ active: isTextAlignActive('center') }"
          @click="setTextAlign('center')"
          title="居中"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z" />
          </svg>
        </button>
        <button
          type="button"
          :class="{ active: isTextAlignActive('right') }"
          @click="setTextAlign('right')"
          title="右对齐"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z" />
          </svg>
        </button>
        <button
          type="button"
          :class="{ active: isTextAlignActive('justify') }"
          @click="setTextAlign('justify')"
          title="两端对齐"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zm0-6v2h18V3H3z" />
          </svg>
        </button>
      </div>

      <!-- 列表 -->
      <div class="toolbar-group">
        <button
          type="button"
          :class="{ active: isActive('bulletList') }"
          @click="toggleBulletList"
          title="无序列表"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"
            />
          </svg>
        </button>
        <button
          type="button"
          :class="{ active: isActive('orderedList') }"
          @click="toggleOrderedList"
          title="有序列表"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"
            />
          </svg>
        </button>
        <button
          type="button"
          :class="{ active: isActive('blockquote') }"
          @click="toggleBlockquote"
          title="引用"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
          </svg>
        </button>
        <button type="button" @click="setHorizontalRule" title="水平分割线">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 11h16v2H4z" />
          </svg>
        </button>
      </div>

      <!-- 表格 -->
      <div class="toolbar-group" v-if="editor">
        <button
          type="button"
          @click="insertTable"
          title="插入表格"
          :disabled="!editor.can().insertTable({ rows: 3, cols: 3, withHeaderRow: true })"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M20 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM10 17H5v-2h5v2zm0-4H5v-2h5v2zm0-4H5V7h5v2zm9 8h-7v-2h7v2zm0-4h-7v-2h7v2zm0-4h-7V7h7v2z"
            />
          </svg>
        </button>
        <button
          type="button"
          @click="addColumnBefore"
          title="左侧插入列"
          :disabled="!editor.isActive('table')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11 7v10H9v-4H5v4H3V7h2v4h4V7h2zm10 0v4h-2v4h4v-4h-2v-4z" />
          </svg>
        </button>
        <button
          type="button"
          @click="addColumnAfter"
          title="右侧插入列"
          :disabled="!editor.isActive('table')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M13 7v10h2v-4h4v4h2V7h-2v4h-4V7h-2zm-2 0H9v4H5v4H3V7h2v4h4V7h2zm-4 8v-4h2v4H7zm4 0v-4h2v4h-2zm4 0v-4h2v4h-2z"
            />
          </svg>
        </button>
        <button
          type="button"
          @click="deleteColumn"
          title="删除列"
          :disabled="!editor.isActive('table')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M15 2H9v2h6V2zm-2 8h2v12H5V10h2V8H5c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h8v-2H5v-2h8v-2zm-2 4H7v6h4v-6z"
            />
          </svg>
        </button>
        <button
          type="button"
          @click="addRowBefore"
          title="上方插入行"
          :disabled="!editor.isActive('table')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 13v2h10v-2H7zm4-6v4h2V7h4v2h2V5H9v6H7V7h4z" />
          </svg>
        </button>
        <button
          type="button"
          @click="addRowAfter"
          title="下方插入行"
          :disabled="!editor.isActive('table')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 7v4h10V7h-2v4h-2V7H9v4H7V7zm10 6v2h-4v2h-2v-2h-4v-2h4v-2h2v2h4z" />
          </svg>
        </button>
        <button
          type="button"
          @click="deleteRow"
          title="删除行"
          :disabled="!editor.isActive('table')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M7 15v2h10v-2H7zm0-4h10v-2H7v-2h10v-2H7V7h10V5H7v4H5V5c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2h-2v2h2c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2v-4h2v4h10v-4H9z"
            />
          </svg>
        </button>
        <button
          type="button"
          @click="deleteTable"
          title="删除表格"
          :disabled="!editor.isActive('table')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM8 9h8v10H8V9zm7.5-5l-1-1h-5l-1 1H5v2h14V4h-3.5z"
            />
          </svg>
        </button>
      </div>

      <!-- 链接 -->
      <div class="toolbar-group">
        <button
          type="button"
          :class="{ active: isActive('link') }"
          @click="isActive('link') ? unsetLink() : setLink()"
          title="链接"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- 编辑器内容 -->
    <div class="editor-content-wrapper">
      <editor-content :editor="editor" class="editor-content" />
    </div>
  </div>
</template>

<style scoped>
.tiptap-editor {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
  background: var(--color-bg-deep);
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100%;
}

.editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 8px;
  background: var(--color-card-bg);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
  height: auto;
  min-height: 50px;
}

.toolbar-group {
  display: flex;
  gap: 2px;
  padding-right: 8px;
  border-right: 1px solid var(--color-border);
}

.toolbar-group:last-child {
  border-right: none;
}

.toolbar-group button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-weight: 600;
  font-size: 0.75rem;
}

.toolbar-group button:hover {
  background: var(--color-bg-light);
  color: var(--color-text-primary);
}

.toolbar-group button.active {
  background: var(--color-primary);
  color: white;
}

.editor-content-wrapper {
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.editor-content {
  min-height: 100%;
  padding: 16px;
  height: 100%;
}

.editor-content :deep(.ProseMirror) {
  outline: none;
  min-height: 200px;
  height: auto;
}

.editor-content :deep(.ProseMirror p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: var(--color-text-secondary);
  opacity: 0.6;
  pointer-events: none;
  height: 0;
}

.editor-content :deep(.ProseMirror h1) {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 1.5rem 0 1rem;
}

.editor-content :deep(.ProseMirror h2) {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 1.25rem 0 0.75rem;
}

.editor-content :deep(.ProseMirror h3) {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 1rem 0 0.5rem;
}

.editor-content :deep(.ProseMirror p) {
  margin: 0.75rem 0;
  line-height: 1.7;
}

.editor-content :deep(.ProseMirror ul),
.editor-content :deep(.ProseMirror ol) {
  padding-left: 1.5rem;
  margin: 0.75rem 0;
}

.editor-content :deep(.ProseMirror li) {
  margin: 0.25rem 0;
}

.editor-content :deep(.ProseMirror blockquote) {
  border-left: 3px solid var(--color-primary);
  padding-left: 1rem;
  margin: 1rem 0;
  color: var(--color-text-secondary);
  font-style: italic;
}

.editor-content :deep(.ProseMirror code) {
  background: var(--color-bg-light);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-family: 'Fira Code', monospace;
  font-size: 0.9em;
}

.editor-content :deep(.ProseMirror pre) {
  background: var(--color-bg-light);
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  margin: 1rem 0;
}

.editor-content :deep(.ProseMirror pre code) {
  background: none;
  padding: 0;
  font-size: 0.875rem;
}

.editor-content :deep(.ProseMirror a),
.editor-content :deep(.editor-link) {
  color: var(--color-primary);
  text-decoration: underline;
  cursor: pointer;
}

.editor-content :deep(.ProseMirror strong) {
  font-weight: 700;
}

.editor-content :deep(.ProseMirror em) {
  font-style: italic;
}

.editor-content :deep(.ProseMirror u) {
  text-decoration: underline;
}

.editor-content :deep(.ProseMirror s) {
  text-decoration: line-through;
}

.editor-content :deep(.ProseMirror hr) {
  border: none;
  border-top: 1px solid var(--color-border);
  margin: 1.5rem 0;
}

.editor-content :deep(.ProseMirror mark) {
  background-color: #fef08a;
  padding: 0.1rem 0.2rem;
  border-radius: 2px;
}

/* 表格样式 */
.editor-content :deep(.ProseMirror table) {
  border-collapse: collapse;
  table-layout: fixed;
  width: 100%;
  margin: 1rem 0;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  overflow: hidden;
}

.editor-content :deep(.ProseMirror table td),
.editor-content :deep(.ProseMirror table th) {
  border: 1px solid var(--color-border);
  padding: 8px 12px;
  min-width: 80px;
  vertical-align: top;
  position: relative;
}

.editor-content :deep(.ProseMirror table th) {
  background: var(--color-bg-light);
  font-weight: 600;
  text-align: left;
}

.editor-content :deep(.ProseMirror table .selectedCell:after) {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(123, 97, 255, 0.2);
  pointer-events: none;
}

.editor-content :deep(.ProseMirror .column-resize-handle) {
  position: absolute;
  right: -2px;
  top: 0;
  bottom: -2px;
  width: 4px;
  background: var(--color-primary);
  cursor: col-resize;
  pointer-events: all;
}

.editor-content :deep(.ProseMirror table p) {
  margin: 0;
}

/* 禁用按钮样式 */
.toolbar-group button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
