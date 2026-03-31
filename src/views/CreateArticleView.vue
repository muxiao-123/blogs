<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useArticleStore, type CreateArticleInput } from '@/stores/articles'
import { useUserStore } from '@/stores/user'
import { categories } from '@/data/articles'
import { api } from '@/api/index'
import type { Category } from '@/types'
import NavBar from '@/components/NavBar.vue'
import SiteFooter from '@/components/SiteFooter.vue'
import TiptapEditor from '@/components/TiptapEditor.vue'

const router = useRouter()
const route = useRoute()
const articleStore = useArticleStore()
const userStore = useUserStore()

const isUploading = ref(false)
const uploadError = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

const isEditMode = computed(() => !!route.params.id)
const editArticleId = computed(() => route.params.id as string)

const formData = ref<CreateArticleInput>({
  title: '',
  excerpt: '',
  content: '',
  cover: '',
  category: 'frontend',
  tags: []
})

const STORAGE_KEY = 'lumina_draft_article'

// 从 localStorage 恢复草稿
const restoreDraft = () => {
  if (isEditMode.value) return

  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const draft = JSON.parse(saved)
      // 只有草稿有实际内容时才恢复
      if (draft.title || draft.content || draft.excerpt) {
        isRestoring.value = true
        formData.value = { ...formData.value, ...draft }
        // 延迟重置标志，确保 watch 不会立即保存空内容
        setTimeout(() => {
          isRestoring.value = false
        }, 100)
      }
    } catch (e) {
      console.error('恢复草稿失败:', e)
    }
  }
}

// 保存草稿到 localStorage（只有内容非空时才保存）
const saveDraft = () => {
  if (isEditMode.value) return

  // 只有当有实际内容时才保存
  const hasContent = formData.value.title || formData.value.content || formData.value.excerpt
  if (!hasContent) return

  const draft = {
    title: formData.value.title,
    excerpt: formData.value.excerpt,
    content: formData.value.content,
    cover: formData.value.cover,
    category: formData.value.category,
    tags: formData.value.tags
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
}

// 清除草稿
const clearDraft = () => {
  localStorage.removeItem(STORAGE_KEY)
}

// 是否正在恢复草稿中
const isRestoring = ref(false)

// 监听表单变化自动保存
watch(formData, () => {
  if (!isRestoring.value) {
    saveDraft()
  }
}, { deep: true })

const tagInput = ref('')
const isSubmitting = ref(false)
const isLoading = ref(false)
const errors = ref<Record<string, string>>({})

onMounted(async () => {
  // 尝试初始化用户状态（如果token存在但用户信息未加载）
  await userStore.init()

  if (isEditMode.value) {
    isLoading.value = true
    try {
      await articleStore.init()
      const article = articleStore.getArticleById(editArticleId.value)
      if (article) {
        formData.value = {
          title: article.title,
          excerpt: article.excerpt,
          content: article.content,
          cover: article.cover,
          category: article.category,
          tags: [...article.tags]
        }
      } else {
        errors.value.submit = '文章不存在'
      }
    } catch (e) {
      errors.value.submit = '加载文章失败'
    } finally {
      isLoading.value = false
    }
  } else {
    // 非编辑模式下恢复草稿
    restoreDraft()
  }
})

const coverOptions = [
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=85',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=85',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=85',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=85',
  'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&q=85',
  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&q=85',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&q=85',
  'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=600&q=85'
]

// 默认选中第一个封面
formData.value.cover = coverOptions[0]

const validateForm = (): boolean => {
  errors.value = {}

  if (!formData.value.title.trim()) {
    errors.value.title = '请输入文章标题'
  } else if (formData.value.title.length < 5) {
    errors.value.title = '标题至少需要5个字符'
  }

  if (!formData.value.excerpt.trim()) {
    errors.value.excerpt = '请输入文章摘要'
  } else if (formData.value.excerpt.length < 10) {
    errors.value.excerpt = '摘要至少需要10个字符'
  }

  // 去除 HTML 标签后计算纯文本长度
  const contentText = formData.value.content.replace(/<[^>]*>/g, '').trim()
  if (!contentText) {
    errors.value.content = '请输入文章内容'
  } else if (contentText.length < 50) {
    errors.value.content = '内容至少需要50个字符'
  }

  if (!formData.value.cover) {
    errors.value.cover = '请选择封面图片'
  }

  return Object.keys(errors.value).length === 0
}

const addTag = () => {
  const tag = tagInput.value.trim()
  if (tag && !formData.value.tags.includes(tag)) {
    formData.value.tags.push(tag)
    tagInput.value = ''
  }
}

const removeTag = (tag: string) => {
  formData.value.tags = formData.value.tags.filter(t => t !== tag)
}

const selectCategory = (category: Category) => {
  formData.value.category = category
}

const selectCover = (cover: string) => {
  formData.value.cover = cover
  uploadError.value = ''
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // 验证文件类型
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    uploadError.value = '请选择 JPG、PNG、GIF 或 WebP 格式的图片'
    return
  }

  // 验证文件大小 (5MB)
  if (file.size > 5 * 1024 * 1024) {
    uploadError.value = '图片大小不能超过 5MB'
    return
  }

  isUploading.value = true
  uploadError.value = ''

  try {
    const result = await api.uploadImage(file)
    formData.value.cover = result.url
  } catch (error) {
    uploadError.value = error instanceof Error ? error.message : '上传失败，请重试'
  } finally {
    isUploading.value = false
    // 清空input，允许重复选择同一文件
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

const removeCustomCover = () => {
  formData.value.cover = coverOptions[0]
  uploadError.value = ''
}

const estimatedReadTime = computed(() => {
  // 去除 HTML 标签后计算纯文本长度
  const textOnly = formData.value.content.replace(/<[^>]*>/g, '').trim()
  const length = textOnly.length
  return Math.max(1, Math.ceil(length / 500))
})

const submitForm = async () => {
  if (!validateForm()) return

  isSubmitting.value = true

  try {
    // 确保先初始化数据
    if (!articleStore.articles.length) {
      await articleStore.init()
    }

    if (isEditMode.value) {
      // 编辑模式
      const updated = await articleStore.updateArticle(editArticleId.value, formData.value)
      if (updated) {
        router.push(`/article/${editArticleId.value}`)
      } else {
        errors.value.submit = '更新文章失败，请重试'
      }
    } else {
      // 创建模式
      const newArticle = await articleStore.createArticle(formData.value)
      if (newArticle) {
        clearDraft() // 成功后清除草稿
        router.push(`/article/${newArticle.id}`)
      } else {
        errors.value.submit = '创建文章失败，请重试'
      }
    }
  } catch (error) {
    errors.value.submit = isEditMode.value ? '更新文章失败，请重试' : '创建文章失败，请重试'
  } finally {
    isSubmitting.value = false
  }
}

const goBack = () => {
  router.push('/')
}
</script>

<template>
  <div class="create-article-view">
    <NavBar />

    <main class="create-main">
      <div class="create-container">
        <header class="create-header">
          <button class="back-link" @click="goBack">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            返回首页
          </button>
          <h1 class="page-title">{{ isEditMode ? '编辑文章' : '创建新文章' }}</h1>
          <p class="page-desc">{{ isEditMode ? '修改你的文章内容' : '分享你的技术见解和经验' }}</p>
        </header>

        <form class="article-form" @submit.prevent="submitForm">
          <!-- 标题 -->
          <div class="form-group">
            <label for="title">文章标题 <span class="required">*</span></label>
            <input
              id="title"
              v-model="formData.title"
              type="text"
              placeholder="输入一个有吸引力的标题..."
              :class="{ error: errors.title }"
            />
            <span v-if="errors.title" class="error-message">{{ errors.title }}</span>
          </div>

          <!-- 摘要 -->
          <div class="form-group">
            <label for="excerpt">文章摘要 <span class="required">*</span></label>
            <textarea
              id="excerpt"
              v-model="formData.excerpt"
              rows="3"
              placeholder="简要描述文章内容..."
              :class="{ error: errors.excerpt }"
            ></textarea>
            <span v-if="errors.excerpt" class="error-message">{{ errors.excerpt }}</span>
          </div>

          <!-- 分类 -->
          <div class="form-group">
            <label>文章分类 <span class="required">*</span></label>
            <div class="category-options">
              <button
                v-for="cat in categories"
                :key="cat.key"
                type="button"
                class="category-btn"
                :class="{ active: formData.category === cat.key }"
                :style="{
                  '--cat-color': cat.color,
                  '--cat-glow': `0 0 10px ${cat.color}40`
                }"
                @click="selectCategory(cat.key)"
              >
                {{ cat.label }}
              </button>
            </div>
          </div>

          <!-- 封面 -->
          <div class="form-group">
            <label>封面图片 <span class="required">*</span></label>

            <!-- 自定义上传区域 -->
            <div class="custom-upload">
              <input
                ref="fileInput"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                class="file-input"
                @change="handleFileSelect"
              />
              <div class="upload-btn" @click="triggerFileInput">
                <svg v-if="!isUploading" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <span v-if="isUploading" class="upload-spinner"></span>
                <span>{{ isUploading ? '上传中...' : '上传图片' }}</span>
              </div>
              <span v-if="uploadError" class="error-message">{{ uploadError }}</span>
            </div>

            <!-- 自定义封面预览 -->
            <div v-if="formData.cover && !coverOptions.includes(formData.cover)" class="custom-cover-preview">
              <img :src="formData.cover" alt="自定义封面" />
              <button type="button" class="remove-cover" @click="removeCustomCover">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div class="cover-grid">
              <button
                v-for="(cover, index) in coverOptions"
                :key="index"
                type="button"
                class="cover-option"
                :class="{ selected: formData.cover === cover }"
                @click="selectCover(cover)"
              >
                <img :src="cover" :alt="`Cover ${index + 1}`" loading="lazy" />
                <div class="cover-check">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              </button>
            </div>
            <span v-if="errors.cover" class="error-message">{{ errors.cover }}</span>
          </div>

          <!-- 标签 -->
          <div class="form-group">
            <label>文章标签</label>
            <div class="tag-input-wrapper">
              <input
                v-model="tagInput"
                type="text"
                placeholder="输入标签后按回车添加..."
                @keyup.enter.prevent="addTag"
              />
              <button type="button" class="add-tag-btn" @click="addTag">添加</button>
            </div>
            <div class="tags-list" v-if="formData.tags.length > 0">
              <span v-for="tag in formData.tags" :key="tag" class="tag">
                {{ tag }}
                <button type="button" class="tag-remove" @click="removeTag(tag)">×</button>
              </span>
            </div>
          </div>

          <!-- 内容 -->
          <div class="form-group">
            <label for="content">
              文章内容 <span class="required">*</span>
              <span class="read-time">预计阅读时间: {{ estimatedReadTime }} 分钟</span>
            </label>
            <TiptapEditor
              id="content"
              v-model="formData.content"
              placeholder="开始编写文章内容..."
              :class="{ error: errors.content }"
            />
            <span v-if="errors.content" class="error-message">{{ errors.content }}</span>
            <div class="content-hint">
              支持富文本格式：标题、粗体、斜体、代码、链接、列表等
            </div>
          </div>

          <!-- 提交按钮 -->
          <div class="form-actions">
            <button type="button" class="cancel-btn" @click="goBack">取消</button>
            <button type="submit" class="submit-btn" :disabled="isSubmitting || isLoading">
              <span v-if="isSubmitting" class="spinner"></span>
              {{ isSubmitting ? (isEditMode ? '保存中...' : '发布中...') : (isEditMode ? '保存修改' : '发布文章') }}
            </button>
          </div>

          <span v-if="errors.submit" class="error-message submit-error">{{ errors.submit }}</span>
        </form>
      </div>
    </main>

    <SiteFooter />
  </div>
</template>

<style scoped>
.create-article-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.create-main {
  flex: 1;
  padding: calc(70px + var(--space-2xl)) var(--space-lg) var(--space-2xl);
}

.create-container {
  max-width: 800px;
  margin: 0 auto;
}

.create-header {
  text-align: center;
  margin-bottom: var(--space-2xl);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  margin-bottom: var(--space-lg);
  transition: color var(--transition-fast);
}

.back-link:hover {
  color: var(--color-primary);
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: var(--space-sm);
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.page-desc {
  color: var(--color-text-secondary);
}

.article-form {
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: var(--space-xl);
}

.form-group {
  margin-bottom: var(--space-xl);
}

.form-group label {
  display: block;
  font-family: var(--font-display);
  font-weight: 600;
  margin-bottom: var(--space-sm);
  color: var(--color-text-primary);
}

.required {
  color: var(--color-accent);
}

.read-time {
  float: right;
  font-weight: 400;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: var(--space-md);
  background: var(--color-bg-deep);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--color-text-primary);
  transition: all var(--transition-base);
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--glow-primary);
}

.form-group input.error,
.form-group textarea.error {
  border-color: var(--color-accent);
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: var(--color-text-secondary);
  opacity: 0.6;
}

.error-message {
  display: block;
  color: var(--color-accent);
  font-size: 0.875rem;
  margin-top: var(--space-xs);
}

.category-options {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.category-btn {
  padding: var(--space-sm) var(--space-md);
  border-radius: 50px;
  font-family: var(--font-display);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  background: var(--color-bg-deep);
  border: 1px solid var(--color-border);
  transition: all var(--transition-base);
}

.category-btn:hover {
  border-color: var(--cat-color);
  color: var(--color-text-primary);
}

.category-btn.active {
  background: var(--cat-color);
  border-color: var(--cat-color);
  color: white;
  box-shadow: var(--cat-glow);
}

.cover-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-sm);
}

.custom-upload {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-md);
}

.file-input {
  display: none;
}

.upload-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-bg-deep);
  border: 1px dashed var(--color-border);
  border-radius: 8px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-base);
}

.upload-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.upload-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(99, 102, 241, 0.3);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.custom-cover-preview {
  position: relative;
  display: inline-block;
  margin-bottom: var(--space-md);
  border-radius: 8px;
  overflow: hidden;
}

.custom-cover-preview img {
  width: 200px;
  height: auto;
  border-radius: 8px;
  border: 2px solid var(--color-primary);
}

.remove-cover {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-base);
}

.remove-cover:hover {
  background: var(--color-accent);
}

.remove-cover svg {
  color: white;
}

.cover-option {
  position: relative;
  aspect-ratio: 16/9;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid transparent;
  background: var(--color-bg-light);
  transition: all var(--transition-base);
}

.cover-option img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cover-option:hover {
  border-color: var(--color-primary);
}

.cover-option.selected {
  border-color: var(--color-primary);
  box-shadow: var(--glow-primary);
}

.cover-check {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 32px;
  height: 32px;
  background: var(--color-primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-base);
}

.cover-option.selected .cover-check {
  opacity: 1;
}

.cover-check svg {
  color: white;
}

.tag-input-wrapper {
  display: flex;
  gap: var(--space-sm);
}

.tag-input-wrapper input {
  flex: 1;
}

.add-tag-btn {
  padding: var(--space-sm) var(--space-md);
  background: var(--color-secondary);
  color: white;
  border-radius: 8px;
  font-weight: 500;
  transition: all var(--transition-base);
}

.add-tag-btn:hover {
  box-shadow: 0 0 15px rgba(123, 97, 255, 0.5);
}

.tags-list {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
  margin-top: var(--space-md);
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-primary);
  color: var(--color-bg-deep);
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
}

.tag-remove {
  font-size: 1rem;
  line-height: 1;
  color: var(--color-bg-deep);
  opacity: 0.7;
  transition: opacity var(--transition-fast);
}

.tag-remove:hover {
  opacity: 1;
}

.content-hint {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  margin-top: var(--space-xs);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-md);
  margin-top: var(--space-xl);
}

.cancel-btn {
  padding: var(--space-md) var(--space-xl);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 50px;
  color: var(--color-text-secondary);
  font-weight: 500;
  transition: all var(--transition-base);
}

.cancel-btn:hover {
  border-color: var(--color-text-primary);
  color: var(--color-text-primary);
}

.submit-btn {
  padding: var(--space-md) var(--space-xl);
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  border-radius: 50px;
  color: white;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  transition: all var(--transition-base);
}

.submit-btn:hover:not(:disabled) {
  box-shadow: var(--glow-primary);
  transform: translateY(-2px);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.submit-error {
  text-align: center;
  margin-top: var(--space-md);
}

@media (max-width: 768px) {
  .cover-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .page-title {
    font-size: 1.5rem;
  }

  .article-form {
    padding: var(--space-lg);
  }

  .form-actions {
    flex-direction: column;
  }

  .cancel-btn,
  .submit-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
