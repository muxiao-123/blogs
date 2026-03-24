<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer">
    <div class="footer-container">
      <div class="footer-brand">
        <span class="logo-icon">◈</span>
        <span class="logo-text">Lumina</span>
        <p class="footer-tagline">探索技术的星辰大海</p>
      </div>

      <div class="footer-links">
        <div class="link-group">
          <h4>导航</h4>
          <router-link to="/">首页</router-link>
          <router-link to="/category/frontend">前端</router-link>
          <router-link to="/category/backend">后端</router-link>
        </div>
        <div class="link-group">
          <h4>社交</h4>
          <a href="https://github.com" target="_blank" rel="noopener">GitHub</a>
          <a href="https://twitter.com" target="_blank" rel="noopener">Twitter</a>
          <a href="mailto:hello@example.com">Email</a>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; {{ currentYear }} Lumina Blog. All rights reserved.</p>
      <p class="made-with">Made with ✨ and Vue3</p>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  background: var(--color-bg-light);
  border-top: 1px solid var(--color-border);
  padding: var(--space-3xl) 0 var(--space-xl);
  margin-top: var(--space-3xl);
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-lg);
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-2xl);
}

.footer-brand {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.footer-brand .logo-icon {
  font-size: 2rem;
  color: var(--color-primary);
}

.footer-brand .logo-text {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.footer-tagline {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.footer-links {
  display: flex;
  gap: var(--space-3xl);
}

.link-group h4 {
  font-size: 0.875rem;
  color: var(--color-text-primary);
  margin-bottom: var(--space-md);
}

.link-group a {
  display: block;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  margin-bottom: var(--space-sm);
}

.link-group a:hover {
  color: var(--color-primary);
}

.footer-bottom {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-xl) var(--space-lg) 0;
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-md);
}

.footer-bottom p {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
}

.made-with {
  color: var(--color-accent) !important;
}

@media (max-width: 768px) {
  .footer-container {
    flex-direction: column;
  }

  .footer-links {
    flex-direction: column;
    gap: var(--space-xl);
  }

  .footer-bottom {
    flex-direction: column;
    text-align: center;
  }
}
</style>
