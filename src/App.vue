<template>
  <div class="app-layout">
    <!-- Header -->
    <header class="app-header">
      <div class="header-brand">
        <div class="header-logo">⚔️</div>
        <div class="header-title-group">
          <h1 class="header-title">
            <span class="golden-text">成就卡片锻造炉</span>
          </h1>
          <span class="header-subtitle">TRPG Achievement Forge</span>
        </div>
      </div>

      <div class="header-actions">
        <!-- Import JSON -->
        <button class="btn-ghost" @click="triggerImport" title="从 JSON 文件恢复成就">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          导入 JSON
        </button>
        <input ref="importInputRef" type="file" accept=".json" style="display:none" @change="handleImport" />

        <!-- Export JSON -->
        <button class="btn-ghost" @click="handleExportJSON" title="将当前成就导出为 JSON">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          导出 JSON
        </button>

        <!-- Reset -->
        <button class="btn-ghost" @click="handleReset" title="重置表单">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="1 4 1 10 7 10"/>
            <path d="M3.51 15a9 9 0 1 0 .49-4.87"/>
          </svg>
          重置
        </button>

        <!-- Save & Export PNG -->
        <button
          class="btn-gold"
          @click="handleExportPNG"
          :disabled="isExporting || !canExport"
          id="export-png-btn"
        >
          <svg v-if="!isExporting" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <svg v-else class="spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
          {{ isExporting ? '导出中…' : '保存并导出 PNG' }}
        </button>

        <!-- Toggle History -->
        <button
          class="btn-ghost history-toggle-btn"
          @click="showHistory = !showHistory"
          :class="{ active: showHistory }"
          title="显示/隐藏历史记录"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
          </svg>
          历史
        </button>
      </div>
    </header>

    <!-- Validation Toast -->
    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        <span>{{ toast.message }}</span>
      </div>
    </Transition>

    <!-- Main content -->
    <div class="app-body" :class="{ 'history-open': showHistory }">
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
            卡片已就绪，点击右上角"保存并导出 PNG"按钮导出
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { toPng } from 'html-to-image'
import { useAchievementStore } from './stores/achievement.js'
import { storeToRefs } from 'pinia'
import EditorPanel from './components/EditorPanel.vue'
import AchievementCard from './components/AchievementCard.vue'
import HistoryPanel from './components/HistoryPanel.vue'

const store = useAchievementStore()
const { form } = storeToRefs(store)

const cardRef = ref(null)
const importInputRef = ref(null)
const isExporting = ref(false)
const showHistory = ref(false)

const toast = reactive({ show: false, message: '', type: 'info' })

let toastTimer = null
function showToast(message, type = 'info', duration = 3000) {
  clearTimeout(toastTimer)
  toast.message = message
  toast.type = type
  toast.show = true
  toastTimer = setTimeout(() => { toast.show = false }, duration)
}

// Validation: must have title, recipient, description
const canExport = computed(() =>
  !!(form.value.title?.trim() && form.value.recipient?.trim() && form.value.description?.trim())
)

onMounted(() => {
  store.loadHistory()
})

// PNG export
async function handleExportPNG() {
  if (!canExport.value) {
    showToast('请先填写成就名称、获得者和描述', 'error')
    return
  }
  if (isExporting.value) return
  isExporting.value = true

  try {
    // Save to history first
    await store.saveToHistory()

    const cardEl = cardRef.value?.cardRef
    if (!cardEl) throw new Error('找不到卡片元素')

    // Wait a tick for any DOM updates
    await new Promise(r => setTimeout(r, 100))

    const dataUrl = await toPng(cardEl, {
      quality: 1.0,
      pixelRatio: 3,
      cacheBust: true,
      style: {
        fontFamily: '"LXGW WenKai", "Inter", sans-serif',
      },
    })

    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `成就卡-${form.value.title || 'untitled'}-${Date.now()}.png`
    a.click()

    showToast('🎉 导出成功！同时已保存到历史记录', 'success')
  } catch (err) {
    console.error('Export error:', err)
    showToast('导出失败：' + err.message, 'error')
  } finally {
    isExporting.value = false
  }
}

// JSON export
function handleExportJSON() {
  if (!canExport.value) {
    showToast('请先填写成就名称、获得者和描述', 'error')
    return
  }
  store.exportJSON()
  showToast('📄 JSON 文件已导出', 'success')
}

// JSON import
function triggerImport() {
  importInputRef.value?.click()
}

async function handleImport(e) {
  const file = e.target.files[0]
  if (!file) return
  try {
    await store.importJSON(file)
    showToast('✅ 成就数据已成功导入', 'success')
  } catch (err) {
    showToast('导入失败：' + err.message, 'error')
  }
  e.target.value = ''
}

// Reset
function handleReset() {
  if (window.confirm('确定要重置表单吗？当前编辑的内容将会清空。')) {
    store.resetForm()
    showToast('表单已重置', 'info')
  }
}
</script>

<style scoped>
/* Layout */
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--bg-deep);
}

/* Header */
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 64px;
  background: rgba(12,12,16,0.95);
  border-bottom: 1px solid var(--border-subtle);
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;
  gap: 16px;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.header-logo {
  font-size: 24px;
  line-height: 1;
}

.header-title-group {
  display: flex;
  flex-direction: column;
}

.header-title {
  font-size: 18px;
  font-weight: 800;
  margin: 0;
  line-height: 1.2;
  letter-spacing: 1px;
}

.header-subtitle {
  font-size: 10px;
  color: var(--text-muted);
  letter-spacing: 2px;
  text-transform: uppercase;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.history-toggle-btn.active {
  border-color: rgba(191,149,63,0.5);
  color: var(--text-primary);
  background: rgba(191,149,63,0.08);
}

/* Body */
.app-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  height: calc(100vh - 64px);
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

/* Toast */
.toast {
  position: fixed;
  top: 76px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 999;
  padding: 11px 22px;
  border-radius: 24px;
  font-size: 13px;
  font-weight: 500;
  backdrop-filter: blur(12px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.4);
  pointer-events: none;
  white-space: nowrap;
}
.toast.info {
  background: rgba(30,30,50,0.95);
  color: var(--text-primary);
  border: 1px solid var(--border-subtle);
}
.toast.success {
  background: rgba(30,50,30,0.95);
  color: #a0e0a0;
  border: 1px solid rgba(80,160,80,0.4);
}
.toast.error {
  background: rgba(50,20,20,0.95);
  color: #e09090;
  border: 1px solid rgba(224,96,96,0.3);
}

/* Transitions */
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(-50%) translateY(-12px); }

.history-slide-enter-active, .history-slide-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.history-slide-enter-from, .history-slide-leave-to {
  width: 0 !important;
  opacity: 0;
}

/* Spinner */
.spin {
  animation: spin 1s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 900px) {
  .app-body {
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
  .app-header {
    flex-direction: column;
    height: auto;
    padding: 12px 16px;
    gap: 10px;
  }
  .header-actions {
    justify-content: center;
  }
}
</style>
