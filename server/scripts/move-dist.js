const fs = require('fs')
const path = require('path')

// 脚本所在目录 (server/scripts)
const scriptDir = __dirname
// server 目录
const serverDir = path.join(scriptDir, '..')
const serverDist = path.join(serverDir, 'dist')


// 复制 package.json 到 ../dist/
fs.copyFileSync(
  path.join(serverDir, 'package.json'),
  path.join(serverDist, 'package.json')
)

console.log('已复制 package.json 到 /dist/')
