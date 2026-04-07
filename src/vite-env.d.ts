/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const component: DefineComponent<{}, {}, any>
  export default component
}
declare module 'highlightjs-vue' {
  import { HLJSApi } from 'highlight.js'
  export default function (hljs: HLJSApi): void
}
