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

      <!-- Main Navigation -->
      <nav class="app-nav">
        <router-link to="/" class="nav-link" active-class="active">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          成就锻造
        </router-link>
        <router-link to="/showcase" class="nav-link" active-class="active">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
          成就展馆
        </router-link>
      </nav>

      <div class="header-actions">
        <!-- Route-specific actions (mostly for Forge) -->
        <template v-if="$route.name === 'forge'">
          <div class="btn-group">
            <button class="btn-ghost btn-sm" @click="triggerImport" title="导入 JSON 或带数据的图片">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              导入
            </button>
            <button class="btn-ghost btn-sm" @click="handleExportJSON" title="导出成就数据 JSON">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              导出 JSON
            </button>
          </div>

          <div class="btn-group">
            <button class="btn-ghost btn-sm" @click="handleReset" title="重置并新建">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.87"/></svg>
            </button>
            
            <!-- Conditional Save Buttons -->
            <template v-if="selectedHistoryId">
              <button class="btn-ghost btn-sm" @click="handleUpdate" :disabled="!isForgeValid" title="覆盖当前编辑的记录">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                覆盖保存
              </button>
              <button class="btn-ghost btn-sm" @click="handleSaveNew" :disabled="!isForgeValid" title="作为新成就另存一份">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 1-2 2v14a2 2 0 0 1 2 2h14a2 2 0 0 1 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                 另存为
              </button>
            </template>
            <button v-else class="btn-ghost btn-sm" @click="handleSaveNew" :disabled="!isForgeValid" title="保存到本地记录">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
              保存卡片
            </button>

            <button class="btn-ghost btn-sm history-toggle-btn" @click="showHistory = !showHistory" :class="{ active: showHistory }" title="本地历史记录">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              历史
            </button>
          </div>

          <div class="btn-group">
            <button class="btn-gold btn-sm" @click="handleExportPNG" :disabled="isExporting || isExportingGIF || !isForgeValid">
              <svg v-if="!isExporting" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <svg v-else class="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              PNG
            </button>
            <button class="btn-gold btn-sm" @click="handleExportGIF" :disabled="isExporting || isExportingGIF || !isForgeValid" style="background: linear-gradient(135deg, #b38728, #fbf5b7, #b38728);">
              <svg v-if="!isExportingGIF" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              <svg v-else class="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              GIF
            </button>
          </div>
          <input ref="importInputRef" type="file" accept=".json,.png,.gif" style="display:none" @change="handleImport" />
        </template>
        
        <template v-else-if="$route.name === 'showcase'">
           <button class="btn-ghost" @click="triggerImport" title="导入成就文件到记录馆">
             <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
             导入本地记录
           </button>
           <input ref="importInputRef" type="file" accept=".json,.png,.gif" style="display:none" @change="handleImport" />
        </template>
      </div>
    </header>

    <!-- Global Toast -->
    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        <span>{{ toast.message }}</span>
      </div>
    </Transition>

    <!-- Route Views -->
    <div class="app-body">
      <router-view v-slot="{ Component }">
        <component 
          :is="Component" 
          ref="viewRef" 
          :showHistory="showHistory"
        />
      </router-view>
    </div>

    <!-- Author Info Modal (Shared) -->
    <Transition name="modal-fade">
      <div v-if="showAuthorModal" class="modal-overlay" @click.self="showAuthorModal = false">
        <div class="modal-box">
          <div class="modal-header">
            <h3>📖 关于生成器</h3>
            <button class="modal-close-btn" @click="showAuthorModal = false">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal-body">
            <ul class="author-credits">
              <!-- ... existing credits ... -->
              <li><span class="credit-label">制作者</span><span class="credit-value">不咕鸟（哈基米德）</span></li>
              <li><span class="credit-label">AI辅助</span><span class="credit-value">Antigravity Gemini</span></li>
              <li><span class="credit-label">成都秘密基地约团</span><a href="https://nogubird.top/schedule" target="_blank" class="credit-link">nogubird.top/schedule</a></li>
              <li><span class="credit-label">成都秘密基地企鹅</span><span class="credit-value select-all">691707475</span></li>
              <li><span class="credit-label">为作者加油</span><a href="https://ifdian.net/a/nogubird" target="_blank" class="credit-link">ifdian.net/a/nogubird ⚡</a></li>
            </ul>
            <div class="modal-footer"><p>愿骰子女神永远向你微笑 🎲</p></div>
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
import { embedMetadataToImage, extractMetadataFromImage } from './utils/metadata.js'

const store = useAchievementStore()
const { form, selectedHistoryId } = storeToRefs(store)

const viewRef = ref(null)
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

const isForgeValid = computed(() => 
  !!(form.value.title?.trim() && form.value.recipient?.trim() && form.value.description?.trim())
)

onMounted(() => {
  store.loadHistory()
})

async function handleUpdate() {
  if (!isForgeValid.value) return
  await store.updateRecord()
  showToast('✅ 记录已覆盖更新', 'success')
}

async function handleSaveNew() {
  if (!isForgeValid.value) return
  await store.saveAsNewRecord()
  showToast('✅ 已保存到本地记录', 'success')
  showHistory.value = true
}

async function handleExportPNG() {
  if (!isForgeValid.value) return
  isExporting.value = true
  try {
    const record = store.buildRecord()
    const cardComp = viewRef.value?.cardRef
    const cardEl = cardComp?.cardRef
    if (!cardEl) throw new Error('找不到卡片元素')
    await new Promise(r => setTimeout(r, 100))
    const dataUrl = await toPng(cardEl, { quality:1.0, pixelRatio:3, cacheBust:true })
    const resultBlob = await embedMetadataToImage(dataUrl, record, 'image/png')
    const url = URL.createObjectURL(resultBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `成就卡-${form.value.title || 'untitled'}-${Date.now()}.png`
    a.click()
    showToast('🎉 导出成功！PNG 已嵌入数据', 'success')
  } catch (err) {
    showToast('导出失败：' + err.message, 'error')
  } finally { isExporting.value = false }
}

async function handleExportGIF() {
  if (!isForgeValid.value) return
  isExportingGIF.value = true
  try {
    const record = store.buildRecord()
    const cardComp = viewRef.value?.cardRef
    const cardEl = cardComp?.cardRef
    if (!cardEl || !cardComp?.forceShimmerPos) throw new Error('找不到卡片元素')
    const frames = []
    const frameCount = 15
    for (let i = 0; i < frameCount; i++) {
      cardComp.forceShimmerPos(i * (200 / frameCount))
      await new Promise(r => setTimeout(r, 10))
      frames.push(await toPng(cardEl, { quality:1.0, pixelRatio:2, cacheBust:true }))
    }
    cardComp.forceShimmerPos(null)
    gifshot.createGIF({ images: frames, gifWidth: cardEl.offsetWidth * 2, gifHeight: cardEl.offsetHeight * 2, interval: 0.1 }, async (obj) => {
      if(!obj.error) {
        const resultBlob = await embedMetadataToImage(obj.image, record, 'image/gif')
        const url = URL.createObjectURL(resultBlob); const a = document.createElement('a')
        a.href = url; a.download = `成就卡-${form.value.title}-${Date.now()}.gif`; a.click()
        showToast('🎉 GIF 导出成功！', 'success')
      }
      isExportingGIF.value = false
    })
  } catch (err) { 
    showToast('GIF失败：' + err.message, 'error')
    isExportingGIF.value = false
  }
}

function handleExportJSON() { store.exportJSON(); showToast('📄 JSON 已导出', 'success') }
function triggerImport() { importInputRef.value?.click() }

async function handleImport(e) {
  const file = e.target.files[0]
  if (!file) return
  try {
    if (file.type === 'application/json' || file.name.endsWith('.json')) {
      await store.importJSON(file)
    } else {
      const data = await extractMetadataFromImage(file)
      if (data && data.title !== undefined) {
        store.loadRecord(data)
        await store.saveToHistory() // Auto-save imported to history
      } else throw new Error('无效成就数据')
    }
    showToast('✅ 导入成功', 'success')
  } catch (err) { showToast('导入失败：' + err.message, 'error') }
  e.target.value = ''
}

function handleReset() { if (confirm('重置表单？')) store.resetForm() }
</script>

<style>
/* Global Layout stuff re-used from previous App.vue */
.app-layout { display: flex; flex-direction: column; min-height: 100vh; background: var(--bg-deep); }
.app-header { 
  display: flex; align-items: center; justify-content: space-between; 
  padding: 0 24px; height: 64px; background: rgba(12,12,16,0.98); 
  border-bottom: 1px solid var(--border-subtle); backdrop-filter: blur(12px); 
  position: sticky; top: 0; z-index: 100; gap: 20px;
}
.header-brand { flex: 0 0 auto; }
.app-nav { flex: 1; display: flex; gap: 24px; align-items: center; justify-content: center; }
.header-actions { flex: 0 0 auto; display: flex; align-items: center; gap: 12px; }

.btn-group {
  display: flex;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-subtle);
}
.btn-group .btn-ghost, .btn-group .btn-gold {
  border-radius: 0;
  border: none;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
}
.btn-group button:last-child {
  border-right: none;
}

.nav-link { 
  display: flex; align-items: center; gap: 8px; color: var(--text-muted); 
  text-decoration: none; font-size: 14px; font-weight: 600; 
  transition: all 0.2s; padding: 6px 4px; border-bottom: 2px solid transparent;
}
.nav-link:hover { color: var(--gold-2); }
.nav-link.active { color: var(--gold-2); border-bottom-color: var(--gold-2); }

.app-body { flex: 1; display: flex; flex-direction: column; overflow: hidden; }

/* Existing button/toast/modal styles from old App.vue ... */
.author-info-btn { background: transparent; border: 1px solid rgba(191,149,63,0.3); color: var(--gold-1); border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; }
.author-info-btn:hover { background: rgba(191,149,63,0.15); border-color: var(--gold-1); transform: scale(1.05); }

.toast { position: fixed; top: 76px; left: 50%; transform: translateX(-50%); z-index: 999; padding: 11px 22px; border-radius: 24px; font-size: 13px; font-weight: 500; backdrop-filter: blur(12px); box-shadow: 0 4px 20px rgba(0,0,0,0.4); pointer-events: none; }
.toast.success { background: rgba(30,50,30,0.95); color: #a0e0a0; border: 1px solid rgba(80,160,80,0.4); }
.toast.error { background: rgba(50,20,20,0.95); color: #e09090; border: 1px solid rgba(224,96,96,0.3); }

.modal-overlay { position: fixed; inset: 0; background: rgba(8, 8, 12, 0.85); backdrop-filter: blur(8px); z-index: 1000; display: flex; align-items: center; justify-content: center; }
.modal-box { background: var(--bg-card); border: 1px solid var(--border-gold); border-radius: 12px; width: 100%; max-width: 420px; overflow: hidden; }
.modal-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid var(--border-subtle); background: rgba(191,149,63,0.05); }
.modal-header h3 { margin: 0; font-size: 16px; color: var(--gold-2); font-family: 'LXGW WenKai', serif; }
.modal-close-btn { background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; transition: all 0.2s; }
.modal-body { padding: 24px 20px; }
.author-credits { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 16px; }
.credit-label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; }
.credit-value { font-size: 15px; color: var(--text-primary); }
.credit-link { font-size: 15px; color: var(--gold-1); text-decoration: none; }
.modal-footer { margin-top: 20px; text-align: center; font-size: 13px; color: var(--text-muted); }

.btn-gold { 
  background: linear-gradient(135deg, #bf953f, #fcf6ba, #b38728, #fcf6ba, #bf953f);
  background-size: 200% auto; border: none; color: #000; font-weight: 700; padding: 0 16px; 
  height: 32px; border-radius: 6px; cursor: pointer; transition: all 0.3s;
  display: flex; align-items: center; gap: 6px; font-size: 13px;
}
.btn-gold:hover:not(:disabled) { background-position: right center; transform: translateY(-1px); box-shadow: 0 4px 15px rgba(191,149,63,0.4); }
.btn-gold:disabled { opacity: 0.5; cursor: not-allowed; filter: grayscale(1); }

.btn-ghost { background: transparent; border: 1px solid var(--border-subtle); color: var(--text-secondary); padding: 0 14px; height: 32px; border-radius: 6px; display: flex; align-items: center; gap: 6px; font-size: 13px; cursor: pointer; transition: 0.2s; }
.btn-ghost:hover:not(:disabled) { border-color: var(--gold-2); color: var(--gold-2); background: rgba(191,149,63,0.05); }
.btn-ghost:disabled { opacity: 0.3; cursor: not-allowed; }

.btn-sm { padding: 0 10px; height: 30px; font-size: 12px; }

.btn-danger { background: rgba(224,96,96,0.1); border: 1px solid rgba(224,96,96,0.3); color: #e09090; padding: 0 12px; height: 30px; border-radius: 6px; display: flex; align-items: center; gap: 6px; font-size: 12px; cursor: pointer; transition: 0.2s; }
.btn-danger:hover { background: rgba(224,96,96,0.2); border-color: #e09090; }

.spin { animation: spin 1s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

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

.modal-fade-enter-active, .modal-fade-leave-active { transition: all 0.25s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-active .modal-box, .modal-fade-leave-active .modal-box { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.modal-fade-enter-from .modal-box, .modal-fade-leave-to .modal-box { transform: scale(0.9) translateY(20px); opacity: 0; }

@media (max-width: 900px) {
  .app-header { height: auto; flex-direction: column; padding: 15px; }
  .app-nav { margin: 10px 0; }
  .header-actions { justify-content: center; }
}
</style>
