<template>
  <div class="history-panel animate-slide-in">
    <div class="history-header">
      <h3 class="panel-title">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        历史记录
        <span class="history-count" v-if="history.length">{{ history.length }}</span>
      </h3>
      <button
        v-if="history.length"
        class="btn-danger"
        @click="confirmClear"
        title="清空所有记录"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
        清空
      </button>
    </div>

    <!-- Empty state -->
    <div v-if="!history.length" class="history-empty">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
        <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z"/><path d="M12 8v4l2 2"/>
      </svg>
      <p>暂无历史记录</p>
      <small>每次保存/导出后自动记录</small>
    </div>

    <!-- List -->
    <div class="history-list" v-else>
      <div
        v-for="record in history"
        :key="record.id"
        class="history-item"
        :class="{ active: selectedHistoryId === record.id }"
        @click="loadRecord(record)"
      >
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
import { useAchievementStore } from '../stores/achievement.js'
import { storeToRefs } from 'pinia'

const store = useAchievementStore()
const { history, selectedHistoryId } = storeToRefs(store)

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
.history-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-panel);
  border-left: 1px solid var(--border-subtle);
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px 12px;
  border-bottom: 1px solid var(--border-subtle);
  flex-shrink: 0;
}

.panel-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 7px;
}

.history-count {
  background: rgba(191,149,63,0.2);
  color: var(--gold-1);
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 10px;
  font-weight: 600;
}

.history-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex: 1;
  padding: 32px 16px;
  color: var(--text-muted);
  text-align: center;
}
.history-empty p {
  margin: 0;
  font-size: 14px;
}
.history-empty small {
  font-size: 11px;
}

.history-list {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
  flex: 1;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 10px;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
  position: relative;
}
.history-item:hover {
  background: rgba(191,149,63,0.06);
  border-color: var(--border-subtle);
}
.history-item.active {
  background: rgba(191,149,63,0.1);
  border-color: rgba(191,149,63,0.4);
}

.history-item-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
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
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  font-size: 10px;
  color: var(--text-muted);
  margin-top: 2px;
}

.history-delete-btn {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.15s;
}
.history-item:hover .history-delete-btn {
  opacity: 1;
}
.history-delete-btn:hover {
  background: rgba(224,96,96,0.2);
  color: #e06060;
}
</style>
