import { Request, Response, NextFunction } from 'express'

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export const successResponse = <T>(res: Response, data: T, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    data
  })
}

export const errorResponse = (res: Response, message: string, statusCode = 400) => {
  res.status(statusCode).json({
    success: false,
    error: message
  })
}

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `路由 ${req.method} ${req.path} 不存在`
  })
}

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('服务器错误:', err)
  res.status(500).json({
    success: false,
    error: '服务器内部错误'
  })
}
