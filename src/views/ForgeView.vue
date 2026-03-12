<template>
  <div class="forge-view">
    <!-- Editor (left) -->
    <aside class="editor-col">
      <EditorPanel />
    </aside>

    <!-- Preview (center) -->
    <main class="preview-col">
      <div class="preview-area">
        <div class="preview-label">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          实时预览
        </div>
        <div class="card-container">
          <AchievementCard ref="cardRef" />
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

    <!-- History (right) -->
    <Transition name="history-slide">
      <aside v-if="showHistory" class="history-col">
        <HistoryPanel />
      </aside>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAchievementStore } from '../stores/achievement.js'
import { storeToRefs } from 'pinia'
import EditorPanel from '../components/EditorPanel.vue'
import AchievementCard from '../components/AchievementCard.vue'
import HistoryPanel from '../components/HistoryPanel.vue'

const store = useAchievementStore()
const { form } = storeToRefs(store)

const props = defineProps(['showHistory']) // Removed unnecessary cardRef prop
const cardRef = ref(null) // Added ref for AchievementCard link

const canExport = computed(() =>
  !!(form.value.title?.trim() && form.value.recipient?.trim() && form.value.description?.trim())
)

defineExpose({ canExport, cardRef })
</script>

<style scoped>
.forge-view {
  display: flex;
  flex: 1;
  overflow: hidden;
  height: 100%;
}

.editor-col {
  width: 300px;
  flex-shrink: 0;
  height: 100%;
  overflow: hidden;
}

.preview-col {
  flex: 1;
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.history-col {
  width: 260px;
  flex-shrink: 0;
  height: 100%;
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

/* Transitions */
.history-slide-enter-active, .history-slide-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.history-slide-enter-from, .history-slide-leave-to {
  width: 0 !important;
  opacity: 0;
}

@media (max-width: 900px) {
  .forge-view {
    flex-direction: column;
    height: auto;
    overflow: auto;
  }
  .editor-col {
    width: 100%;
    height: auto;
    overflow: visible;
  }
  .preview-col {
    height: auto;
  }
  .history-col {
    width: 100%;
    height: auto;
    min-height: 200px;
  }
}
</style>
