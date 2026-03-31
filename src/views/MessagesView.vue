<template>
  <div class="messages-page">
    <NavBar />
    <main class="messages-main">
      <div class="messages-container">
        <!-- 对话列表 -->
        <div class="conversations-panel" :class="{ hidden: selectedUser }">
          <div class="panel-header">
            <h1>消息</h1>
            <!-- 分类切换 -->
            <div class="category-tabs">
              <button
                class="tab-btn"
                :class="{ active: activeCategory === 'private' }"
                @click="activeCategory = 'private'"
              >
                私信
              </button>
              <button
                class="tab-btn"
                :class="{ active: activeCategory === 'comment' }"
                @click="activeCategory = 'comment'"
              >
                评论
                <span v-if="commentUnreadCount > 0" class="tab-badge">{{
                  commentUnreadCount
                }}</span>
              </button>
            </div>
          </div>

          <!-- 私信列表 -->
          <template v-if="activeCategory === 'private'">
            <div class="panel-sub-header">
              <button class="new-chat-btn" @click="showSearchModal = true">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                新建对话
              </button>
            </div>

            <!-- 搜索用户弹窗 -->
            <div v-if="showSearchModal" class="search-modal">
              <div class="search-modal-content">
                <div class="search-header">
                  <h3>新建对话</h3>
                  <button class="close-btn" @click="showSearchModal = false">
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
                <div class="search-input-wrapper">
                  <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="搜索用户名..."
                    @input="handleSearch"
                    autofocus
                  />
                </div>
                <div class="search-results" v-if="searchResults.length > 0">
                  <div
                    v-for="user in searchResults"
                    :key="user.id"
                    class="search-result-item"
                    @click="startNewChat(user)"
                  >
                    <img :src="user.avatar || defaultAvatar" :alt="user.username" class="avatar" />
                    <span class="username">{{ user.username }}</span>
                  </div>
                </div>
                <div
                  v-else-if="searchQuery && searchResults.length === 0 && !searching"
                  class="no-results"
                >
                  未找到用户
                </div>
              </div>
            </div>

            <div class="conversations-list" v-if="conversations.length > 0">
              <div
                v-for="conv in conversations"
                :key="conv.userId"
                class="conversation-item"
                :class="{ unread: conv.unreadCount > 0 }"
                @click="selectConversation(conv)"
              >
                <div class="avatar-wrapper">
                  <img :src="conv.avatar || defaultAvatar" :alt="conv.username" class="avatar" />
                  <span v-if="conv.unreadCount > 0" class="unread-badge">{{
                    conv.unreadCount
                  }}</span>
                </div>
                <div class="conversation-content">
                  <div class="conversation-header">
                    <span class="username">{{ conv.username }}</span>
                    <span class="time">{{ formatTime(conv.lastMessage.createdAt) }}</span>
                  </div>
                  <p class="last-message">{{ conv.lastMessage.content }}</p>
                </div>
              </div>
            </div>

            <div v-else class="empty-state">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <p>暂无私信</p>
            </div>
          </template>

          <!-- 评论列表 -->
          <template v-if="activeCategory === 'comment'">
            <div class="comments-list" v-if="comments.length > 0">
              <div
                v-for="comment in comments"
                :key="comment.id"
                class="comment-item"
                :class="{ unread: !comment.isRead }"
                @click="viewComment(comment)"
              >
                <div class="avatar-wrapper">
                  <img
                    :src="comment.author.avatar || defaultAvatar"
                    :alt="comment.author.name"
                    class="avatar"
                  />
                  <span v-if="!comment.isRead" class="unread-dot"></span>
                </div>
                <div class="comment-content">
                  <div class="comment-header">
                    <span class="username">{{ comment.author.name }}</span>
                    <span class="article-title">评论了我的文章</span>
                  </div>
                  <p class="comment-text">{{ comment.content }}</p>
                  <span class="time">{{ formatTime(comment.createdAt) }}</span>
                </div>
              </div>
            </div>
            <div v-else class="empty-state">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path
                  d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                ></path>
              </svg>
              <p>暂无评论通知</p>
            </div>
          </template>
        </div>

        <!-- 聊天详情 -->
        <div class="chat-panel" :class="{ active: selectedUser }">
          <div class="chat-header" v-if="selectedUser">
            <button class="back-btn" @click="goBack">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <img
              :src="selectedUser.avatar || defaultAvatar"
              :alt="selectedUser.username"
              class="chat-avatar"
            />
            <span class="chat-username">{{ selectedUser.username }}</span>
          </div>

          <div class="messages-list" ref="messagesListRef" v-if="selectedUser">
            <div
              v-for="msg in messages"
              :key="msg.id"
              class="message"
              :class="{
                sent: msg.senderId === currentUserId,
                received: msg.senderId !== currentUserId
              }"
            >
              <img
                v-if="msg.senderId !== currentUserId"
                :src="msg.senderAvatar || defaultAvatar"
                :alt="msg.senderUsername"
                class="message-avatar"
              />
              <div class="message-content">
                <p>{{ msg.content }}</p>
                <span class="message-time">{{ formatTime(msg.createdAt) }}</span>
              </div>
            </div>

            <div v-if="messages.length === 0" class="no-messages">
              <p>暂无消息记录，开始聊天吧</p>
            </div>
          </div>

          <div class="message-input" v-if="selectedUser">
            <input
              v-model="newMessage"
              type="text"
              placeholder="输入消息..."
              @keyup.enter="sendMessage"
              :disabled="sending"
            />
            <button @click="sendMessage" :disabled="!newMessage.trim() || sending">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>

          <!-- 未选择对话时的提示 -->
          <div class="no-chat-selected" v-if="!selectedUser">
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <p>选择一个对话开始聊天</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { api, Message, Conversation, User } from '@/api'
import { useUserStore } from '@/stores/user'
import NavBar from '@/components/NavBar.vue'

const userStore = useUserStore()

const conversations = ref<Conversation[]>([])
const messages = ref<Message[]>([])
const selectedUser = ref<{ userId: string; username: string; avatar: string } | null>(null)
const newMessage = ref('')
const sending = ref(false)
const messagesListRef = ref<HTMLElement | null>(null)

// 分类相关
type CategoryType = 'private' | 'comment'
const activeCategory = ref<CategoryType>('private')
const comments = ref<any[]>([])
const commentUnreadCount = ref(0)

// 搜索相关
const showSearchModal = ref(false)
const searchQuery = ref('')
const searchResults = ref<User[]>([])
const searching = ref(false)
let searchTimeout: ReturnType<typeof setTimeout> | null = null

const defaultAvatar =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ccc"%3E%3Ccircle cx="12" cy="8" r="4"/%3E%3Cpath d="M12 14c-4 0-8 2-8 4v2h16v-2c0-2-4-4-8-4z"/%3E%3C/svg%3E'

const currentUserId = computed(() => userStore.user?.id || '')

const unreadTotal = computed(() => {
  return conversations.value.reduce((sum, conv) => sum + conv.unreadCount, 0)
})

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  } else if (days === 1) {
    return '昨天'
  } else if (days < 7) {
    return date.toLocaleDateString('zh-CN', { weekday: 'short' })
  } else {
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }
}

const loadConversations = async () => {
  try {
    conversations.value = await api.getConversations()
  } catch (e) {
    console.error('加载对话列表失败:', e)
  }
}

const loadComments = async () => {
  try {
    const result = await api.getComments()
    comments.value = result.comments || []
    commentUnreadCount.value = result.unreadCount || 0
  } catch (e) {
    console.error('加载评论列表失败:', e)
  }
}

const viewComment = async (comment: any) => {
  // 标记为已读
  if (!comment.isRead) {
    await api.markCommentAsRead(comment.id, comment.articleId)
    comment.isRead = true
    if (commentUnreadCount.value > 0) {
      commentUnreadCount.value--
    }
  }
}

// 监听分类切换
watch(activeCategory, (newCategory) => {
  if (newCategory === 'comment') {
    loadComments()
  }
})

const selectConversation = async (conv: Conversation) => {
  selectedUser.value = {
    userId: conv.userId,
    username: conv.username,
    avatar: conv.avatar
  }

  // 标记为已读
  if (conv.unreadCount > 0) {
    await api.markAsRead(conv.userId)
    conv.unreadCount = 0
  }

  // 加载消息
  await loadMessages()

  // 移动端滚动到顶部
  await nextTick()
  scrollToBottom()
}

const loadMessages = async () => {
  if (!selectedUser.value) return

  try {
    messages.value = await api.getConversation(selectedUser.value.userId)
    // 反转数组，最新的在后面
    messages.value = messages.value.reverse()
  } catch (e) {
    console.error('加载消息失败:', e)
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !selectedUser.value || sending.value) return

  sending.value = true

  try {
    await api.sendMessage(
      selectedUser.value.userId,
      selectedUser.value.username,
      newMessage.value.trim()
    )

    newMessage.value = ''
    await loadMessages()
    await loadConversations()
    await nextTick()
    scrollToBottom()
  } catch (e: any) {
    alert(e.message || '发送失败')
  } finally {
    sending.value = false
  }
}

const scrollToBottom = () => {
  if (messagesListRef.value) {
    messagesListRef.value.scrollTop = messagesListRef.value.scrollHeight
  }
}

const goBack = () => {
  selectedUser.value = null
  messages.value = []
  loadConversations()
}

const handleMarkAllRead = async () => {
  try {
    await api.markAllAsRead()
    conversations.value.forEach((conv) => (conv.unreadCount = 0))
  } catch (e) {
    console.error('标记全部已读失败:', e)
  }
}

const handleSearch = async () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  if (!searchQuery.value.trim()) {
    searchResults.value = []
    return
  }

  searchTimeout = setTimeout(async () => {
    searching.value = true
    try {
      searchResults.value = await api.searchUsers(searchQuery.value.trim())
      // 过滤掉当前用户
      searchResults.value = searchResults.value.filter((u) => u.id !== currentUserId.value)
    } catch (e) {
      console.error('搜索用户失败:', e)
      searchResults.value = []
    } finally {
      searching.value = false
    }
  }, 300)
}

const startNewChat = (user: User) => {
  selectedUser.value = {
    userId: user.id,
    username: user.username,
    avatar: user.avatar
  }
  messages.value = []
  showSearchModal.value = false
  searchQuery.value = ''
  searchResults.value = []
}

onMounted(() => {
  loadConversations()
})

watch(
  () => userStore.isLoggedIn,
  (loggedIn) => {
    if (loggedIn) {
      loadConversations()
    }
  }
)
</script>

<style scoped>
.messages-page {
  min-height: 100vh;
  background: var(--color-background);
  display: flex;
  flex-direction: column;
}

.messages-main {
  flex: 1;
  padding-top: 80px;
}

.messages-container {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  gap: 20px;
  padding: 0 20px 20px;
  height: calc(100vh - 160px);
}

.conversations-panel {
  flex: 1;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--color-border);
}

.panel-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

/* 分类切换 */
.category-tabs {
  display: flex;
  gap: 8px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 20px;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.tab-btn.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.tab-badge {
  min-width: 16px;
  height: 16px;
  background: #ff6b6b;
  color: white;
  font-size: 0.65rem;
  font-weight: 600;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.tab-btn.active .tab-badge {
  background: white;
  color: var(--color-primary);
}

.panel-sub-header {
  padding: 12px 20px;
  border-bottom: 1px solid var(--color-border);
}

.mark-all-read {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid var(--color-primary);
  border-radius: 20px;
  color: var(--color-primary);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.mark-all-read:hover {
  background: var(--color-primary);
  color: white;
}

.conversations-list {
  flex: 1;
  overflow-y: auto;
}

.conversation-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid var(--color-border);
}

.conversation-item:hover {
  background: rgba(0, 217, 255, 0.05);
}

.conversation-item.unread {
  background: rgba(0, 217, 255, 0.08);
}

.avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.unread-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  background: #ff6b6b;
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
}

.conversation-content {
  flex: 1;
  min-width: 0;
}

.conversation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.username {
  font-weight: 500;
  color: var(--color-text-primary);
}

.time {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.last-message {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

.chat-panel {
  flex: 1.5;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
}

.back-btn {
  display: none;
  padding: 8px;
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.chat-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.chat-username {
  font-weight: 500;
  color: var(--color-text-primary);
}

.messages-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  gap: 10px;
  max-width: 70%;
}

.message.sent {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message.received {
  align-self: flex-start;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.message-content {
  padding: 12px 16px;
  border-radius: 16px;
  position: relative;
}

.message.sent .message-content {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  color: white;
  border-bottom-right-radius: 4px;
}

.message.received .message-content {
  background: var(--color-border);
  color: var(--color-text-primary);
  border-bottom-left-radius: 4px;
}

.message-content p {
  margin: 0;
  word-wrap: break-word;
}

.message-time {
  display: block;
  font-size: 0.7rem;
  margin-top: 4px;
  opacity: 0.7;
}

.message.sent .message-time {
  text-align: right;
}

.message-input {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--color-border);
}

.message-input input {
  flex: 1;
  padding: 12px 16px;
  background: var(--color-border);
  border: 1px solid transparent;
  border-radius: 24px;
  color: var(--color-text-primary);
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}

.message-input input:focus {
  border-color: var(--color-primary);
}

.message-input button {
  padding: 12px 20px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  border: none;
  border-radius: 24px;
  color: white;
  cursor: pointer;
  transition:
    transform 0.2s,
    opacity 0.2s;
}

.message-input button:hover:not(:disabled) {
  transform: scale(1.05);
}

.message-input button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.no-messages,
.no-chat-selected {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  gap: 16px;
}

.new-chat-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  border: none;
  border-radius: 20px;
  color: white;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.new-chat-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 217, 255, 0.3);
}

/* 搜索弹窗 */
.search-modal {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  z-index: 10;
  display: flex;
  flex-direction: column;
}

.search-modal-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
}

.search-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--color-text-primary);
}

.close-btn {
  padding: 4px;
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.search-input-wrapper {
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
}

.search-input-wrapper input {
  width: 100%;
  padding: 12px 16px;
  background: var(--color-border);
  border: 1px solid transparent;
  border-radius: 10px;
  color: var(--color-text-primary);
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}

.search-input-wrapper input:focus {
  border-color: var(--color-primary);
}

.search-results {
  flex: 1;
  overflow-y: auto;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  cursor: pointer;
  transition: background 0.2s;
}

.search-result-item:hover {
  background: rgba(0, 217, 255, 0.1);
}

.search-result-item .avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.search-result-item .username {
  font-weight: 500;
  color: var(--color-text-primary);
}

.no-results {
  padding: 20px;
  text-align: center;
  color: var(--color-text-muted);
}

/* 评论列表 */
.comments-list {
  flex: 1;
  overflow-y: auto;
}

.comment-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
  cursor: pointer;
  transition: background 0.2s;
  border-bottom: 1px solid var(--color-border);
}

.comment-item:hover {
  background: rgba(0, 217, 255, 0.05);
}

.comment-item.unread {
  background: rgba(0, 217, 255, 0.08);
}

.comment-item .avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.comment-item .avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
}

.unread-dot {
  position: absolute;
  top: 0;
  right: 0;
  width: 10px;
  height: 10px;
  background: var(--color-primary);
  border-radius: 50%;
  border: 2px solid var(--glass-bg);
}

.comment-content {
  flex: 1;
  min-width: 0;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
  flex-wrap: wrap;
}

.comment-header .username {
  font-weight: 500;
  color: var(--color-text-primary);
}

.article-title {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.comment-text {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin: 0 0 4px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.comment-item .time {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  gap: 16px;
}

@media (max-width: 768px) {
  .messages-main {
    padding-top: 70px;
  }

  .messages-container {
    flex-direction: column;
    height: calc(100vh - 120px);
  }

  .conversations-panel.hidden {
    display: none;
  }

  .chat-panel {
    flex: 1;
    border-radius: 16px;
  }

  .back-btn {
    display: block;
  }

  .chat-panel:not(.active) .chat-header,
  .chat-panel:not(.active) .messages-list,
  .chat-panel:not(.active) .message-input {
    display: none;
  }

  .no-chat-selected {
    display: flex;
  }

  .chat-panel.active .no-chat-selected {
    display: none;
  }
}
</style>
