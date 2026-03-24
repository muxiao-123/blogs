<script setup lang="ts">
import { ref } from 'vue'
import { useArticleStore } from '@/stores/articles'
import { useUserStore } from '@/stores/user'
import type { Comment } from '@/types'

const props = defineProps<{
  articleId: string
  comments: Comment[]
}>()

const emit = defineEmits<{
  (e: 'comment-added'): void
}>()

const articleStore = useArticleStore()
const userStore = useUserStore()

const commentInput = ref('')
const userName = ref('匿名用户')
const isSubmitting = ref(false)

const formatTime = (timeStr: string) => {
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

const handleSubmit = async () => {
  if (!commentInput.value.trim()) return
  if (commentInput.value.length < 5) return

  isSubmitting.value = true

  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 300))

  const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName.value || 'anonymous'}`

  await articleStore.addComment({
    articleId: props.articleId,
    content: commentInput.value,
    author: {
      id: userStore.user?.id,
      name: userName.value || '匿名用户',
      avatar
    }
  })

  commentInput.value = ''
  isSubmitting.value = false
  emit('comment-added')
}

const handleDelete = (commentId: string) => {
  if (confirm('确定要删除这条评论吗？')) {
    articleStore.deleteComment(props.articleId, commentId)
  }
}

const handleCommentLike = (commentId: string) => {
  articleStore.toggleCommentLike(props.articleId, commentId)
}
</script>

<template>
  <section class="comment-section">
    <h3 class="section-title">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      评论
      <span class="comment-count">{{ comments.length }}</span>
    </h3>

    <!-- 评论输入框 -->
    <form class="comment-form" @submit.prevent="handleSubmit">
      <div class="form-header">
        <input
          v-model="userName"
          type="text"
          placeholder="你的昵称"
          class="name-input"
          maxlength="20"
        />
      </div>
      <textarea
        v-model="commentInput"
        placeholder="写下你的评论..."
        rows="3"
        class="comment-input"
        :disabled="isSubmitting"
      ></textarea>
      <div class="form-footer">
        <span class="char-count" :class="{ warning: commentInput.length > 0 && commentInput.length < 5 }">
          {{ commentInput.length > 0 ? `${commentInput.length}/500` : '最少5个字' }}
        </span>
        <button
          type="submit"
          class="submit-btn"
          :disabled="isSubmitting || commentInput.length < 5"
        >
          <span v-if="isSubmitting" class="spinner"></span>
          {{ isSubmitting ? '发布中...' : '发布评论' }}
        </button>
      </div>
    </form>

    <!-- 评论列表 -->
    <div class="comments-list" v-if="comments.length > 0">
      <article
        v-for="comment in comments"
        :key="comment.id"
        class="comment-item"
      >
        <img :src="comment.author.avatar" :alt="comment.author.name" class="comment-avatar" />
        <div class="comment-content">
          <div class="comment-header">
            <span class="comment-author">{{ comment.author.name }}</span>
            <span class="comment-time">{{ formatTime(comment.createTime) }}</span>
          </div>
          <p class="comment-text">{{ comment.content }}</p>
          <div class="comment-actions">
            <button class="action-btn" @click="handleCommentLike(comment.id)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
              </svg>
              {{ comment.likes }}
            </button>
            <button class="action-btn delete" @click="handleDelete(comment.id)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </button>
          </div>
        </div>
      </article>
    </div>

    <!-- 空状态 -->
    <div class="empty-state" v-else>
      <div class="empty-icon">💬</div>
      <p>还没有评论，快来抢沙发吧！</p>
    </div>
  </section>
</template>

<style scoped>
.comment-section {
  margin-top: var(--space-3xl);
  padding-top: var(--space-2xl);
  border-top: 1px solid var(--color-border);
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 1.25rem;
  margin-bottom: var(--space-xl);
}

.section-title svg {
  color: var(--color-primary);
}

.comment-count {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
  font-weight: 400;
}

.comment-form {
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: var(--space-lg);
  margin-bottom: var(--space-xl);
}

.form-header {
  margin-bottom: var(--space-md);
}

.name-input {
  width: 200px;
  padding: var(--space-sm) var(--space-md);
  background: var(--color-bg-deep);
  border: 1px solid var(--color-border);
  border-radius: 50px;
  font-size: 0.875rem;
  color: var(--color-text-primary);
}

.name-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.comment-input {
  width: 100%;
  padding: var(--space-md);
  background: var(--color-bg-deep);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-family: var(--font-body);
  font-size: 1rem;
  color: var(--color-text-primary);
  resize: vertical;
  min-height: 80px;
}

.comment-input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.comment-input::placeholder {
  color: var(--color-text-secondary);
  opacity: 0.6;
}

.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--space-md);
}

.char-count {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.char-count.warning {
  color: var(--color-accent);
}

.submit-btn {
  padding: var(--space-sm) var(--space-lg);
  background: var(--color-primary);
  border-radius: 50px;
  color: var(--color-bg-deep);
  font-weight: 600;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  transition: all var(--transition-base);
}

.submit-btn:hover:not(:disabled) {
  box-shadow: var(--glow-primary);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(0, 0, 0, 0.2);
  border-top-color: var(--color-bg-deep);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.comment-item {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-lg);
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  animation: fade-in-up 0.3s ease;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid var(--color-primary);
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-xs);
}

.comment-author {
  font-weight: 600;
  color: var(--color-text-primary);
}

.comment-time {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}

.comment-text {
  color: var(--color-text-primary);
  line-height: 1.6;
  margin-bottom: var(--space-sm);
}

.comment-actions {
  display: flex;
  gap: var(--space-md);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  transition: color var(--transition-fast);
}

.action-btn:hover:not(:disabled) {
  color: var(--color-primary);
}

.action-btn.delete:hover {
  color: var(--color-accent);
}

.action-btn:disabled {
  cursor: default;
}

.empty-state {
  text-align: center;
  padding: var(--space-2xl);
  color: var(--color-text-secondary);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: var(--space-md);
}

@media (max-width: 768px) {
  .name-input {
    width: 100%;
  }

  .form-footer {
    flex-direction: column;
    gap: var(--space-md);
    align-items: stretch;
  }

  .submit-btn {
    justify-content: center;
  }
}
</style>
