import { Db, Collection } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'

export interface Message {
  id: string
  senderId: string      // 发送者ID
  senderUsername: string // 发送者用户名
  senderAvatar: string  // 发送者头像
  receiverId: string    // 接收者ID
  receiverUsername: string // 接收者用户名
  content: string       // 消息内容
  isRead: boolean       // 是否已读
  createdAt: string    // 创建时间
}

export class MessageModel {
  private collection: Collection

  constructor(db: Db) {
    this.collection = db.collection<Message>('messages')
  }

  // 创建索引
  async createIndexes(): Promise<void> {
    await this.collection.createIndex({ senderId: 1, createdAt: -1 })
    await this.collection.createIndex({ receiverId: 1, createdAt: -1 })
    await this.collection.createIndex({ receiverId: 1, isRead: 1 })
  }

  // 发送消息
  async createMessage(message: Omit<Message, 'id' | 'isRead' | 'createdAt'>): Promise<Message> {
    const newMessage: Message = {
      id: uuidv4(),
      ...message,
      isRead: false,
      createdAt: new Date().toISOString()
    }
    await this.collection.insertOne(newMessage)
    return newMessage
  }

  // 获取与某个用户的对话
  async getConversation(userId: string, otherUserId: string, limit = 50, skip = 0): Promise<Message[]> {
    return this.collection.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ]
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()
  }

  // 获取用户的所有对话（每个对话只显示最新的一条消息）
  async getConversations(userId: string): Promise<{ userId: string; username: string; avatar: string; lastMessage: Message; unreadCount: number }[]> {
    // 获取用户发送和接收的所有消息
    const sentMessages = await this.collection.find({ senderId: userId }).toArray()
    const receivedMessages = await this.collection.find({ receiverId: userId }).toArray()

    // 收集所有对话用户ID
    const userIds = new Set<string>()
    sentMessages.forEach(m => userIds.add(m.receiverId))
    receivedMessages.forEach(m => userIds.add(m.senderId))

    // 获取每个对话的最新消息和未读数
    const conversations = await Promise.all(
      Array.from(userIds).map(async (otherUserId) => {
        // 获取最新的一条消息
        const lastMessage = await this.collection.findOne(
          {
            $or: [
              { senderId: userId, receiverId: otherUserId },
              { senderId: otherUserId, receiverId: userId }
            ]
          },
          { sort: { createdAt: -1 } }
        )

        // 获取未读消息数
        const unreadCount = await this.collection.countDocuments({
          senderId: otherUserId,
          receiverId: userId,
          isRead: false
        })

        if (!lastMessage) return null

        // 确定对方信息
        const otherUser = lastMessage.senderId === userId
          ? { id: lastMessage.receiverId, username: lastMessage.receiverUsername, avatar: '' }
          : { id: lastMessage.senderId, username: lastMessage.senderUsername, avatar: lastMessage.senderAvatar }

        return {
          userId: otherUser.id,
          username: otherUser.username,
          avatar: otherUser.avatar,
          lastMessage,
          unreadCount
        }
      })
    )

    // 过滤并按最新消息时间排序
    return conversations
      .filter((c): c is { userId: string; username: string; avatar: string; lastMessage: Message; unreadCount: number } => c !== null)
      .sort((a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime())
  }

  // 获取未读消息数
  async getUnreadCount(userId: string): Promise<number> {
    return this.collection.countDocuments({
      receiverId: userId,
      isRead: false
    })
  }

  // 标记消息为已读
  async markAsRead(userId: string, senderId: string): Promise<number> {
    const result = await this.collection.updateMany(
      { receiverId: userId, senderId, isRead: false },
      { $set: { isRead: true } }
    )
    return result.modifiedCount
  }

  // 标记所有未读消息为已读
  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.collection.updateMany(
      { receiverId: userId, isRead: false },
      { $set: { isRead: true } }
    )
    return result.modifiedCount
  }

  // 删除消息
  async deleteMessage(messageId: string, userId: string): Promise<boolean> {
    const result = await this.collection.deleteOne({
      id: messageId,
      $or: [{ senderId: userId }, { receiverId: userId }]
    })
    return result.deletedCount > 0
  }
}
