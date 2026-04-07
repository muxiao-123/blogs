import { createLowlight } from 'lowlight'
import javascript from 'highlight.js/lib/languages/javascript'
import typescript from 'highlight.js/lib/languages/typescript'
import json from 'highlight.js/lib/languages/json'
import xml from 'highlight.js/lib/languages/xml'
import css from 'highlight.js/lib/languages/css'
import python from 'highlight.js/lib/languages/python'
import bash from 'highlight.js/lib/languages/bash'
import java from 'highlight.js/lib/languages/java'
import plaintext from 'highlight.js/lib/languages/plaintext'

const lowlight = createLowlight()
// 只注册常用语言，减少体积
lowlight.register('javascript', javascript)
lowlight.register('js', javascript)
lowlight.register('typescript', typescript)
lowlight.register('ts', typescript)
lowlight.register('json', json)
lowlight.register('html', xml)
lowlight.register('xml', xml)
lowlight.register('css', css)
lowlight.register('scss', css) // scss 用 css 高亮
lowlight.register('less', css) // less 用 css 高亮
lowlight.register('python', python)
lowlight.register('py', python)
lowlight.register('bash', bash)
lowlight.register('sh', bash)
lowlight.register('shell', bash)
lowlight.register('java', java)
lowlight.register('go', java) // go 用 java 高亮
lowlight.register('rust', java) // rust 用 java 高亮
lowlight.register('sql', java) // sql 用 java 高亮
lowlight.register('php', javascript) // php 用 js 高亮
lowlight.register('markdown', xml) // markdown 用 xml 高亮
lowlight.register('vue', xml) // vue 用 xml 高亮
lowlight.register('plaintext', plaintext)
lowlight.register('text', plaintext)

export default lowlight
