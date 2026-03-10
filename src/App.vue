<template>
  <div class="app-layout">
    <!-- Header -->
    <header class="app-header">
      <div class="header-brand">
        <div class="header-logo">⚔️</div>
        <div class="header-title-group">
          <h1 class="header-title">
            <span class="golden-text">成都秘密基地TRPG俱乐部</span>
          </h1>
          <span class="header-subtitle">成就卡生成器</span>
        </div>
        <!-- Author Info Button -->
        <button class="author-info-btn" @click="showAuthorModal = true" title="关于工具与作者">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        </button>
      </div>

      <div class="header-actions">
        <!-- Import JSON / PNG -->
        <button class="btn-ghost" @click="triggerImport" title="从 JSON 或带数据的 PNG 文件恢复成就">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          导入数据/图片
        </button>
        <input ref="importInputRef" type="file" accept=".json,.png,.gif" style="display:none" @change="handleImport" />

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

        <!-- Save to History -->
        <button
          class="btn-ghost"
          @click="handleSave"
          :disabled="!canExport"
          title="将当前卡片保存到本地记录"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
          保存卡片
        </button>

        <!-- Export PNG -->
        <button
          class="btn-gold"
          @click="handleExportPNG"
          :disabled="isExporting || isExportingGIF || !canExport"
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
          {{ isExporting ? '生成中…' : '导出 PNG' }}
        </button>

        <!-- Export GIF -->
        <button
          class="btn-gold"
          @click="handleExportGIF"
          :disabled="isExporting || isExportingGIF || !canExport"
          id="export-gif-btn"
          style="background: linear-gradient(135deg, #b38728, #fbf5b7, #b38728);"
        >
          <svg v-if="!isExportingGIF" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <svg v-else class="spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
          {{ isExportingGIF ? '生成中…' : '导出动态 GIF' }}
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

    <!-- Author Info Modal -->
    <Transition name="modal-fade">
      <div v-if="showAuthorModal" class="modal-overlay" @click.self="showAuthorModal = false">
        <div class="modal-box">
          <div class="modal-header">
            <h3>📖 关于生成器</h3>
            <button class="modal-close-btn" @click="showAuthorModal = false">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <ul class="author-credits">
              <li>
                <span class="credit-label">制作者</span>
                <span class="credit-value">不咕鸟（哈基米德）</span>
              </li>
              <li>
                <span class="credit-label">AI辅助</span>
                <span class="credit-value">Antigravity Gemini</span>
              </li>
              <li>
                <span class="credit-label">成都秘密基地约团</span>
                <a href="https://nogubird.top/schedule" target="_blank" rel="noopener noreferrer" class="credit-link">nogubird.top/schedule</a>
              </li>
              <li>
                <span class="credit-label">成都秘密基地企鹅</span>
                <span class="credit-value select-all">691707475</span>
              </li>
              <li>
                <span class="credit-label">为作者加油</span>
                <a href="https://ifdian.net/a/nogubird" target="_blank" rel="noopener noreferrer" class="credit-link">ifdian.net/a/nogubird ⚡</a>
              </li>
            </ul>
            <div class="modal-footer">
              <p>愿骰子女神永远向你微笑 🎲</p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { toPng } from 'html-to-image'
import gifshot from 'gifshot'
import { useAchievementStore } from './stores/achievement.js'
import { storeToRefs } from 'pinia'
import EditorPanel from './components/EditorPanel.vue'
import AchievementCard from './components/AchievementCard.vue'
import HistoryPanel from './components/HistoryPanel.vue'
import { embedMetadataToImage, extractMetadataFromImage } from './utils/metadata.js'

const store = useAchievementStore()
const { form } = storeToRefs(store)

const cardRef = ref(null)
const importInputRef = ref(null)
const isExporting = ref(false)
const isExportingGIF = ref(false)
const showHistory = ref(false)
const showAuthorModal = ref(false)

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

// Save to local history
async function handleSave() {
  if (!canExport.value) {
    showToast('请先填写必填信息', 'error')
    return
  }
  await store.saveToHistory()
  showToast('✅ 卡片已保存到本地历史记录', 'success')
  showHistory.value = true
}

// PNG export
async function handleExportPNG() {
  if (!canExport.value) {
    showToast('请先填写成就名称、获得者和描述', 'error')
    return
  }
  if (isExporting.value) return
  isExporting.value = true

  try {
    const record = store.buildRecord()

    const cardEl = cardRef.value?.cardRef
    if (!cardEl) throw new Error('找不到卡片元素')

    // Wait a tick for any DOM updates (allow class is-exporting to apply)
    await new Promise(r => requestAnimationFrame(r))
    await new Promise(r => setTimeout(r, 100))

    const dataUrl = await toPng(cardEl, {
      quality: 1.0,
      pixelRatio: 3,
      cacheBust: true,
      style: {
        fontFamily: '"LXGW WenKai", "Inter", sans-serif',
      },
      skipFonts: true, // Speeds up rendering if fonts are pre-loaded
    })

    // Embed metadata into the Data URL to create a blob
    const resultBlob = await embedMetadataToImage(dataUrl, record, 'image/png')
    const url = URL.createObjectURL(resultBlob)

    const a = document.createElement('a')
    a.href = url
    a.download = `成就卡-${form.value.title || 'untitled'}-${Date.now()}.png`
    a.click()

    setTimeout(() => URL.revokeObjectURL(url), 1000)

    showToast('🎉 导出成功！PNG 已嵌入数据，可随时拖回恢复', 'success')
  } catch (err) {
    console.error('Export error:', err)
    showToast('导出失败：' + err.message, 'error')
  } finally {
    isExporting.value = false
  }
}

// GIF export
async function handleExportGIF() {
  if (!canExport.value) {
    showToast('请先填写成就名称、获得者和描述', 'error')
    return
  }
  if (isExportingGIF.value) return
  isExportingGIF.value = true

  try {
    const record = store.buildRecord()
    const cardEl = cardRef.value?.cardRef
    const cardComp = cardRef.value
    if (!cardEl || !cardComp.forceShimmerPos) throw new Error('找不到卡片元素')

    // Prepare arrays
    const frames = []
    const frameCount = 15 // Number of frames
    const step = 200 / frameCount // Background position goes up to 200%

    // Wait a tick for any DOM updates
    await new Promise(r => requestAnimationFrame(r))
    await new Promise(r => setTimeout(r, 100))

    // Capture each frame
    for (let i = 0; i < frameCount; i++) {
      const pos = i * step
      cardComp.forceShimmerPos(pos)
      // Small wait for DOM reflow
      await new Promise(r => setTimeout(r, 10))
      const dataUrl = await toPng(cardEl, {
        quality: 1.0,
        pixelRatio: 2, // Slightly lower ratio for GIF to keep size manageable
        cacheBust: true,
        style: {
          fontFamily: '"LXGW WenKai", "Inter", sans-serif',
          animation: 'none', // Override standard animation
        },
        skipFonts: true,
      })
      frames.push(dataUrl)
    }

    // Reset position
    cardComp.forceShimmerPos(null)

    // Generate GIF
    await new Promise((resolve, reject) => {
      gifshot.createGIF({
        images: frames,
        gifWidth: cardEl.offsetWidth * 2,
        gifHeight: cardEl.offsetHeight * 2,
        interval: 0.1, // 100ms per frame
        numWorkers: 2,
      }, async function(obj) {
        if(!obj.error) {
          try {
             const resultBlob = await embedMetadataToImage(obj.image, record, 'image/gif')
             const url = URL.createObjectURL(resultBlob)

             const a = document.createElement('a')
             a.href = url
             a.download = `成就卡-${form.value.title || 'untitled'}-${Date.now()}.gif`
             a.click()

             setTimeout(() => URL.revokeObjectURL(url), 1000)
             showToast('🎉 GIF 导出成功！已嵌入数据', 'success')
             resolve()
          } catch(e) { reject(e) }
        } else {
          reject(new Error('GIF 生成失败'))
        }
      })
    })

  } catch (err) {
    console.error('Export error:', err)
    showToast('导出 GIF 失败：' + err.message, 'error')
    // Reset position on error
    cardRef.value?.forceShimmerPos?.(null)
  } finally {
    isExportingGIF.value = false
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

// JSON / PNG import
function triggerImport() {
  importInputRef.value?.click()
}

async function handleImport(e) {
  const file = e.target.files[0]
  if (!file) return
  try {
    if (file.type === 'application/json' || file.name.endsWith('.json')) {
      await store.importJSON(file)
      showToast('✅ 成就数据已成功导入', 'success')
    } else if (file.type === 'image/png' || file.name.endsWith('.png') || file.type === 'image/gif' || file.name.endsWith('.gif')) {
      const data = await extractMetadataFromImage(file)
      if (data && data.title !== undefined) {
        store.loadRecord(data)
        const typeStr = file.name.endsWith('.gif') ? 'GIF' : 'PNG'
        showToast(`🖼️ 成功从 ${typeStr} 图像中恢复数据！`, 'success')
      } else {
        throw new Error('此图像不包含有效的成就数据')
      }
    } else {
      throw new Error('不支持的文件格式')
    }
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

/* Author Info Modal */
.author-info-btn {
  background: transparent;
  border: 1px solid rgba(191,149,63,0.3);
  color: var(--gold-1);
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-left: 8px;
  transition: all 0.2s;
}
.author-info-btn:hover {
  background: rgba(191,149,63,0.15);
  border-color: var(--gold-1);
  transform: scale(1.05);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(8, 8, 12, 0.85);
  backdrop-filter: blur(8px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-box {
  background: var(--bg-card);
  border: 1px solid var(--border-gold);
  border-radius: 12px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.6), 0 0 20px rgba(191,149,63,0.1);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-subtle);
  background: rgba(191,149,63,0.05);
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
  color: var(--gold-2);
  font-weight: 700;
  font-family: 'LXGW WenKai', serif;
}

.modal-close-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  transition: all 0.2s;
}
.modal-close-btn:hover {
  color: var(--text-primary);
  background: rgba(255,255,255,0.1);
}

.modal-body {
  padding: 24px 20px;
}

.author-credits {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.author-credits li {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.credit-label {
  font-size: 11px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

.credit-value {
  font-size: 15px;
  color: var(--text-primary);
  font-weight: 500;
}

.credit-link {
  font-size: 15px;
  color: var(--gold-1);
  text-decoration: none;
  font-weight: 600;
  transition: opacity 0.2s;
  display: inline-block;
}
.credit-link:hover {
  opacity: 0.8;
  text-decoration: underline;
}

.select-all {
  user-select: all;
}

.modal-footer {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px dashed var(--border-subtle);
  text-align: center;
}

.modal-footer p {
  margin: 0;
  color: var(--gold-3);
  font-size: 12px;
  font-family: 'LXGW WenKai', serif;
}

.modal-fade-enter-active, .modal-fade-leave-active {
  transition: opacity 0.3s ease;
}
.modal-fade-enter-from, .modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-active .modal-box, .modal-fade-leave-active .modal-box {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.modal-fade-enter-from .modal-box, .modal-fade-leave-to .modal-box {
  transform: scale(0.95) translateY(10px);
}
</style>
