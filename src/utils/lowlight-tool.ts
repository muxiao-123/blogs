import { createLowlight } from 'lowlight'
import javascript from 'highlight.js/lib/languages/javascript'
import yaml from 'highlight.js/lib/languages/yaml'
import sql from 'highlight.js/lib/languages/sql'
import scss from 'highlight.js/lib/languages/scss'
import rust from 'highlight.js/lib/languages/rust'
import plaintext from 'highlight.js/lib/languages/plaintext'
import less from 'highlight.js/lib/languages/less'
import json from 'highlight.js/lib/languages/json'
import markdown from 'highlight.js/lib/languages/markdown'
import xml from 'highlight.js/lib/languages/xml'
import shell from 'highlight.js/lib/languages/shell'
import css from 'highlight.js/lib/languages/css'
import python from 'highlight.js/lib/languages/python'
import php from 'highlight.js/lib/languages/php'
import java from 'highlight.js/lib/languages/java'
import go from 'highlight.js/lib/languages/go'
import powershell from 'highlight.js/lib/languages/powershell'
import typescript from 'highlight.js/lib/languages/typescript'
import bash from 'highlight.js/lib/languages/bash'

const lowlight = createLowlight()
// 只注册需要的语言
lowlight.register('javascript', javascript)
lowlight.register('python', python)
lowlight.register('html', xml)
lowlight.register('css', css)
lowlight.register('json', json)
lowlight.register('bash', bash)
lowlight.register('markdown', markdown)
lowlight.register('shell', shell)
lowlight.register('php', php)
lowlight.register('java', java)
lowlight.register('go', go)
lowlight.register('powershell', powershell)
lowlight.register('typescript', typescript)
lowlight.register('yaml', yaml)
lowlight.register('sql', sql)
lowlight.register('scss', scss)
lowlight.register('rust', rust)
lowlight.register('plaintext', plaintext)
lowlight.register('less', less)
lowlight.register('vue', xml)

export default lowlight
