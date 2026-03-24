// 从 types/index.ts 导入类型
export type { Article, Comment, CategoryInfo } from './types/index'
export type { CreateArticleInput } from './stores/articles'

// 额外导出 Category 类型
export type Category = string
