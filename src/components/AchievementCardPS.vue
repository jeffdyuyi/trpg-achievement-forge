<template>
  <div class="card-wrapper-ps">
    <div ref="cardRef" class="ps-card" :style="cardBorderStyle">
      <!-- 背景模糊层 -->
      <div class="ps-bg-blur" :style="bgStyle"></div>

      <!-- 左侧图标区 -->
      <div class="ps-icon-zone">
        <div class="ps-icon-wrap">
          <img v-if="form.iconBase64" :src="form.iconBase64" alt="成就图标" class="ps-icon-img" />
          <!-- PS 占位奖杯 -->
          <svg v-else viewBox="0 0 40 48" class="ps-icon-placeholder" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- 奖杯杯身 -->
            <path d="M8 6 Q8 24 20 28 Q32 24 32 6 Z" fill="rgba(200,200,220,0.3)" stroke="rgba(200,200,220,0.6)" stroke-width="1.5"/>
            <!-- 奖杯把手左 -->
            <path d="M8 10 Q2 10 2 18 Q2 24 8 24" fill="none" stroke="rgba(200,200,220,0.5)" stroke-width="1.5"/>
            <!-- 奖杯把手右 -->
            <path d="M32 10 Q38 10 38 18 Q38 24 32 24" fill="none" stroke="rgba(200,200,220,0.5)" stroke-width="1.5"/>
            <!-- 底座柱 -->
            <rect x="17" y="28" width="6" height="8" fill="rgba(200,200,220,0.4)"/>
            <!-- 底座 -->
            <rect x="11" y="36" width="18" height="4" rx="1" fill="rgba(200,200,220,0.5)" stroke="rgba(200,200,220,0.6)" stroke-width="1"/>
            <!-- 星星高光 -->
            <circle cx="20" cy="14" r="3" fill="rgba(255,255,255,0.2)"/>
          </svg>
        </div>
      </div>

      <!-- 中间内容区 -->
      <div class="ps-content">
        <div class="ps-title" v-html="form.title || '成就名称'"></div>
        <div class="ps-sub-row">
          <span class="ps-earned-label">Trophy earned!</span>
          <span v-if="form.recipient" class="ps-recipient">{{ form.recipient }}</span>
          <span v-if="form.description" class="ps-desc-sep">·</span>
          <span class="ps-desc">{{ descText }}</span>
        </div>
      </div>

      <!-- 右侧：奖杯等级 + PS 徽标 -->
      <div class="ps-right-zone">
        <div v-if="form.achievementValue" class="ps-trophy-badge" :class="trophyClass">
          {{ trophyIcon }} {{ form.achievementValue }}
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

// 描述截断
const descText = computed(() => {
  const raw = form.value.description || ''
  const plain = raw.replace(/<[^>]+>/g, '')
  return plain.length > 40 ? plain.slice(0, 40) + '…' : plain
})

// 奖杯等级颜色
const trophyClass = computed(() => {
  const v = (form.value.achievementValue || '').toLowerCase()
  if (v.includes('铂') || v.includes('platinum') || v.includes('plat')) return 'trophy-platinum'
  if (v.includes('金') || v.includes('gold')) return 'trophy-gold'
  if (v.includes('银') || v.includes('silver')) return 'trophy-silver'
  if (v.includes('铜') || v.includes('bronze')) return 'trophy-bronze'
  return 'trophy-silver'
})

const trophyIcon = computed(() => {
  const cls = trophyClass.value
  if (cls === 'trophy-platinum') return '💎'
  if (cls === 'trophy-gold') return '🥇'
  if (cls === 'trophy-silver') return '🥈'
  if (cls === 'trophy-bronze') return '🥉'
  return '🏆'
})

const cardBorderStyle = computed(() => ({
  borderColor: form.value.borderColor,
  borderWidth: `${form.value.borderWidth || 0}px`,
}))

const bgStyle = computed(() => {
  if (form.value.backgroundImage) {
    return {
      backgroundImage: `url(${form.value.backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
  }
  return {}
})

function forceShimmerPos() {}

defineExpose({ cardRef, isExporting, forceShimmerPos })
</script>

<style scoped>
.card-wrapper-ps {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 20px 0;
  filter: drop-shadow(0 6px 32px rgba(0, 0, 0, 0.6));
}

.ps-card {
  position: relative;
  width: 580px;
  height: 80px;
  max-width: 100%;
  display: flex;
  align-items: center;
  border-radius: 6px;
  overflow: hidden;
  border-style: solid;
  background: rgba(20, 20, 26, 0.94);
  box-shadow:
    0 0 0 1px rgba(255,255,255,0.06),
    inset 0 1px 0 rgba(255,255,255,0.07);
}

/* 背景图模糊叠加 */
.ps-bg-blur {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  filter: blur(4px) brightness(0.35);
  z-index: 0;
}

/* 顶部细线高光 */
.ps-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15) 30%, rgba(255,255,255,0.15) 70%, transparent);
  z-index: 3;
}

/* 图标区 */
.ps-icon-zone {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.ps-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.15);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ps-icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ps-icon-placeholder {
  width: 36px;
  height: 36px;
  opacity: 0.6;
}

/* 内容区 */
.ps-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  padding: 10px 12px 10px 4px;
  position: relative;
  z-index: 2;
  min-width: 0;
}

.ps-title {
  font-size: 17px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: var(--font-sans);
}

.ps-sub-row {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.ps-earned-label {
  font-size: 11px;
  color: rgba(180, 180, 200, 0.6);
  flex-shrink: 0;
  font-style: italic;
}

.ps-recipient {
  font-size: 11px;
  color: rgba(200, 200, 220, 0.75);
  font-weight: 600;
  flex-shrink: 0;
}

.ps-desc-sep {
  color: rgba(255,255,255,0.2);
  flex-shrink: 0;
  font-size: 11px;
}

.ps-desc {
  font-size: 11px;
  color: rgba(180, 180, 200, 0.55);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 右侧区域 */
.ps-right-zone {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 14px 8px 8px;
  position: relative;
  z-index: 2;
}

/* 奖杯等级徽章 */
.ps-trophy-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
  white-space: nowrap;
  letter-spacing: 0.3px;
}

.trophy-platinum {
  color: #e0d8ff;
  background: rgba(120, 90, 220, 0.3);
  border: 1px solid rgba(150, 120, 255, 0.5);
}
.trophy-gold {
  color: #ffd97a;
  background: rgba(180, 120, 0, 0.3);
  border: 1px solid rgba(220, 160, 20, 0.5);
}
.trophy-silver {
  color: #d0d0e0;
  background: rgba(120, 120, 150, 0.3);
  border: 1px solid rgba(180, 180, 200, 0.4);
}
.trophy-bronze {
  color: #d4956a;
  background: rgba(160, 80, 20, 0.3);
  border: 1px solid rgba(200, 100, 40, 0.4);
}

</style>
