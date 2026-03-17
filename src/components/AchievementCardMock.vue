<template>
  <div class="card-mock">
    <!-- Static visual copy of AchievementCard -->
    <div class="achievement-card" :class="[bgClass, { 'is-vertical': form.metadata?.orientation === 'vertical' }]" :style="customStyle">
      <!-- Background Image Overlay -->
      <div v-if="form.style?.backgroundImage" class="card-bg-overlay" :style="{ backgroundImage: `url(${form.style.backgroundImage})` }"></div>
      <div class="card-border-deco"></div>
      
      <div v-if="form.iconBase64" class="card-icon-area">
        <div class="card-icon-wrap">
          <img :src="form.iconBase64" class="card-icon-img" />
        </div>
      </div>

      <div class="card-core" :style="coreAlignStyle">
        <div class="card-badge-label">🏆 成就达成</div>
        <h1 class="card-title golden-static" v-html="form.title"></h1>
        <div class="card-recipient">
          <span class="card-recipient-prefix">授予：</span>
          <span class="card-recipient-name" v-html="form.recipient"></span>
        </div>
      </div>

      <div class="card-divider"></div>

      <div class="card-desc-area">
        <p class="card-description" :style="descAlignStyle" v-html="form.description"></p>
      </div>

      <div class="card-meta-area" :style="metaAlignStyle">
        <div v-if="form.metadata?.gameName" class="card-meta-item">
          <span>🎲</span> <span v-html="form.metadata.gameName"></span>
        </div>
        <div v-if="form.metadata?.issuer" class="card-meta-item">
          <span>📜</span> <span v-html="form.metadata.issuer"></span>
        </div>
        <div v-if="form.metadata?.date" class="card-meta-item">
          <span>📅</span> <span>{{ form.metadata.date }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  form: Object
})

const bgClass = computed(() => {
  if (props.form.style?.backgroundTheme === 'custom') return ''
  return `bg-theme-${props.form.style?.backgroundTheme || 'dark'}`
})

const customStyle = computed(() => {
  const styles = {
    borderColor: props.form.metadata?.borderColor || '#bf953f',
    borderWidth: `${props.form.metadata?.borderWidth || 1}px`
  }
  if (props.form.style?.backgroundTheme === 'custom') {
    styles.background = props.form.style?.customBgColor
  }
  return styles
})

const coreAlignStyle = computed(() => {
  const align = props.form.metadata?.coreAlign || 'left'
  const alignItems = align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'
  return { textAlign: align, alignItems }
})

const descAlignStyle = computed(() => {
  const align = props.form.metadata?.descAlign || 'left'
  return { 
    textAlign: align, 
    fontSize: (props.form.metadata?.descriptionFontSize || 13) + 'px'
  }
})

const metaAlignStyle = computed(() => {
  const align = props.form.metadata?.metaAlign || 'left'
  const alignItems = align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'
  return { textAlign: align, alignItems }
})
</script>

<style scoped>
/* Re-use most styles from AchievementCard.vue but simplified/static */
.card-mock {
  width: 100%;
  display: flex;
  justify-content: center;
}

/* Base card styles (copied from AchievementCard for self-containment in mock) */
.achievement-card {
  position: relative;
  width: 1000px;
  min-height: 140px;
  border-radius: 10px;
  border: 1px solid rgba(191,149,63,0.45);
  display: flex;
  overflow: hidden;
  background-size: cover;
  text-align: left;
}

.achievement-card.is-vertical {
  width: 400px;
  min-height: 600px;
  flex-direction: column;
}

.card-bg-overlay {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  z-index: 1;
  opacity: 0.6;
}

/* We need to ensure the global themes are applied or copy them here */
/* For brevity, assuming the global themes are available in App.vue/style.css */

.golden-static {
  background: linear-gradient(to right, #bf953f, #fcf6ba, #b38728, #fcf6ba, #bf953f);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: 800;
}

.card-icon-area { width: 120px; display: flex; align-items: center; justify-content: center; padding: 16px; }
.card-icon-wrap { width: 70px; height: 70px; border-radius: 50%; border: 2px solid var(--gold-2); overflow: hidden; }
.card-icon-img { width: 100%; height: 100%; object-fit: cover; }

.card-core { width: 260px; padding: 20px 15px; display: flex; flex-direction: column; justify-content: center; }
.card-badge-label { font-size: 10px; color: var(--gold-1); margin-bottom: 5px; letter-spacing: 1px; }
.card-title { font-size: 22px; margin: 0 0 10px; font-family: 'LXGW WenKai', serif; }
.card-recipient { font-size: 13px; color: rgba(255,255,255,0.8); }

.card-divider { width: 1px; background: rgba(191,149,63,0.2); margin: 20px 0; }

.card-desc-area { flex: 1; padding: 20px; display: flex; align-items: center; }
.card-description { color: rgba(255,255,255,0.85); line-height: 1.6; font-family: 'LXGW WenKai', serif; margin: 0; }

.card-meta-area { width: 160px; padding: 20px; display: flex; flex-direction: column; justify-content: flex-end; gap: 5px; font-size: 11px; color: rgba(255,255,255,0.5); position: relative; z-index: 2; }
.card-meta-item { display: flex; align-items: center; gap: 5px; }

.is-vertical .card-icon-area { width: 100%; padding-top: 32px; padding-bottom: 0; }
.is-vertical .card-icon-wrap { width: 100px; height: 100px; }
.is-vertical .card-core { width: 100%; padding: 24px; }
.is-vertical .card-divider { width: 80%; height: 1px; margin: 0 auto; background: rgba(191,149,63,0.2); }
.is-vertical .card-desc-area { padding: 24px; }
.is-vertical .card-meta-area { width: 100%; padding: 24px; flex-direction: row; justify-content: center; gap: 16px; }

.card-border-deco { position: absolute; inset: 0; pointer-events: none; border: inherit; border-radius: 10px; z-index: 5; }
.card-core, .card-desc-area { position: relative; z-index: 2; }
</style>
