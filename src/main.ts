import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './styles/main.css'

const app = createApp(App)

// 使用 CDN 全局变量
const pinia = (window as any).Pinia?.createPinia?.() || createPinia()
const VueRouter = (window as any).VueRouter

// 全局错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue Error:', err)
  console.error('Component:', instance)
  console.error('Info:', info)
}

app.use(pinia)
app.use(router)

app.mount('#app')

console.log('Vue app mounted successfully')
