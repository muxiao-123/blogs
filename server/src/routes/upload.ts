import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import md5File from 'md5-file'

const router = express.Router()

// 确保上传目录存在
const uploadDir = path.join(process.cwd(), 'public', 'uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// 存储已存在文件的哈希映射
const fileHashMap = new Map<string, string>()

// 启动时扫描已有文件
const initHashMap = () => {
  try {
    const files = fs.readdirSync(uploadDir)
    for (const file of files) {
      const filePath = path.join(uploadDir, file)
      if (fs.statSync(filePath).isFile()) {
        const hash = md5File.sync(filePath)
        fileHashMap.set(hash, file)
      }
    }
    console.log(`[Upload] 已加载 ${fileHashMap.size} 个已有文件的哈希`)
  } catch (error) {
    console.error('[Upload] 初始化哈希映射失败:', error)
  }
}

initHashMap()

// 配置 multer 存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const filename = `${uuidv4()}${ext}`
    cb(null, filename)
  }
})

// 文件过滤
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('不支持的图片格式，仅支持 JPEG, PNG, GIF, WebP'))
  }
}

// 配置上传
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
})

// 上传单张图片
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '请选择要上传的图片' })
    }

    const filePath = req.file.path

    // 计算上传文件的 MD5 哈希
    const hash = await md5File(filePath)

    // 检查是否已有相同图片
    if (fileHashMap.has(hash)) {
      // 相同图片已存在，删除刚上传的文件
      fs.unlinkSync(filePath)

      const existingFilename = fileHashMap.get(hash)!
      const imageUrl = `/uploads/${existingFilename}`

      console.log(`[Upload] 相同图片已存在: ${existingFilename}`)

      return res.json({
        success: true,
        url: imageUrl,
        filename: existingFilename,
        existing: true
      })
    }

    // 新图片，保存哈希映射
    fileHashMap.set(hash, req.file.filename)

    const imageUrl = `/uploads/${req.file.filename}`

    res.json({
      success: true,
      url: imageUrl,
      filename: req.file.filename,
      existing: false
    })
  } catch (error) {
    console.error('上传图片失败:', error)
    res.status(500).json({ error: '上传图片失败' })
  }
})

// 错误处理中间件
router.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: '图片大小不能超过 5MB' })
    }
    return res.status(400).json({ error: error.message })
  }
  if (error) {
    return res.status(400).json({ error: error.message })
  }
  next()
})

export default router
