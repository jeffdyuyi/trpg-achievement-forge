<template>
  <div class="card-wrapper-steam">
    <div ref="cardRef" class="steam-card" :style="cardStyle">
      <!-- Main Content (Top) -->
      <div class="steam-main-row">
        <!-- Left: Icon Container -->
        <div class="steam-icon-zone">
          <!-- Outer radiating flares if rare -->
          <div class="steam-icon-bg-flare" v-if="isRare">
            <div 
              v-for="i in 8" 
              :key="i" 
              class="flare-ray" 
              :style="{ transform: `rotate(${i * 45}deg)` }"
            ></div>
            <div class="flare-glow"></div>
          </div>
          
          <div class="steam-icon-wrap" :class="{ 'is-rare': isRare }">
            <img v-if="form.iconBase64" :src="form.iconBase64" alt="成就图标" class="steam-icon-img" />
            <span v-else class="steam-icon-placeholder">🏆</span>
          </div>
        </div>

        <!-- Right: Text Contents -->
        <div class="steam-info-zone">
          <div class="steam-game-name" v-if="form.gameName">{{ form.gameName }}</div>
          <div class="steam-title" v-html="form.title || '成就名称'"></div>
          <div class="steam-desc" v-html="form.description || '解锁描述...'"></div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="steam-bottom-bar">
        <div class="steam-unlock-time">
          解锁时间：{{ form.date ? formatDate(form.date) : '2026年6月6日 下午10:00' }}
        </div>
        <div class="steam-rarity" :class="{ 'is-rare': isRare }">
          <span class="rarity-value">{{ form.achievementValue || '9.8%' }}</span> 的玩家拥有此成就
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

// Determine if the achievement counts as rare (< 10%)
const isRare = computed(() => {
  const val = form.value.achievementValue
  if (!val) return true // Default to showing gold rays if empty
  // Check if contains percentage
  const match = val.match(/([0-9.]+)\s*%/)
  if (match) {
    const p = parseFloat(match[1])
    return p <= 10
  }
  return true
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 下午10:00`
  } catch (e) {
    return dateStr
  }
}

// Custom border styles
const cardStyle = computed(() => ({
  borderColor: form.value.borderColor || 'rgba(235, 197, 71, 0.2)',
  borderWidth: form.value.borderColor ? `${form.value.borderWidth || 0}px` : '0px',
}))

function forceShimmerPos() {}

defineExpose({ cardRef, isExporting, forceShimmerPos })
</script>

<style scoped>
.card-wrapper-steam {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 20px 0;
  filter: drop-shadow(0 15px 45px rgba(0,0,0,0.6));
}

.steam-card {
  width: 580px;
  min-height: 156px;
  background: linear-gradient(135deg, #1b2838 0%, #172030 100%);
  border-style: solid;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  font-family: var(--font-sans);
}

/* Top content area */
.steam-main-row {
  display: flex;
  padding: 20px 24px;
  gap: 20px;
  align-items: center;
  flex: 1;
}

/* Icon column */
.steam-icon-zone {
  position: relative;
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.steam-icon-bg-flare {
  position: absolute;
  width: 140px;
  height: 140px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 1;
}

.flare-ray {
  position: absolute;
  top: 10px;
  left: 69px;
  width: 2px;
  height: 120px;
  background: linear-gradient(to top, rgba(235, 197, 71, 0) 0%, rgba(235, 197, 71, 0.35) 50%, rgba(255, 235, 150, 0.6) 100%);
  transform-origin: center center;
}

.flare-glow {
  position: absolute;
  width: 100px;
  height: 100px;
  top: 20px;
  left: 20px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(235, 197, 71, 0.25) 0%, rgba(235, 197, 71, 0) 70%);
}

.steam-icon-wrap {
  width: 74px;
  height: 74px;
  background: #111822;
  border: 2px solid #3c4a5c;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
  box-shadow: 0 4px 10px rgba(0,0,0,0.5);
}

.steam-icon-wrap.is-rare {
  border-color: #ebc547;
  box-shadow: 0 0 12px rgba(235, 197, 71, 0.4);
}

.steam-icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.steam-icon-placeholder {
  font-size: 32px;
}

/* Info Column */
.steam-info-zone {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.steam-game-name {
  font-size: 11px;
  font-weight: 700;
  color: #387cbd;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 2px;
}

.steam-title {
  font-size: 17px;
  font-weight: 700;
  color: #ffffff;
  font-family: var(--font-sans);
}

.steam-desc {
  font-size: 13.5px;
  color: #9fadb7;
  margin-top: 4px;
  line-height: 1.4;
}

/* Bottom Bar */
.steam-bottom-bar {
  background: rgba(0, 0, 0, 0.25);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding: 8px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.steam-unlock-time {
  font-size: 11px;
  color: #627482;
}

.steam-rarity {
  font-size: 11.5px;
  color: #9fadb7;
}

.steam-rarity.is-rare {
  color: #ebe2c7;
}

.rarity-value {
  color: #ebc547;
  font-weight: 700;
}
</style>
