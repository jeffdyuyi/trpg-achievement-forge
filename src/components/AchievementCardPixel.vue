<template>
  <div class="card-wrapper-pixel">
    <div ref="cardRef" class="pixel-card" :style="cardStyle">
      <!-- CRT Scanline overlay -->
      <div class="crt-scanlines"></div>

      <!-- Header: Blinking Banner -->
      <div class="pixel-header">
        <span class="pixel-header-blink">★ ACHIEVEMENT UNLOCKED ★</span>
      </div>

      <!-- Main body -->
      <div class="pixel-body">
        <!-- Left: Icon Frame -->
        <div class="pixel-icon-zone">
          <div class="pixel-icon-border">
            <img v-if="form.iconBase64" :src="form.iconBase64" alt="成就图标" class="pixel-icon-img" />
            <span v-else class="pixel-icon-placeholder">👾</span>
          </div>
        </div>

        <!-- Right: Retro telemetry details -->
        <div class="pixel-info-zone">
          <div class="pixel-top-meta">
            <span class="pixel-game-name" v-if="form.gameName">>STAGE: {{ form.gameName }}</span>
            <span class="pixel-score-val" v-if="form.achievementValue">
              SCORE: +{{ form.achievementValue }}
            </span>
          </div>

          <div class="pixel-title" v-html="form.title || '成就名称'"></div>
          <div class="pixel-desc" v-html="form.description || '获得原因描述...'"></div>

          <!-- Bottom Meta info -->
          <div class="pixel-bottom-meta">
            <span class="pixel-player" v-if="form.recipient">>1P: {{ form.recipient }}</span>
            <span class="pixel-date" v-if="form.date">DATE: {{ form.date }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAchievementStore } from '../stores/achievement.js'

const props = defineProps({
  form: {
    type: Object,
    default: null
  }
})

const store = useAchievementStore()
const form = computed(() => props.form || store.form)

const cardRef = ref(null)
const isExporting = ref(false)

const cardStyle = computed(() => ({
  borderColor: form.value.borderColor || '#ff0055',
  borderWidth: form.value.borderColor ? `${form.value.borderWidth || 4}px` : '4px',
}))

function forceShimmerPos() {}

defineExpose({ cardRef, isExporting, forceShimmerPos })
</script>

<style scoped>
@keyframes pixel-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.card-wrapper-pixel {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 20px 0;
  filter: drop-shadow(0 10px 30px rgba(0, 240, 255, 0.25));
}

.pixel-card {
  position: relative;
  width: 580px;
  min-height: 160px;
  background: #0d0d13;
  border-style: solid;
  border-color: #ff0055;
  box-shadow: 
    0 0 0 4px #0d0d13, 
    0 0 0 8px #ffffff;
  padding: 12px;
  overflow: hidden;
  font-family: 'Courier New', Courier, monospace;
  image-rendering: pixelated;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* CRT Scanlines Overlay */
.crt-scanlines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    rgba(18, 16, 16, 0) 50%, 
    rgba(0, 0, 0, 0.25) 50%
  );
  background-size: 100% 4px;
  z-index: 5;
  pointer-events: none;
}

/* Blinking Header */
.pixel-header {
  border-bottom: 2px dashed #33ff33;
  padding-bottom: 6px;
  display: flex;
  justify-content: center;
  z-index: 2;
}

.pixel-header-blink {
  font-size: 13px;
  font-weight: 900;
  color: #33ff33;
  letter-spacing: 2px;
  animation: pixel-blink 1.2s steps(2, start) infinite;
}

/* Main Body */
.pixel-body {
  display: flex;
  gap: 16px;
  align-items: center;
  flex: 1;
  z-index: 2;
}

/* Icon box */
.pixel-icon-zone {
  flex-shrink: 0;
}

.pixel-icon-border {
  width: 76px;
  height: 76px;
  background: #000;
  border: 4px solid #00f0ff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 4px 4px 0px #ff0055;
}

.pixel-icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  image-rendering: pixelated;
}

.pixel-icon-placeholder {
  font-size: 32px;
}

/* Telemetry Details */
.pixel-info-zone {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: #ffffff;
}

.pixel-top-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pixel-game-name {
  font-size: 10px;
  color: #00f0ff;
  font-weight: bold;
}

.pixel-score-val {
  font-size: 10px;
  background: #ff0055;
  color: #fff;
  padding: 1px 6px;
  font-weight: bold;
  box-shadow: 2px 2px 0px #00f0ff;
}

.pixel-title {
  font-size: 16px;
  font-weight: bold;
  color: #ffff00;
  letter-spacing: 0.5px;
  margin-top: 2px;
}

.pixel-desc {
  font-size: 12px;
  color: #b0b0bc;
  line-height: 1.4;
  margin-top: 2px;
}

.pixel-bottom-meta {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  color: #33ff33;
  margin-top: 6px;
  border-top: 1px dashed rgba(51,255,51,0.2);
  padding-top: 4px;
}

.pixel-player {
  font-weight: bold;
}

.pixel-date {
  opacity: 0.8;
}
</style>
