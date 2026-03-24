<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()
// 使用完整路径作为 key，强制路由变化时重新渲染
const routeKey = computed(() => route.fullPath)
</script>

<template>
  <RouterView :key="routeKey" v-slot="{ Component }">
    <transition name="fade-slide" mode="out-in">
      <component :is="Component" />
    </transition>
  </RouterView>
</template>
