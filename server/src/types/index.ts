export interface Article {
  id: string
  title: string
  excerpt: string
  content: string
  cover: string
  category: Category
  tags: string[]
  author: Author
  publishDate: string
  readTime: number
  views: number
  likes: number
  isLiked: boolean
  isFavorited: boolean
  favorites: number
  comments: Comment[]
  isPrivate?: boolean
  lastViewedAt?: string // 最后浏览时间
}

export interface Author {
  id?: string
  name: string
  avatar: string
  bio: string
}

export interface Comment {
  id: string
  author: CommentAuthor
  content: string
  createTime: string
  likes: number
  isRead?: boolean
}

export interface CommentAuthor {
  id?: string
  name: string
  avatar: string
}

export type Category = 'frontend' | 'backend' | 'fullstack' | 'other'

export interface CategoryInfo {
  key: Category
  label: string
  color: string
}

export interface CreateArticleInput {
  title: string
  excerpt: string
  content: string
  cover: string
  category: Category
  tags: string[]
  isPrivate?: boolean
}

export interface AddCommentInput {
  articleId: string
  content: string
  author: CommentAuthor
}
