<template>
  <div class="history-panel animate-slide-in">
    <!-- Hidden export rendering box -->
    <div v-if="exportingRecord" class="hidden-export-box" style="position: fixed; left: -9999px; top: -9999px; z-index: -9999;">
      <div ref="exportElRef" style="display: inline-block;">
        <component :is="getCardComponent(exportingRecord)" :form="exportingRecord" />
      </div>
    </div>

    <!-- Floating Batch Action Bar -->
    <Transition name="batch-bar-slide">
      <div v-if="isBatchMode" class="batch-action-bar">
        <div class="batch-bar-left">
          <span>已选择 <strong class="gold-text-highlight">{{ selectedIds.length }}</strong> 张卡片</span>
        </div>
        <div class="batch-bar-right">
          <button class="btn-bar-action" @click="selectedIds.length === history.length ? selectNone() : selectAll()">
            {{ selectedIds.length === history.length ? '取消全选' : '全选' }}
          </button>
          <button class="btn-bar-action action-export" :disabled="selectedIds.length === 0 || isExportingBatch" @click="exportSelected">
            <span v-if="isExportingBatch">
              <svg class="spinner" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="animation: spin 1s linear infinite; margin-right: 6px; display: inline-block;">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-dasharray="32" stroke-dashoffset="16"/>
              </svg>
              {{ progressText }}
            </span>
            <span v-else>📦 打包导出 (PNG)</span>
          </button>
          <button class="btn-bar-action action-delete" :disabled="selectedIds.length === 0" @click="deleteSelected">
            🗑️ 删除选中
          </button>
          <button class="btn-bar-action action-close" @click="toggleBatchMode">
            退出
          </button>
        </div>
      </div>
    </Transition>

    <div class="history-header">
      <h3 class="panel-title">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        历史记录
        <span class="history-count" v-if="history.length">{{ history.length }}</span>
      </h3>
      <div class="header-action-buttons">
        <button
          v-if="history.length && !isBatchMode"
          class="btn-manage"
          @click="toggleBatchMode"
        >
          批量管理
        </button>
        <button
          v-if="history.length && !isBatchMode"
          class="btn-clear-link"
          @click="confirmClear"
          title="清空所有记录"
        >
          清空
        </button>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="!history.length" class="history-empty">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity: 0.5; flex-shrink: 0;">
        <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z"/><path d="M12 8v4l2 2"/>
      </svg>
      <div class="empty-text-group">
        <p>暂无历史记录</p>
        <small>每次保存或导出卡片后会自动记录在此处</small>
      </div>
    </div>

    <!-- List -->
    <div class="history-list" v-else>
      <div
        v-for="record in history"
        :key="record.id"
        class="history-item"
        :class="{ 
          active: selectedHistoryId === record.id && !isBatchMode, 
          'is-batching': isBatchMode, 
          'is-selected': isBatchMode && selectedIds.includes(record.id) 
        }"
        @click="isBatchMode ? toggleSelectItem(record.id) : loadRecord(record)"
      >
        <!-- Checkbox on left in batch mode -->
        <div v-if="isBatchMode" class="batch-checkbox-wrap">
          <div class="batch-checkbox" :class="{ checked: selectedIds.includes(record.id) }">
            <svg v-if="selectedIds.includes(record.id)" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
        </div>

        <div class="history-item-icon">
          <img v-if="record.iconBase64" :src="record.iconBase64" class="history-icon-img" />
          <span v-else>🏆</span>
        </div>
        <div class="history-item-info">
          <div class="history-item-title">{{ record.title || '无标题' }}</div>
          <div class="history-item-sub">{{ record.recipient || '—' }}</div>
          <div class="history-item-date">{{ formatDate(record.savedAt) }}</div>
        </div>
        <button
          v-if="!isBatchMode"
          class="history-delete-btn"
          @click.stop="deleteRecord(record.id)"
          title="删除此记录"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useAchievementStore } from '../stores/achievement.js'
import { storeToRefs } from 'pinia'
import { toPng } from 'html-to-image'
import { embedMetadataToImage } from '../utils/metadata.js'

import AchievementCard from './AchievementCard.vue'
import AchievementCardXbox from './AchievementCardXbox.vue'
import AchievementCardPS from './AchievementCardPS.vue'
import AchievementCardSteam from './AchievementCardSteam.vue'
import AchievementCardPixel from './AchievementCardPixel.vue'
import AchievementCardParchment from './AchievementCardParchment.vue'

const store = useAchievementStore()
const { history, selectedHistoryId } = storeToRefs(store)

// Batch management states
const isBatchMode = ref(false)
const selectedIds = ref([])
const exportingRecord = ref(null)
const exportElRef = ref(null)
const isExportingBatch = ref(false)
const progressText = ref('')

function getCardComponent(record) {
  if (!record) return AchievementCard
  if (record.cardStyle === 'xbox') return AchievementCardXbox
  if (record.cardStyle === 'ps') return AchievementCardPS
  if (record.cardStyle === 'steam') return AchievementCardSteam
  if (record.cardStyle === 'pixel') return AchievementCardPixel
  if (record.cardStyle === 'parchment') return AchievementCardParchment
  return AchievementCard
}

function loadRecord(record) {
  store.loadRecord(record)
}

async function deleteRecord(id) {
  await store.deleteHistoryRecord(id)
}

async function confirmClear() {
  if (window.confirm('确定要清空所有历史记录吗？此操作不可撤销。')) {
    await store.clearHistory()
  }
}

function toggleSelectItem(id) {
  const idx = selectedIds.value.indexOf(id)
  if (idx > -1) {
    selectedIds.value.splice(idx, 1)
  } else {
    selectedIds.value.push(id)
  }
}

function selectAll() {
  selectedIds.value = history.value.map(r => r.id)
}

function selectNone() {
  selectedIds.value = []
}

function toggleBatchMode() {
  isBatchMode.value = !isBatchMode.value
  selectedIds.value = []
}

async function deleteSelected() {
  if (selectedIds.value.length === 0) return
  if (window.confirm(`确认删除选中的 ${selectedIds.value.length} 条记录吗？此操作不可撤销。`)) {
    for (const id of selectedIds.value) {
      await store.deleteHistoryRecord(id)
    }
    selectedIds.value = []
    isBatchMode.value = false
  }
}

async function exportSelected() {
  if (selectedIds.value.length === 0) return
  isExportingBatch.value = true
  
  const recordsToExport = history.value.filter(r => selectedIds.value.includes(r.id))
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
  
  try {
    let count = 0
    for (const record of recordsToExport) {
      count++
      progressText.value = `${count}/${recordsToExport.length}`
      exportingRecord.value = record
      
      await nextTick()
      await delay(250) // Wait for component to render and fonts/images to resolve
      
      const el = exportElRef.value?.firstElementChild
      if (el) {
        const dataUrl = await toPng(el, { quality: 1.0, pixelRatio: 3, cacheBust: true })
        const resultBlob = await embedMetadataToImage(dataUrl, record, 'image/png')
        const url = URL.createObjectURL(resultBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = `成就卡-${record.title || 'untitled'}-${Date.now()}.png`
        a.click()
        URL.revokeObjectURL(url)
      }
      await delay(300) // Small spacing between downloads
    }
    isBatchMode.value = false
    selectedIds.value = []
  } catch (err) {
    alert('打包导出失败: ' + err.message)
  } finally {
    exportingRecord.value = null
    isExportingBatch.value = false
    progressText.value = ''
  }
}

function formatDate(isoStr) {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  const now = new Date()
  const diff = (now - d) / 1000
  if (diff < 60) return '刚刚'
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}
</script>

<style scoped>
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.history-panel {
  display: flex;
  flex-direction: row;
  height: 100%;
  background: rgba(12, 12, 16, 0.35);
  backdrop-filter: blur(12px);
  border-top: 1px solid var(--border-subtle);
  width: 100%;
  overflow: hidden;
  position: relative;
}

.history-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  border-right: 1px solid var(--border-subtle);
  width: 130px;
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.15);
}

.panel-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
}

.history-count {
  background: rgba(191,149,63,0.2);
  color: var(--gold-1);
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 10px;
  font-weight: 600;
}

.header-action-buttons {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.btn-manage {
  width: 100%;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  color: var(--text-secondary);
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-manage:hover {
  background: rgba(191, 149, 63, 0.1);
  border-color: var(--border-gold);
  color: var(--gold-2);
}

.btn-clear-link {
  width: 100%;
  padding: 4px 8px;
  background: transparent;
  border: 1px solid transparent;
  color: #e06060;
  font-size: 11px;
  cursor: pointer;
}
.btn-clear-link:hover {
  text-decoration: underline;
}

.history-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  flex: 1;
  padding: 16px;
  color: var(--text-muted);
}
.empty-text-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}
.history-empty p {
  margin: 0;
  font-size: 13.5px;
}
.history-empty small {
  font-size: 10.5px;
  opacity: 0.7;
}

.history-list {
  padding: 14px 16px;
  display: flex;
  flex-direction: row;
  gap: 12px;
  overflow-x: auto;
  overflow-y: hidden;
  flex: 1;
  align-items: center;
}

.history-list::-webkit-scrollbar {
  height: 5px;
}
.history-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.01);
  border-radius: 3px;
}
.history-list::-webkit-scrollbar-thumb {
  background: rgba(191, 149, 63, 0.15);
  border-radius: 3px;
}
.history-list::-webkit-scrollbar-thumb:hover {
  background: rgba(191, 149, 63, 0.3);
}

.history-item {
  width: 180px;
  height: 68px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border-subtle);
  cursor: pointer;
  position: relative;
  transition: var(--transition-spring);
}
.history-item:hover {
  background: rgba(191,149,63,0.06);
  border-color: var(--border-gold);
  transform: translateY(-2px);
}
.history-item.active {
  background: rgba(191,149,63,0.12);
  border-color: var(--gold-2);
  box-shadow: 0 4px 12px rgba(191, 149, 63, 0.15);
}

.history-item-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
  background: rgba(0,0,0,0.3);
  overflow: hidden;
}
.history-icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.history-item-info {
  flex: 1;
  min-width: 0;
}
.history-item-title {
  font-size: 12.5px;
  font-weight: 700;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: var(--font-serif);
}
.history-item-sub {
  font-size: 11px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 1px;
}
.history-item-date {
  font-size: 9px;
  color: var(--text-muted);
  margin-top: 2px;
  font-family: var(--font-mono);
}

.history-delete-btn {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: none;
  background: rgba(0, 0, 0, 0.75);
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.15s;
  z-index: 5;
}
.history-item:hover .history-delete-btn {
  opacity: 1;
}
.history-delete-btn:hover {
  background: rgba(224,96,96,0.9);
  color: #fff;
}

/* Floating Batch Action Bar Styles */
.batch-action-bar {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(20, 20, 25, 0.92);
  border: 1px solid var(--border-gold);
  backdrop-filter: blur(20px);
  padding: 8px 18px;
  border-radius: 30px;
  display: flex;
  align-items: center;
  gap: 24px;
  z-index: 100;
  box-shadow: 0 8px 32px rgba(0,0,0,0.6);
}

.batch-bar-left {
  font-size: 12.5px;
  color: var(--text-primary);
}

.gold-text-highlight {
  color: var(--gold-2);
  font-weight: 700;
}

.batch-bar-right {
  display: flex;
  gap: 8px;
}

.btn-bar-action {
  padding: 6px 14px;
  border-radius: 15px;
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--border-subtle);
  background: rgba(255,255,255,0.05);
  color: var(--text-muted);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-bar-action:hover:not(:disabled) {
  background: rgba(255,255,255,0.1);
  color: var(--text-primary);
  border-color: var(--text-secondary);
}
.btn-bar-action:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.btn-bar-action.action-export {
  background: rgba(191, 149, 63, 0.15);
  border-color: rgba(191, 149, 63, 0.4);
  color: var(--gold-2);
}
.btn-bar-action.action-export:hover:not(:disabled) {
  background: rgba(191, 149, 63, 0.25);
  border-color: var(--gold-2);
}
.btn-bar-action.action-delete {
  background: rgba(224, 96, 96, 0.15);
  border-color: rgba(224, 96, 96, 0.3);
  color: #ff8080;
}
.btn-bar-action.action-delete:hover:not(:disabled) {
  background: rgba(224, 96, 96, 0.25);
  border-color: #ff6060;
}
.btn-bar-action.action-close {
  background: transparent;
  border-color: transparent;
}
.btn-bar-action.action-close:hover {
  color: #fff;
}

/* Batch item checkboxes */
.batch-checkbox-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 2px;
}
.batch-checkbox {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1.5px solid var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  color: transparent;
  transition: all 0.15s;
  background: rgba(0,0,0,0.3);
}
.batch-checkbox.checked {
  background: var(--gold-1);
  border-color: var(--gold-1);
  color: #000;
}
.history-item.is-batching {
  cursor: pointer;
}
.history-item.is-selected {
  border-color: var(--gold-2);
  background: rgba(191,149,63,0.08);
}

/* Transitions */
.batch-bar-slide-enter-active, .batch-bar-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.batch-bar-slide-enter-from, .batch-bar-slide-leave-to {
  bottom: -60px;
  opacity: 0;
}
</style>
