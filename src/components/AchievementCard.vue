<template>
  <div class="card-wrapper" :class="{ 'is-exporting': isExporting }">
    <!-- The actual achievement card for export -->
    <div
      ref="cardRef"
      class="achievement-card"
      :class="bgClass"
      :style="customStyle"
    >
      <!-- Decorative border overlay -->
      <div class="card-border-deco"></div>

      <!-- Left: Icon area -->
      <div v-if="form.iconBase64" class="card-icon-area">
        <div class="card-icon-wrap">
          <img :src="form.iconBase64" alt="成就图标" class="card-icon-img" />
        </div>
      </div>
      <div v-else class="card-icon-area card-icon-placeholder">
        <div class="card-icon-wrap card-icon-empty">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </div>
      </div>

      <!-- Center-left: Core info -->
      <div class="card-core">
        <!-- Achievement badge label -->
        <div class="card-badge-label">🏆 成就达成</div>
        <!-- Title with golden shimmer -->
        <h1 class="card-title golden-text" ref="titleRef" v-html="form.title || '成就名称'"></h1>
        <!-- Recipient -->
        <div class="card-recipient">
          <span class="card-recipient-prefix">授予：</span>
          <span class="card-recipient-name" v-html="form.recipient || '获得者'"></span>
        </div>
      </div>

      <!-- Divider -->
      <div class="card-divider"></div>

      <!-- Center-right: Description -->
      <div class="card-desc-area">
        <p class="card-description" :style="{ fontSize: (form.descriptionFontSize || 13) + 'px' }" v-html="form.description || '在此填写成就描述，讲述这段传奇的由来……'"></p>
      </div>

      <!-- Right: Metadata -->
      <div class="card-meta-area">
        <div v-if="form.gameName" class="card-meta-item">
          <span class="card-meta-icon">🎲</span>
          <span v-html="form.gameName"></span>
        </div>
        <div v-if="form.issuer" class="card-meta-item">
          <span class="card-meta-icon">📜</span>
          <span v-html="form.issuer"></span>
        </div>
        <div v-if="form.date" class="card-meta-item">
          <span class="card-meta-icon">📅</span>
          <span>{{ form.date }}</span>
        </div>
      </div>

      <!-- Corner decoration -->
      <div class="card-corner card-corner-tl"></div>
      <div class="card-corner card-corner-tr"></div>
      <div class="card-corner card-corner-bl"></div>
      <div class="card-corner card-corner-br"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAchievementStore } from '../stores/achievement.js'
import { storeToRefs } from 'pinia'

const store = useAchievementStore()
const { form } = storeToRefs(store)

const cardRef = ref(null)
const titleRef = ref(null)
const isExporting = ref(false)

// Used for GIF generation to manually step animation
function forceShimmerPos(percentage) {
  if (titleRef.value) {
    if (percentage === null) {
      titleRef.value.style.backgroundPosition = ''
    } else {
      titleRef.value.style.backgroundPosition = `${percentage}% center`
    }
  }
}

defineExpose({ cardRef, isExporting, forceShimmerPos })

const bgClass = computed(() => {
  if (form.value.backgroundTheme === 'custom') return ''
  return `bg-theme-${form.value.backgroundTheme}`
})

const customStyle = computed(() => {
  if (form.value.backgroundTheme === 'custom') {
    return { background: form.value.customBgColor }
  }
  return {}
})
</script>

<style scoped>
.card-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 20px 0;
  filter: drop-shadow(0 8px 40px rgba(191,149,63,0.18));
}

.achievement-card {
  position: relative;
  width: 1000px;
  min-height: 140px;
  height: auto;
  max-width: 100%;
  display: flex;
  align-items: stretch;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(191,149,63,0.45);
  box-shadow:
    0 0 0 1px rgba(0,0,0,0.6),
    0 0 30px rgba(191,149,63,0.12),
    inset 0 0 40px rgba(0,0,0,0.5);
  /* Noise texture */
  background-size: auto, cover;
}

/* Corner decorations */
.card-corner {
  position: absolute;
  width: 18px;
  height: 18px;
  border-color: rgba(191,149,63,0.8);
  border-style: solid;
  z-index: 5;
}
.card-corner-tl { top: 6px; left: 6px; border-width: 2px 0 0 2px; border-radius: 2px 0 0 0; }
.card-corner-tr { top: 6px; right: 6px; border-width: 2px 2px 0 0; border-radius: 0 2px 0 0; }
.card-corner-bl { bottom: 6px; left: 6px; border-width: 0 0 2px 2px; border-radius: 0 0 0 2px; }
.card-corner-br { bottom: 6px; right: 6px; border-width: 0 2px 2px 0; border-radius: 0 0 2px 0; }

.card-border-deco {
  position: absolute;
  inset: 0;
  border-radius: 10px;
  pointer-events: none;
  z-index: 4;
  background: linear-gradient(
    135deg,
    rgba(191,149,63,0.07) 0%,
    transparent 50%,
    rgba(191,149,63,0.04) 100%
  );
}

/* Icon area */
.card-icon-area {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  padding: 16px 12px;
  position: relative;
  z-index: 2;
}
.card-icon-placeholder {
  opacity: 0.2;
}
.card-icon-wrap {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  border: 2px solid rgba(191,149,63,0.7);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.4);
  box-shadow: 0 0 16px rgba(191,149,63,0.3);
  color: rgba(191,149,63,0.8);
}
.card-icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.card-icon-empty {
  border-style: dashed;
}

/* Core info */
.card-core {
  flex: 0 0 auto;
  width: 260px;
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.card-badge-label {
  font-size: 10px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: rgba(191,149,63,0.7);
  margin-bottom: 4px;
  font-weight: 600;
}

.card-title {
  font-size: 22px;
  line-height: 1.25;
  margin: 0 0 8px;
  word-break: break-all;
  font-family: 'LXGW WenKai', serif;
}

.card-recipient {
  font-size: 13px;
  color: rgba(240,234,216,0.75);
  display: flex;
  align-items: baseline;
  gap: 2px;
}
.card-recipient-prefix {
  color: rgba(191,149,63,0.6);
  font-size: 11px;
}
.card-recipient-name {
  font-weight: 600;
  color: rgba(240,234,216,0.9);
}

/* Vertical divider */
.card-divider {
  flex-shrink: 0;
  width: 1px;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(191,149,63,0.4) 20%,
    rgba(191,149,63,0.4) 80%,
    transparent
  );
  margin: 16px 0;
  z-index: 2;
}

/* Description area */
.card-desc-area {
  flex: 1;
  padding: 16px 16px;
  display: flex;
  align-items: center;
  position: relative;
  z-index: 2;
}
.card-description {
  line-height: 1.7;
  color: rgba(240,234,216,0.82);
  margin: 0;
  font-family: 'LXGW WenKai', serif;
  word-break: break-all;
  white-space: pre-wrap;
}

/* Vertical divider before meta */
.card-meta-area::before {
  content: '';
  display: block;
  position: absolute;
  left: 0;
  top: 16px;
  bottom: 16px;
  width: 1px;
  background: linear-gradient(
    to bottom,
    transparent,
    rgba(191,149,63,0.3) 20%,
    rgba(191,149,63,0.3) 80%,
    transparent
  );
}

/* Metadata */
.card-meta-area {
  flex-shrink: 0;
  width: 160px;
  padding: 12px 12px 12px 16px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 4px;
  position: relative;
  z-index: 2;
}
.card-meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10.5px;
  color: rgba(168,155,122,0.65);
  line-height: 1.5;
}
.card-meta-icon {
  font-size: 11px;
  flex-shrink: 0;
}

/* Export state */
.is-exporting .golden-text {
  animation: none !important;
  background-position: 100% center !important;
  -webkit-text-fill-color: transparent !important;
}
</style>
