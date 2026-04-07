import hljs from 'highlight.js/lib/core'
// import {
//     javascript,
//     css,
//     shell,
//     python,
//     php,
//     java,
//     go,
//     powershell,
//     typescript,
//     yaml,
//     sql,
//     scss,
//     rust,
//     plaintext,
//     less,
//     json,
//     markdown,
//     xml,
//     bash
// } from '@/utils/language'
import javascript from 'highlight.js/lib/languages/javascript'
// import html from 'highlight.js/lib/languages/html'
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
// import kotlin from 'highlight.js/lib/languages/kotlin'
// import lua from 'highlight.js/lib/languages/lua'
// import perl from 'highlight.js/lib/languages/perl'
import powershell from 'highlight.js/lib/languages/powershell'
import typescript from 'highlight.js/lib/languages/typescript'
import bash from 'highlight.js/lib/languages/bash'
// import hljsDefineVue from 'highlightjs-vue'

const hljsVue = hljs
// hljsDefineVue(hljsVue)

hljsVue.registerLanguage('javascript', javascript)
hljsVue.registerLanguage('css', css)
hljsVue.registerLanguage('shell', shell)
hljsVue.registerLanguage('python', python)
hljsVue.registerLanguage('php', php)
hljsVue.registerLanguage('java', java)
hljsVue.registerLanguage('go', go)
hljsVue.registerLanguage('powershell', powershell)
hljsVue.registerLanguage('typescript', typescript)
hljsVue.registerLanguage('yaml', yaml)
hljsVue.registerLanguage('sql', sql)
hljsVue.registerLanguage('scss', scss)
hljsVue.registerLanguage('rust', rust)
hljsVue.registerLanguage('plaintext', plaintext)
hljsVue.registerLanguage('less', less)
hljsVue.registerLanguage('json', json)
hljsVue.registerLanguage('markdown', markdown)
hljsVue.registerLanguage('xml', xml)
hljsVue.registerLanguage('bash', bash)
hljsVue.registerAliases(['vue', 'html'], { languageName: 'xml' })
export default hljsVue
