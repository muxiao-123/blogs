import { MongoClient } from 'mongodb'

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017'
const DB_NAME = process.env.DB_NAME || 'lumina-blog'

async function main() {
  const client = new MongoClient(MONGO_URI)

  try {
    await client.connect()
    const db = client.db(DB_NAME)
    const collection = db.collection('articles')

    // 找出所有没有 isPrivate 字段的文章
    const articlesWithoutIsPrivate = await collection
      .find({
        isPrivate: { $exists: false }
      })
      .toArray()

    console.log(`找到 ${articlesWithoutIsPrivate.length} 篇文章缺少 isPrivate 字段`)

    if (articlesWithoutIsPrivate.length > 0) {
      // 批量更新，为所有缺少 isPrivate 的文章添加 isPrivate: false
      const result = await collection.updateMany(
        { isPrivate: { $exists: false } },
        { $set: { isPrivate: false } }
      )

      console.log(`成功为 ${result.modifiedCount} 篇文章添加 isPrivate: false 字段`)
    }

    // 验证更新结果
    const articlesWithIsPrivate = await collection
      .find({
        isPrivate: { $exists: true }
      })
      .count()

    const totalArticles = await collection.countDocuments()

    console.log(`\n验证结果:`)
    console.log(`- 带有 isPrivate 字段的文章数: ${articlesWithIsPrivate}`)
    console.log(`- 总文章数: ${totalArticles}`)

    // 显示一些更新后的示例
    if (articlesWithoutIsPrivate.length > 0) {
      console.log(`\n更新后的示例文章:`)
      const sampleArticles = await collection.find().limit(3).toArray()
      sampleArticles.forEach((article) => {
        console.log(`  - ${article.title}: isPrivate = ${article.isPrivate}`)
      })
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await client.close()
  }
}

main()
