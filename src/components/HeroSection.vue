<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { api } from '@/api/index'

const particles = ref<Array<{ x: number; y: number; size: number; speed: number }>>([])

const stats = ref({
  articleCount: 0,
  totalViews: 0,
  totalSubscribers: 0
})

const loading = ref(true)

const fetchStats = async () => {
  try {
    const data = await api.getStats()
    stats.value = data
  } catch (e) {
    console.error('Failed to fetch stats:', e)
  } finally {
    loading.value = false
  }
}

const formatNumber = (num: number): string => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w+'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k+'
  }
  return num.toString()
}

onMounted(() => {
  // Generate random particles
  for (let i = 0; i < 50; i++) {
    particles.value.push({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 2 + 0.5
    })
  }
  // Fetch stats from API
  fetchStats()
})
</script>

<template>
  <section class="hero">
    <div class="hero-bg">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
      <div class="particles">
        <span
          v-for="(particle, index) in particles"
          :key="index"
          class="particle"
          :style="{
            left: particle.x + '%',
            top: particle.y + '%',
            width: particle.size + 'px',
            height: particle.size + 'px',
            animationDuration: particle.speed + 's'
          }"
        ></span>
      </div>
    </div>
    <div class="hero-content">
      <h1 class="hero-title">
        <span class="title-line">探索技术的</span>
        <span class="title-line gradient">星辰大海</span>
      </h1>
      <p class="hero-subtitle">
        分享前端、后端、全栈开发经验<br>
        用代码书写技术人生
      </p>
      <div class="hero-stats" v-if="!loading">
        <div class="stat">
          <span class="stat-value">{{ formatNumber(stats.articleCount) }}</span>
          <span class="stat-label">文章</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ formatNumber(stats.totalViews) }}</span>
          <span class="stat-label">访问</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ formatNumber(stats.totalSubscribers) }}</span>
          <span class="stat-label">订阅</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 80px 24px 48px;
  box-sizing: border-box;
}

.hero-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
}

.orb-1 {
  width: 600px;
  height: 600px;
  background: var(--color-primary);
  top: -200px;
  right: -100px;
  animation: float 8s ease-in-out infinite;
}

.orb-2 {
  width: 400px;
  height: 400px;
  background: var(--color-secondary);
  bottom: -100px;
  left: -100px;
  animation: float 10s ease-in-out infinite reverse;
}

.orb-3 {
  width: 300px;
  height: 300px;
  background: var(--color-accent);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: pulse-glow 4s ease-in-out infinite;
}

.particles {
  position: absolute;
  inset: 0;
}

.particle {
  position: absolute;
  background: var(--color-primary);
  border-radius: 50%;
  opacity: 0.6;
  animation: float 4s ease-in-out infinite;
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  animation: fade-in-up 0.8s ease-out;
  margin-top: -60px;
}

.hero-title {
  font-size: clamp(2.5rem, 8vw, 5rem);
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: var(--space-lg);
}

.title-line {
  display: block;
}

.title-line.gradient {
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary), var(--color-accent));
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: gradient-shift 5s ease infinite;
}

.hero-subtitle {
  font-size: clamp(1rem, 2vw, 1.25rem);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-2xl);
  line-height: 1.8;
}

.hero-stats {
  display: flex;
  gap: var(--space-2xl);
  justify-content: center;
  margin-top: 24px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-primary);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

@media (max-width: 768px) {
  .hero-stats {
    gap: var(--space-lg);
  }

  .stat-value {
    font-size: 1.5rem;
  }
}
</style>
