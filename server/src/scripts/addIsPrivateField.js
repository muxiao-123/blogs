'use strict'
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value)
          })
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value))
        } catch (e) {
          reject(e)
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value))
        } catch (e) {
          reject(e)
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected)
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next())
    })
  }
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1]
          return t[1]
        },
        trys: [],
        ops: []
      },
      f,
      y,
      t,
      g = Object.create((typeof Iterator === 'function' ? Iterator : Object).prototype)
    return (
      (g.next = verb(0)),
      (g['throw'] = verb(1)),
      (g['return'] = verb(2)),
      typeof Symbol === 'function' &&
        (g[Symbol.iterator] = function () {
          return this
        }),
      g
    )
    function verb(n) {
      return function (v) {
        return step([n, v])
      }
    }
    function step(op) {
      if (f) throw new TypeError('Generator is already executing.')
      while ((g && ((g = 0), op[0] && (_ = 0)), _))
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y['return']
                  : op[0]
                    ? y['throw'] || ((t = y['return']) && t.call(y), 0)
                    : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t
          if (((y = 0), t)) op = [op[0] & 2, t.value]
          switch (op[0]) {
            case 0:
            case 1:
              t = op
              break
            case 4:
              _.label++
              return { value: op[1], done: false }
            case 5:
              _.label++
              y = op[1]
              op = [0]
              continue
            case 7:
              op = _.ops.pop()
              _.trys.pop()
              continue
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0
                continue
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1]
                break
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1]
                t = op
                break
              }
              if (t && _.label < t[2]) {
                _.label = t[2]
                _.ops.push(op)
                break
              }
              if (t[2]) _.ops.pop()
              _.trys.pop()
              continue
          }
          op = body.call(thisArg, _)
        } catch (e) {
          op = [6, e]
          y = 0
        } finally {
          f = t = 0
        }
      if (op[0] & 5) throw op[1]
      return { value: op[0] ? op[1] : void 0, done: true }
    }
  }
Object.defineProperty(exports, '__esModule', { value: true })
var mongodb_1 = require('mongodb')
var MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017'
var DB_NAME = process.env.DB_NAME || 'lumina-blog'
function main() {
  return __awaiter(this, void 0, void 0, function () {
    var client,
      db,
      collection,
      articlesWithoutIsPrivate,
      result,
      articlesWithIsPrivate,
      totalArticles,
      sampleArticles,
      error_1
    return __generator(this, function (_a) {
      switch (_a.label) {
        case 0:
          client = new mongodb_1.MongoClient(MONGO_URI)
          _a.label = 1
        case 1:
          _a.trys.push([1, 10, 11, 13])
          return [4 /*yield*/, client.connect()]
        case 2:
          _a.sent()
          db = client.db(DB_NAME)
          collection = db.collection('articles')
          return [
            4 /*yield*/,
            collection
              .find({
                isPrivate: { $exists: false }
              })
              .toArray()
          ]
        case 3:
          articlesWithoutIsPrivate = _a.sent()
          console.log(
            '\u627E\u5230 '.concat(
              articlesWithoutIsPrivate.length,
              ' \u7BC7\u6587\u7AE0\u7F3A\u5C11 isPrivate \u5B57\u6BB5'
            )
          )
          if (!(articlesWithoutIsPrivate.length > 0)) return [3 /*break*/, 5]
          return [
            4 /*yield*/,
            collection.updateMany({ isPrivate: { $exists: false } }, { $set: { isPrivate: false } })
          ]
        case 4:
          result = _a.sent()
          console.log(
            '\u6210\u529F\u4E3A '.concat(
              result.modifiedCount,
              ' \u7BC7\u6587\u7AE0\u6DFB\u52A0 isPrivate: false \u5B57\u6BB5'
            )
          )
          _a.label = 5
        case 5:
          return [
            4 /*yield*/,
            collection
              .find({
                isPrivate: { $exists: true }
              })
              .count()
          ]
        case 6:
          articlesWithIsPrivate = _a.sent()
          return [4 /*yield*/, collection.countDocuments()]
        case 7:
          totalArticles = _a.sent()
          console.log('\n\u9A8C\u8BC1\u7ED3\u679C:')
          console.log(
            '- \u5E26\u6709 isPrivate \u5B57\u6BB5\u7684\u6587\u7AE0\u6570: '.concat(
              articlesWithIsPrivate
            )
          )
          console.log('- \u603B\u6587\u7AE0\u6570: '.concat(totalArticles))
          if (!(articlesWithoutIsPrivate.length > 0)) return [3 /*break*/, 9]
          console.log('\n\u66F4\u65B0\u540E\u7684\u793A\u4F8B\u6587\u7AE0:')
          return [4 /*yield*/, collection.find().limit(3).toArray()]
        case 8:
          sampleArticles = _a.sent()
          sampleArticles.forEach(function (article) {
            console.log('  - '.concat(article.title, ': isPrivate = ').concat(article.isPrivate))
          })
          _a.label = 9
        case 9:
          return [3 /*break*/, 13]
        case 10:
          error_1 = _a.sent()
          console.error('Error:', error_1)
          return [3 /*break*/, 13]
        case 11:
          return [4 /*yield*/, client.close()]
        case 12:
          _a.sent()
          return [7 /*endfinally*/]
        case 13:
          return [2 /*return*/]
      }
    })
  })
}
main()
