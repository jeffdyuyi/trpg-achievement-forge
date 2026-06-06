<template>
  <div class="forge-view">
    <!-- Main Workspace (Editor + Preview side by side) -->
    <div class="forge-workspace">
      <!-- Editor (left) -->
      <aside class="editor-col">
        <EditorPanel />
      </aside>

      <!-- Preview (right / center) -->
      <main class="preview-col">
        <div class="preview-area">
          <div class="preview-label">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            实时预览
          </div>
          <div class="card-container" ref="containerRef">
            <div class="card-scaler" :style="scalerStyle">
              <component :is="activeCardComponent" ref="cardRef" />
            </div>
          </div>

          <!-- Validation hint -->
          <div v-if="!canExport" class="validation-hint">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            请填写成就名称、获得者和描述（必填项）后方可导出
          </div>

          <div v-else class="export-hint">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            卡片已就绪，导出的资源会自动带上历史数据，也可点击"保存卡片"记录在本地。
          </div>
        </div>
      </main>
    </div>

    <!-- History Panel at the Bottom -->
    <Transition name="history-slide-up">
      <div v-if="showHistory" class="history-row-wrap">
        <HistoryPanel />
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAchievementStore } from '../stores/achievement.js'
import { storeToRefs } from 'pinia'
import EditorPanel from '../components/EditorPanel.vue'
import AchievementCard from '../components/AchievementCard.vue'
import AchievementCardXbox from '../components/AchievementCardXbox.vue'
import AchievementCardPS from '../components/AchievementCardPS.vue'
import AchievementCardSteam from '../components/AchievementCardSteam.vue'
import AchievementCardPixel from '../components/AchievementCardPixel.vue'
import AchievementCardParchment from '../components/AchievementCardParchment.vue'
import HistoryPanel from '../components/HistoryPanel.vue'

const store = useAchievementStore()
const { form } = storeToRefs(store)

const props = defineProps(['showHistory'])
const cardRef = ref(null)

// Responsive scaling logic
const containerRef = ref(null)
const containerWidth = ref(1000)
let resizeObserver = null

onMounted(() => {
  if (containerRef.value) {
    containerWidth.value = containerRef.value.getBoundingClientRect().width || 1000
    resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        containerWidth.value = entry.contentRect.width || 1000
      }
    })
    resizeObserver.observe(containerRef.value)
  }
})

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
})

const cardWidth = computed(() => {
  const style = form.value.cardStyle || 'classic'
  if (style === 'xbox' || style === 'ps' || style === 'steam' || style === 'pixel' || style === 'parchment') return 580
  const isVertical = form.value.metadata?.orientation === 'vertical'
  return isVertical ? 416 : 1016
})

const cardHeight = computed(() => {
  const style = form.value.cardStyle || 'classic'
  if (style === 'xbox') return 130
  if (style === 'ps') return 120
  if (style === 'steam' || style === 'pixel' || style === 'parchment') return 180
  const isVertical = form.value.metadata?.orientation === 'vertical'
  return isVertical ? 616 : 156
})

const scaleFactor = computed(() => {
  if (!containerWidth.value || !cardWidth.value) return 1
  return Math.min(1, containerWidth.value / cardWidth.value)
})

const scalerStyle = computed(() => {
  const s = scaleFactor.value
  if (s >= 1) return { width: '100%', display: 'flex', justifyContent: 'center' }
  return {
    transform: `scale(${s})`,
    transformOrigin: 'top center',
    width: `${cardWidth.value}px`,
    height: `${cardHeight.value}px`,
    marginBottom: `-${cardHeight.value * (1 - s)}px`,
    flexShrink: 0
  }
})

// 当前渲染的卡片组件
const activeCardComponent = computed(() => {
  if (form.value.cardStyle === 'xbox') return AchievementCardXbox
  if (form.value.cardStyle === 'ps') return AchievementCardPS
  if (form.value.cardStyle === 'steam') return AchievementCardSteam
  if (form.value.cardStyle === 'pixel') return AchievementCardPixel
  if (form.value.cardStyle === 'parchment') return AchievementCardParchment
  return AchievementCard
})

const canExport = computed(() =>
  !!(form.value.title?.trim() && form.value.recipient?.trim() && form.value.description?.trim())
)

defineExpose({ canExport, cardRef })
</script>

<style scoped>
.forge-view {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  height: 100%;
}

.forge-workspace {
  display: flex;
  flex: 1;
  overflow: hidden;
  width: 100%;
}

.editor-col {
  width: 300px;
  flex-shrink: 0;
  height: 100%;
  overflow: hidden;
  border-right: 1px solid var(--border-subtle);
}

.preview-col {
  flex: 1;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.history-row-wrap {
  height: 120px;
  flex-shrink: 0;
  width: 100%;
  overflow: hidden;
}

/* Preview area */
.preview-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 24px;
  flex: 1;
  gap: 20px;
}

.preview-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--text-muted);
}

.card-container {
  width: 100%;
  max-width: 1080px;
  display: flex;
  justify-content: center;
}

.validation-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #d4956a;
  background: rgba(212,149,106,0.08);
  border: 1px solid rgba(212,149,106,0.2);
  border-radius: 8px;
  padding: 8px 14px;
}

.export-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(191,149,63,0.7);
  background: rgba(191,149,63,0.05);
  border: 1px solid rgba(191,149,63,0.15);
  border-radius: 8px;
  padding: 8px 14px;
}

.card-scaler {
  transition: transform 0.15s ease-out;
}

/* Transitions */
.history-slide-up-enter-active, .history-slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.history-slide-up-enter-from, .history-slide-up-leave-to {
  height: 0 !important;
  opacity: 0;
}

@media (max-width: 900px) {
  .forge-view {
    height: auto;
    overflow: auto;
  }
  .forge-workspace {
    flex-direction: column;
    height: auto;
    overflow: auto;
  }
  .editor-col {
    width: 100%;
    height: auto;
    overflow: visible;
    border-right: none;
    border-bottom: 1px solid var(--border-subtle);
  }
  .preview-col {
    height: auto;
    order: -1; /* Place preview on top on mobile */
  }
  .history-row-wrap {
    height: auto;
  }
}
</style>
