<template>
  <div class="card-wrapper-xbox">
    <div ref="cardRef" class="xbox-card" :style="cardStyle">
      <!-- 左侧图标区 -->
      <div class="xbox-icon-zone">
        <div class="xbox-icon-wrap">
          <img v-if="form.iconBase64" :src="form.iconBase64" alt="成就图标" class="xbox-icon-img" />
          <!-- 占位：Xbox 钻石图标 -->
          <svg v-else viewBox="0 0 40 40" class="xbox-icon-placeholder" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="20,4 34,14 34,26 20,36 6,26 6,14" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" stroke-width="1.5"/>
            <polygon points="20,10 28,16 28,24 20,30 12,24 12,16" fill="rgba(255,255,255,0.25)" stroke="rgba(255,255,255,0.5)" stroke-width="1"/>
            <polygon points="20,16 24,19 24,23 20,26 16,23 16,19" fill="rgba(255,255,255,0.5)"/>
          </svg>
        </div>
      </div>

      <!-- 右侧内容区 -->
      <div class="xbox-content">
        <!-- 顶行：稀有标签 + 点数徽章 -->
        <div class="xbox-top-row">
          <span class="xbox-rare-label">🏅 成就达成</span>
          <span v-if="form.achievementValue" class="xbox-value-badge">
            <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="8" y="11" text-anchor="middle" font-size="8" font-weight="bold" fill="currentColor">G</text></svg>
            {{ form.achievementValue }}
          </span>
        </div>

        <!-- 成就标题 -->
        <div class="xbox-title" v-html="form.title || '成就名称'"></div>

        <!-- 底行：获得者 + 描述 -->
        <div class="xbox-bottom-row">
          <span v-if="form.recipient" class="xbox-recipient">{{ form.recipient }}</span>
          <span v-if="form.recipient && form.description" class="xbox-dot">·</span>
          <span class="xbox-desc" v-html="descText"></span>
        </div>
      </div>
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
const isExporting = ref(false)

// 描述截断（单行显示）
const descText = computed(() => {
  const raw = form.value.description || '获得原因描述...'
  // 去掉 HTML 标签后截断
  const plain = raw.replace(/<[^>]+>/g, '')
  return plain.length > 50 ? plain.slice(0, 50) + '…' : plain
})

// 自定义卡片样式（边框颜色沿用）
const cardStyle = computed(() => ({
  borderColor: form.value.borderColor || '#107C10',
  borderWidth: `${form.value.borderWidth || 0}px`,
}))

// GIF兼容接口（无动画但保持接口一致）
function forceShimmerPos() {}

defineExpose({ cardRef, isExporting, forceShimmerPos })
</script>

<style scoped>
.card-wrapper-xbox {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 20px 0;
  filter: drop-shadow(0 6px 24px rgba(16, 124, 16, 0.35));
}

.xbox-card {
  position: relative;
  width: 580px;
  height: 90px;
  max-width: 100%;
  display: flex;
  align-items: center;
  border-radius: 45px;          /* pill 形 */
  overflow: hidden;
  border-style: solid;
  /* Xbox 绿渐变 */
  background: linear-gradient(90deg, #0a5208 0%, #107C10 30%, #1db81d 60%, #107C10 100%);
  box-shadow:
    0 0 0 1px rgba(0,0,0,0.5),
    inset 0 1px 0 rgba(255,255,255,0.15),
    inset 0 -1px 0 rgba(0,0,0,0.3);
}

/* 左侧高光 */
.xbox-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 120px;
  background: radial-gradient(ellipse at left center, rgba(0,0,0,0.25) 0%, transparent 80%);
  border-radius: 45px 0 0 45px;
  pointer-events: none;
}

/* 内部扫光 */
.xbox-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%);
  pointer-events: none;
}

/* 图标区 */
.xbox-icon-zone {
  flex-shrink: 0;
  width: 90px;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.xbox-icon-wrap {
  width: 62px;
  height: 62px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid rgba(255, 255, 255, 0.3);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 0 0 3px rgba(255,255,255,0.08),
    inset 0 2px 4px rgba(255,255,255,0.1);
}

.xbox-icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.xbox-icon-placeholder {
  width: 38px;
  height: 38px;
  opacity: 0.7;
}

/* 内容区 */
.xbox-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
  padding: 10px 20px 10px 4px;
  position: relative;
  z-index: 2;
  min-width: 0;
}

.xbox-top-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.xbox-rare-label {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.75);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.xbox-value-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 10px;
  padding: 1px 7px;
  margin-left: auto;
}

.xbox-title {
  font-size: 19px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'LXGW WenKai', 'Inter', sans-serif;
  text-shadow: 0 1px 4px rgba(0,0,0,0.4);
}

.xbox-bottom-row {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
}

.xbox-recipient {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  flex-shrink: 0;
  font-weight: 600;
}

.xbox-dot {
  color: rgba(255, 255, 255, 0.35);
  font-size: 12px;
  flex-shrink: 0;
}

.xbox-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
