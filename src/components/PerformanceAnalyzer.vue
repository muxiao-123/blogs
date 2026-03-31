<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// 性能分析数据
const webVitals = ref({
  lcp: null as number | null,
  fid: 0,
  cls: 0,
  fcp: null as number | null,
  ttfb: null as number | null
})

const loadTimes = ref({
  dns: 0,
  tcp: 0,
  ssl: 0,
  request: 0,
  content: 0,
  dom: 0,
  page: 0
})

const resourceStats = ref({
  total: 0,
  jsSize: 0,
  cssSize: 0,
  imgSize: 0,
  fontSize: 0,
  totalSize: 0
})

const waterfallData = ref<any[]>([])
const suggestions = ref<string[]>([])
const score = ref(0)
const grade = ref('A')
const isAnalyzing = ref(false)

// 格式化字节
const formatSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

// 获取指标颜色
const getMetricClass = (value: number, thresholds: { good: number; warning: number }): string => {
  if (value <= thresholds.good) return 'good'
  if (value <= thresholds.warning) return 'warning'
  return 'bad'
}

const getWebVitals = () => {
  const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  if (perfData) {
    // TTFB
    webVitals.value.ttfb = Math.round(perfData.responseStart - perfData.requestStart)
  }
  // 分别为每个类型创建观察器，各自使用 buffered
  const paintObserver = new PerformanceObserver((list) => {
    console.log('Paint:', list.getEntries())
    // const fp = list.getEntries()[0] as PerformancePaintTiming
    const fcp = list.getEntries()[1] as PerformancePaintTiming
    webVitals.value.fcp = Math.round(fcp.startTime)
    paintObserver.disconnect()
  })
  paintObserver.observe({ type: 'paint', buffered: true })

  const lcpObserver = new PerformanceObserver((list) => {
    console.log('LCP:', list.getEntries())
    const lcp = list.getEntries()[0]
    webVitals.value.lcp = Math.round(lcp.startTime)
    lcpObserver.disconnect()
  })
  lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })

  const layoutObserver = new PerformanceObserver((list) => {
    console.log('Layout Shift:', list.getEntries())
    const cls = list.getEntries()[0] as unknown as { value: number }
    webVitals.value.cls = Math.round(cls.value)
    layoutObserver.disconnect()
  })
  layoutObserver.observe({ type: 'layout-shift', buffered: true })

  const fidObserver = new PerformanceObserver((list) => {
    console.log('Frist Input:', list.getEntries())
    const fid = list.getEntries()[0] as unknown as { processingStart: number; startTime: number }
    webVitals.value.fid = Math.round(fid.processingStart - fid.startTime)
    fidObserver.disconnect()
  })
  fidObserver.observe({ type: 'first-input', buffered: true })
}

// 获取 Web Vitals
// const getWebVitals = () => {
//   const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming

//   if (perfData) {
//     // LCP
//     const lcpEntry = performance.getEntriesByType('largest-contentful-paint')[0] as PerformanceEntry
//     webVitals.value.lcp = lcpEntry ? Math.round((lcpEntry as any).startTime) : null

//     // FCP
//     const fcpEntry = performance.getEntriesByType('paint').find((e: any) => e.name === 'first-contentful-paint')
//     webVitals.value.fcp = fcpEntry ? Math.round((fcpEntry as any).startTime) : null

//     // TTFB
//     webVitals.value.ttfb = Math.round(perfData.responseStart - perfData.requestStart)
//   }
// }

// 获取页面加载时间
const getLoadTimes = () => {
  const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  if (!perfData) return

  loadTimes.value = {
    dns: Math.round(perfData.domainLookupEnd - perfData.domainLookupStart),
    tcp: Math.round(
      perfData.connectEnd -
        perfData.connectStart -
        (perfData.secureConnectionStart > 0
          ? perfData.connectEnd - perfData.secureConnectionStart
          : 0)
    ),
    ssl:
      perfData.secureConnectionStart > 0
        ? Math.round(perfData.connectEnd - perfData.secureConnectionStart)
        : 0,
    request: Math.round(perfData.responseStart - perfData.requestStart),
    content: Math.round(perfData.responseEnd - perfData.responseStart),
    dom: Math.round(perfData.domContentLoadedEventEnd - perfData.fetchStart),
    page: Math.round(perfData.loadEventEnd - perfData.fetchStart)
  }
}

// 获取资源统计
const getResourceStats = () => {
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]

  let jsSize = 0,
    cssSize = 0,
    imgSize = 0,
    fontSize = 0,
    totalSize = 0

  resources.forEach((res) => {
    const size = res.transferSize || (res as any).decodedBodySize || 0
    totalSize += size

    if (res.name.includes('.js')) {
      jsSize += size
    } else if (res.name.includes('.css')) {
      cssSize += size
    } else if (res.name.match(/\.(png|jpg|jpeg|gif|svg|webp|avif)/)) {
      imgSize += size
    } else if (res.name.match(/\.(woff2?|ttf|eot|otf)/)) {
      fontSize += size
    }
  })

  resourceStats.value = {
    total: resources.length,
    jsSize,
    cssSize,
    imgSize,
    fontSize,
    totalSize
  }
}

// 获取瀑布图数据
const getWaterfallData = () => {
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
  waterfallData.value = resources.slice(0, 15).map((res) => ({
    name: res.name.split('/').pop()?.split('?')[0] || res.name,
    duration: Math.round(res.duration),
    size: res.transferSize || 0
  }))
}

// 计算性能评分
const calculateScore = () => {
  let s = 100
  const sugs: string[] = []

  // LCP 扣分
  if (webVitals.value.lcp && webVitals.value.lcp > 2500) {
    s -= 20
    sugs.push('LCP 超过 2.5s，建议优化服务器响应时间或减少 CSS 阻塞')
  } else if (webVitals.value.lcp && webVitals.value.lcp > 1500) {
    s -= 10
  }

  // FCP 扣分
  if (webVitals.value.fcp && webVitals.value.fcp > 1800) {
    s -= 15
    sugs.push('FCP 超过 1.8s，建议使用代码分割和懒加载')
  }

  // TTFB 扣分
  if (webVitals.value.ttfb && webVitals.value.ttfb > 800) {
    s -= 15
    sugs.push('TTFB 超过 800ms，建议优化服务器或使用 CDN')
  }

  // 页面加载时间扣分
  if (loadTimes.value.page > 3000) {
    s -= 15
    sugs.push('页面加载时间过长，建议优化资源大小')
  }

  // JS 大小扣分
  if (resourceStats.value.jsSize > 200 * 1024) {
    s -= 10
    sugs.push('JavaScript 体积过大，建议使用 Tree Shaking 和代码分割')
  }

  if (sugs.length === 0) {
    sugs.push('性能表现优秀！')
    sugs.push('可以继续优化图片和字体加载')
  }

  score.value = Math.max(0, s)
  suggestions.value = sugs

  if (score.value >= 90) grade.value = 'A'
  else if (score.value >= 80) grade.value = 'B'
  else if (score.value >= 70) grade.value = 'C'
  else grade.value = 'D'
}

// 运行分析
const runAnalysis = async () => {
  isAnalyzing.value = true

  await new Promise((r) => setTimeout(r, 300))

  getWebVitals()
  getLoadTimes()
  getResourceStats()
  getWaterfallData()
  calculateScore()

  isAnalyzing.value = false
}

// 清除缓存
const clearCache = async () => {
  if (caches) {
    const names = await caches.keys()
    names.forEach((name) => caches.delete(name))
  }
  // 只清除特定应用数据，保留草稿等用户数据
  const keysToKeep = ['lumina_draft_article']
  const allKeys = Object.keys(localStorage)
  allKeys.forEach((key) => {
    if (!keysToKeep.includes(key)) {
      localStorage.removeItem(key)
    }
  })
  sessionStorage.clear()
  runAnalysis()
}

onMounted(() => {
  runAnalysis()
})
</script>

<template>
  <div class="performance-analyzer">
    <div class="analyzer-header">
      <h2>📊 性能分析</h2>
      <div class="header-actions">
        <button class="btn btn-primary" @click="runAnalysis" :disabled="isAnalyzing">
          {{ isAnalyzing ? '分析中...' : '🔍 重新分析' }}
        </button>
        <button class="btn btn-secondary" @click="clearCache">🗑️ 清除缓存</button>
      </div>
    </div>

    <div class="analyzer-grid">
      <!-- Web Vitals -->
      <div class="analyzer-card">
        <h3>🚀 Web Vitals 核心指标</h3>
        <div class="metric-list">
          <div class="metric-item">
            <span class="metric-label">LCP (最大内容绘制)</span>
            <span
              class="metric-value"
              :class="
                webVitals.lcp ? getMetricClass(webVitals.lcp, { good: 1500, warning: 2500 }) : ''
              "
            >
              {{ webVitals.lcp ? webVitals.lcp + 'ms' : '--' }}
            </span>
          </div>
          <div class="metric-item">
            <span class="metric-label">FID (首次输入延迟)</span>
            <span class="metric-value good">{{ webVitals.fid }}ms</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">CLS (累积布局偏移)</span>
            <span class="metric-value good">{{ webVitals.cls.toFixed(3) }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">FCP (首次内容绘制)</span>
            <span
              class="metric-value"
              :class="
                webVitals.fcp ? getMetricClass(webVitals.fcp, { good: 1000, warning: 1800 }) : ''
              "
            >
              {{ webVitals.fcp ? webVitals.fcp + 'ms' : '--' }}
            </span>
          </div>
          <div class="metric-item">
            <span class="metric-label">TTFB (首字节时间)</span>
            <span
              class="metric-value"
              :class="
                webVitals.ttfb ? getMetricClass(webVitals.ttfb, { good: 200, warning: 800 }) : ''
              "
            >
              {{ webVitals.ttfb ? webVitals.ttfb + 'ms' : '--' }}
            </span>
          </div>
        </div>
      </div>

      <!-- 加载时间 -->
      <div class="analyzer-card">
        <h3>⏱️ 页面加载时间</h3>
        <div class="metric-list">
          <div class="metric-item">
            <span class="metric-label">DNS 查询</span>
            <span
              class="metric-value"
              :class="getMetricClass(loadTimes.dns, { good: 50, warning: 200 })"
            >
              {{ loadTimes.dns }}ms
            </span>
          </div>
          <div class="metric-item">
            <span class="metric-label">TCP 连接</span>
            <span
              class="metric-value"
              :class="getMetricClass(loadTimes.tcp, { good: 100, warning: 300 })"
            >
              {{ loadTimes.tcp }}ms
            </span>
          </div>
          <div class="metric-item">
            <span class="metric-label">SSL 握手</span>
            <span
              class="metric-value"
              :class="getMetricClass(loadTimes.ssl, { good: 100, warning: 200 })"
            >
              {{ loadTimes.ssl }}ms
            </span>
          </div>
          <div class="metric-item">
            <span class="metric-label">请求响应</span>
            <span
              class="metric-value"
              :class="getMetricClass(loadTimes.request, { good: 200, warning: 500 })"
            >
              {{ loadTimes.request }}ms
            </span>
          </div>
          <div class="metric-item">
            <span class="metric-label">内容传输</span>
            <span
              class="metric-value"
              :class="getMetricClass(loadTimes.content, { good: 500, warning: 1000 })"
            >
              {{ loadTimes.content }}ms
            </span>
          </div>
          <div class="metric-item">
            <span class="metric-label">DOM 完全加载</span>
            <span
              class="metric-value"
              :class="getMetricClass(loadTimes.dom, { good: 1000, warning: 2000 })"
            >
              {{ loadTimes.dom }}ms
            </span>
          </div>
          <div class="metric-item">
            <span class="metric-label">页面完全加载</span>
            <span
              class="metric-value"
              :class="getMetricClass(loadTimes.page, { good: 2000, warning: 3000 })"
            >
              {{ loadTimes.page }}ms
            </span>
          </div>
        </div>
      </div>

      <!-- 资源统计 -->
      <div class="analyzer-card">
        <h3>📦 资源统计</h3>
        <div class="metric-list">
          <div class="metric-item">
            <span class="metric-label">总资源数</span>
            <span class="metric-value">{{ resourceStats.total }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">总大小</span>
            <span class="metric-value">{{ formatSize(resourceStats.totalSize) }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">JavaScript</span>
            <span
              class="metric-value"
              :class="resourceStats.jsSize > 200 * 1024 ? 'warning' : 'good'"
            >
              {{ formatSize(resourceStats.jsSize) }}
            </span>
          </div>
          <div class="metric-item">
            <span class="metric-label">CSS</span>
            <span
              class="metric-value"
              :class="resourceStats.cssSize > 50 * 1024 ? 'warning' : 'good'"
            >
              {{ formatSize(resourceStats.cssSize) }}
            </span>
          </div>
          <div class="metric-item">
            <span class="metric-label">图片</span>
            <span class="metric-value">{{ formatSize(resourceStats.imgSize) }}</span>
          </div>
          <div class="metric-item">
            <span class="metric-label">字体</span>
            <span class="metric-value">{{ formatSize(resourceStats.fontSize) }}</span>
          </div>
        </div>
      </div>

      <!-- 瀑布图 -->
      <div class="analyzer-card">
        <h3>📈 资源加载瀑布图</h3>
        <div class="waterfall-chart">
          <div v-for="item in waterfallData" :key="item.name" class="waterfall-item">
            <span class="waterfall-name">{{ item.name.substring(0, 15) }}</span>
            <div class="waterfall-bar-wrapper">
              <div
                class="waterfall-bar"
                :style="{
                  width:
                    Math.min(
                      100,
                      (item.duration / Math.max(...waterfallData.map((w) => w.duration))) * 100
                    ) + '%'
                }"
              ></div>
            </div>
            <span class="waterfall-time">{{ item.duration }}ms</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 性能评分 -->
    <div class="analyzer-card score-card">
      <h3>🎯 性能评分</h3>
      <div class="score-display">
        <span class="score-grade" :class="grade.toLowerCase()">{{ grade }}</span>
        <div class="score-info">
          <span class="score-value">{{ score }}/100</span>
          <span class="score-desc">
            {{ score >= 90 ? '优秀' : score >= 80 ? '良好' : score >= 70 ? '一般' : '需要优化' }}
          </span>
        </div>
      </div>
    </div>

    <!-- 优化建议 -->
    <div class="analyzer-card">
      <h3>💡 优化建议</h3>
      <ul class="suggestion-list">
        <li v-for="(sug, index) in suggestions" :key="index">{{ sug }}</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.performance-analyzer {
  padding: 20px;
  background: var(--bg-color, #f5f5f5);
  min-height: 100vh;
}

.analyzer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.analyzer-header h2 {
  color: #333;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.analyzer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.analyzer-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.analyzer-card h3 {
  color: #333;
  margin: 0 0 16px 0;
  font-size: 16px;
}

.metric-list {
  display: flex;
  flex-direction: column;
}

.metric-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.metric-item:last-child {
  border-bottom: none;
}

.metric-label {
  color: #666;
  font-size: 14px;
}

.metric-value {
  font-weight: 600;
  font-size: 14px;
}

.metric-value.good {
  color: #10b981;
}

.metric-value.warning {
  color: #f59e0b;
}

.metric-value.bad {
  color: #ef4444;
}

.waterfall-chart {
  max-height: 250px;
  overflow-y: auto;
}

.waterfall-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.waterfall-name {
  width: 100px;
  font-size: 12px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.waterfall-bar-wrapper {
  flex: 1;
  height: 16px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.waterfall-bar {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.waterfall-time {
  font-size: 12px;
  color: #999;
  width: 50px;
  text-align: right;
}

.score-card {
  text-align: center;
}

.score-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.score-grade {
  font-size: 64px;
  font-weight: bold;
}

.score-grade.a {
  color: #10b981;
}
.score-grade.b {
  color: #3b82f6;
}
.score-grade.c {
  color: #f59e0b;
}
.score-grade.d {
  color: #ef4444;
}

.score-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.score-value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.score-desc {
  font-size: 14px;
  color: #666;
}

.suggestion-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.suggestion-list li {
  padding: 10px 0;
  color: #666;
  border-bottom: 1px solid #f0f0f0;
}

.suggestion-list li:last-child {
  border-bottom: none;
}

@media (max-width: 768px) {
  .analyzer-header {
    flex-direction: column;
    gap: 15px;
  }

  .analyzer-grid {
    grid-template-columns: 1fr;
  }
}
</style>
