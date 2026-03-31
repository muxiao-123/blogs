<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import { watch, onBeforeUnmount } from 'vue'

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
      }
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
    Underline
  ],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  }
})

// 监听外部值变化
watch(() => props.modelValue, (newValue) => {
  const editorInstance = editor.value
  if (editorInstance && newValue !== editorInstance.getHTML()) {
    editorInstance.commands.setContent(newValue, { emitUpdate: false })
  }
})

// 工具栏按钮点击处理
const toggleBold = () => editor.value?.chain().focus().toggleBold().run()
const toggleItalic = () => editor.value?.chain().focus().toggleItalic().run()
const toggleUnderline = () => editor.value?.chain().focus().toggleUnderline().run()
const toggleStrike = () => editor.value?.chain().focus().toggleStrike().run()
const toggleCode = () => editor.value?.chain().focus().toggleCode().run()
const toggleCodeBlock = () => editor.value?.chain().focus().toggleCodeBlock().run()
const toggleHeading = (level: 1 | 2 | 3) => editor.value?.chain().focus().toggleHeading({ level }).run()
const toggleBulletList = () => editor.value?.chain().focus().toggleBulletList().run()
const toggleOrderedList = () => editor.value?.chain().focus().toggleOrderedList().run()
const toggleBlockquote = () => editor.value?.chain().focus().toggleBlockquote().run()

const setLink = () => {
  const url = window.prompt('请输入链接地址:')
  if (url) {
    editor.value?.chain().focus().setLink({ href: url }).run()
  }
}

const unsetLink = () => {
  editor.value?.chain().focus().unsetLink().run()
}

const isActive = (type: string, attrs?: Record<string, unknown>) => {
  return editor.value?.isActive(type, attrs) ?? false
}

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<template>
  <div class="tiptap-editor">
    <!-- 工具栏 -->
    <div class="editor-toolbar">
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
          title="粗体"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>
          </svg>
        </button>
        <button
          type="button"
          :class="{ active: isActive('italic') }"
          @click="toggleItalic"
          title="斜体"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/>
          </svg>
        </button>
        <button
          type="button"
          :class="{ active: isActive('underline') }"
          @click="toggleUnderline"
          title="下划线"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/>
          </svg>
        </button>
        <button
          type="button"
          :class="{ active: isActive('strike') }"
          @click="toggleStrike"
          title="删除线"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z"/>
          </svg>
        </button>
        <button
          type="button"
          :class="{ active: isActive('code') }"
          @click="toggleCode"
          title="行内代码"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
          </svg>
        </button>
        <button
          type="button"
          :class="{ active: isActive('codeBlock') }"
          @click="toggleCodeBlock"
          title="代码块"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H4V5h16v14zM6 17h2v-2H6v2zm4-4h8v-2h-8v2zm0 4h4v-2h-4v2zm-4-8h2V7H6v2z"/>
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
            <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
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
            <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/>
          </svg>
        </button>
        <button
          type="button"
          :class="{ active: isActive('orderedList') }"
          @click="toggleOrderedList"
          title="有序列表"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/>
          </svg>
        </button>
        <button
          type="button"
          :class="{ active: isActive('blockquote') }"
          @click="toggleBlockquote"
          title="引用"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- 编辑器内容 -->
    <editor-content :editor="editor" class="editor-content" />
  </div>
</template>

<style scoped>
.tiptap-editor {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
  background: var(--color-bg-deep);
}

.editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 8px;
  background: var(--color-card-bg);
  border-bottom: 1px solid var(--color-border);
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

.editor-content {
  min-height: 300px;
  padding: 16px;
}

.editor-content :deep(.ProseMirror) {
  outline: none;
  min-height: 280px;
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
</style>
