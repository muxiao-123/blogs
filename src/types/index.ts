export interface Article {
  id: string
  title: string
  excerpt: string
  content: string
  cover: string
  category: string
  tags: string[]
  author: Author
  publishDate?: string
  readTime?: number
  views?: number
  likes?: number
  isLiked?: boolean
  isFavorited?: boolean
  favorites?: number
  comments?: Comment[]
}

export interface Author {
  id?: string
  name: string
  avatar: string
  bio?: string
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

export type Category = string

export interface CategoryInfo {
  key: string
  label: string
  color: string
}
