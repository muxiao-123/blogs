import { MessageModel, Message } from '../models/Message'

let messageModel: MessageModel

export function initMessageService(model: MessageModel) {
  messageModel = model
}

export function getMessageService() {
  if (!messageModel) {
    throw new Error('MessageService not initialized')
  }
  return messageModel
}

// 发送消息
export async function sendMessage(
  senderId: string,
  senderUsername: string,
  senderAvatar: string,
  receiverId: string,
  receiverUsername: string,
  content: string
): Promise<Message> {
  return messageModel.createMessage({
    senderId,
    senderUsername,
    senderAvatar,
    receiverId,
    receiverUsername,
    content
  })
}

// 获取对话
export async function getConversation(
  userId: string,
  otherUserId: string,
  limit?: number,
  skip?: number
): Promise<Message[]> {
  return messageModel.getConversation(userId, otherUserId, limit, skip)
}

// 获取所有对话列表
export async function getConversations(userId: string) {
  return messageModel.getConversations(userId)
}

// 获取未读消息数
export async function getUnreadCount(userId: string): Promise<number> {
  return messageModel.getUnreadCount(userId)
}

// 标记消息为已读
export async function markAsRead(userId: string, senderId: string): Promise<number> {
  return messageModel.markAsRead(userId, senderId)
}

// 标记所有消息为已读
export async function markAllAsRead(userId: string): Promise<number> {
  return messageModel.markAllAsRead(userId)
}

// 删除消息
export async function deleteMessage(messageId: string, userId: string): Promise<boolean> {
  return messageModel.deleteMessage(messageId, userId)
}
