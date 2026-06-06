<template>
  <div class="card-wrapper-parchment">
    <div ref="cardRef" class="parchment-card" :style="cardStyle">
      <!-- Parchment vignette / paper grain mask -->
      <div class="parchment-vignette"></div>

      <!-- Main Layout -->
      <div class="parchment-body">
        <!-- Left: Wax Seal / Emblem Frame -->
        <div class="parchment-emblem-zone">
          <div class="wax-seal-outer">
            <div class="wax-seal-inner">
              <img v-if="form.iconBase64" :src="form.iconBase64" alt="成就图标" class="seal-icon-img" />
              <span v-else class="seal-icon-placeholder">📜</span>
            </div>
          </div>
        </div>

        <!-- Right: Text Content -->
        <div class="parchment-info-zone">
          <div class="parchment-game-title" v-if="form.gameName">
            ⚔️ {{ form.gameName }}
          </div>

          <div class="parchment-header-row">
            <div class="parchment-title" v-html="form.title || '成就名称'"></div>
            <div class="parchment-xp-shield" v-if="form.achievementValue">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(64,35,15,0.08)"/>
              </svg>
              <span class="xp-text">{{ form.achievementValue }}</span>
            </div>
          </div>

          <div class="parchment-desc" v-html="form.description || '解锁原因描述...'"></div>

          <!-- Bottom Ribbon info -->
          <div class="parchment-footer">
            <div class="parchment-divider"></div>
            <div class="parchment-meta-row">
              <span class="parchment-recipient" v-if="form.recipient">冒险者: {{ form.recipient }}</span>
              <span class="parchment-date" v-if="form.date">纪元: {{ form.date }}</span>
            </div>
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
  borderColor: form.value.borderColor || '#845c34',
  borderWidth: form.value.borderColor ? `${form.value.borderWidth || 2}px` : '2px',
}))

function forceShimmerPos() {}

defineExpose({ cardRef, isExporting, forceShimmerPos })
</script>

<style scoped>
.card-wrapper-parchment {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 20px 0;
  filter: drop-shadow(0 8px 25px rgba(44, 27, 12, 0.25));
}

.parchment-card {
  position: relative;
  width: 580px;
  min-height: 160px;
  background-color: #f1e4c3;
  /* Parchment background pattern */
  background-image: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.15), rgba(44, 27, 12, 0.05));
  border-style: double;
  border-color: #845c34;
  box-shadow: 
    inset 0 0 30px rgba(44, 27, 12, 0.2),
    0 4px 15px rgba(0,0,0,0.15);
  border-radius: 6px;
  padding: 16px;
  overflow: hidden;
  font-family: Georgia, 'Times New Roman', serif;
  display: flex;
  flex-direction: column;
}

/* Paper grain/vignette overlay */
.parchment-vignette {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle, transparent 50%, rgba(44, 27, 12, 0.15) 100%),
    url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.035'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 1;
}

.parchment-body {
  display: flex;
  gap: 20px;
  align-items: center;
  flex: 1;
  z-index: 2;
}

/* Wax Seal / Emblem Frame */
.parchment-emblem-zone {
  flex-shrink: 0;
}

.wax-seal-outer {
  width: 82px;
  height: 82px;
  background: #a32626; /* Wax red */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 4px 10px rgba(0,0,0,0.3),
    inset 0 2px 4px rgba(255,255,255,0.2),
    inset 0 -4px 6px rgba(0,0,0,0.4);
  /* Uneven organic wax seal edge */
  border: 3px solid #8e2020;
  transform: rotate(-3deg);
}

.wax-seal-inner {
  width: 66px;
  height: 66px;
  background: #911e1e;
  border-radius: 50%;
  border: 2px dashed rgba(255, 235, 150, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 2px 5px rgba(0,0,0,0.5);
  overflow: hidden;
}

.seal-icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: sepia(0.2) contrast(1.1);
}

.seal-icon-placeholder {
  font-size: 32px;
}

/* Text info column */
.parchment-info-zone {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  color: #3d2314;
}

.parchment-game-title {
  font-size: 11px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: #7a512c;
  margin-bottom: 2px;
}

.parchment-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.parchment-title {
  font-size: 19px;
  font-weight: bold;
  color: #4c2c19;
  letter-spacing: 0.5px;
}

.parchment-xp-shield {
  position: relative;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #845c34;
  flex-shrink: 0;
}

.xp-text {
  position: absolute;
  font-size: 9px;
  font-weight: bold;
  color: #4c2c19;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.parchment-desc {
  font-size: 13.5px;
  line-height: 1.4;
  margin-top: 5px;
  font-style: italic;
  color: #513625;
}

/* Parchment Footer */
.parchment-footer {
  margin-top: 8px;
}

.parchment-divider {
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(132, 92, 52, 0.4) 20%, rgba(132, 92, 52, 0.4) 80%, transparent);
  margin-bottom: 6px;
}

.parchment-meta-row {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #7a512c;
  font-weight: bold;
}

.parchment-recipient {
  opacity: 0.95;
}

.parchment-date {
  opacity: 0.85;
}
</style>
