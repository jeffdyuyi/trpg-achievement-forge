<template>
  <div class="showcase-view">
    <!-- Showcase Toolbar -->
    <div class="showcase-toolbar">
      <div class="toolbar-left">
        <div class="search-box">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="searchQuery" placeholder="搜索成就、获得者..." class="toolbar-input" />
        </div>
      </div>

      <div class="toolbar-center">
        <div class="mode-toggle">
          <button 
            class="mode-btn" 
            :class="{ active: viewMode === 'grid' }" 
            @click="viewMode = 'grid'"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            方格
          </button>
          <button 
            class="mode-btn" 
            :class="{ active: viewMode === 'timeline' }" 
            @click="viewMode = 'timeline'"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="20" x2="12" y2="4"/><path d="M12 10a4 4 0 0 1 4-4"/><path d="M12 18a4 4 0 0 0-4-4"/></svg>
            记录河流
          </button>
        </div>
      </div>

      <div class="toolbar-right">
        <div class="sort-control">
          <select v-model="sortKey" class="toolbar-select">
            <option value="savedAt">保存时间</option>
            <option value="title">成就名称</option>
            <option value="recipient">获得者</option>
            <option value="gameName">游戏规则</option>
          </select>
          <button class="sort-order-btn" @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'">
            <svg v-if="sortOrder === 'asc'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/><path d="M11 12h4"/><path d="M11 16h7"/><path d="M11 20h10"/></svg>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="M11 12h4"/><path d="M11 8h7"/><path d="M11 4h10"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredHistory.length === 0" class="empty-state">
      <div class="empty-icon">📂</div>
      <h3>暂无成就记录</h3>
      <p>前往锻造炉开启你的第一份传奇成就吧</p>
      <router-link to="/" class="btn-gold mt-4">前往锻造</router-link>
    </div>

    <!-- Grid View -->
    <div v-else-if="viewMode === 'grid'" class="grid-container">
      <div v-for="record in sortedHistory" :key="record.id" class="grid-item" @click="openPreview(record)">
        <div class="item-card-mini" :style="{ background: getThemeBg(record) }">
           <div class="mini-badge">🏆</div>
           <div class="mini-title" v-html="record.title"></div>
           <div class="mini-recipient">{{ record.recipient }}</div>
           <div class="mini-date">{{ record.metadata?.date }}</div>
        </div>
      </div>
    </div>

    <!-- Timeline View -->
    <TimelineView v-else :history="sortedHistory" @select="openPreview" />

    <!-- Record Preview Modal -->
    <Transition name="modal-fade">
      <div v-if="previewRecord" class="modal-overlay" @click.self="previewRecord = null">
        <div class="preview-modal-box">
          <div class="modal-header">
            <h3>成就预览</h3>
            <button class="modal-close-btn" @click="previewRecord = null">
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <div class="modal-body">
             <div class="card-preview-wrap">
                <AchievementCardMock :form="previewRecord" />
             </div>
             <div class="modal-actions">
                <button class="btn-ghost" @click="editRecord(previewRecord)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  重新载入锻造
                </button>
                <button class="btn-danger" @click="deleteRecord(previewRecord)">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
                   彻底删除
                </button>
             </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAchievementStore } from '../stores/achievement.js'
import { storeToRefs } from 'pinia'
import TimelineView from '../components/TimelineView.vue'
import AchievementCardMock from '../components/AchievementCardMock.vue'

const store = useAchievementStore()
const { history } = storeToRefs(store)
const router = useRouter()

const viewMode = ref('grid')
const searchQuery = ref('')
const sortKey = ref('savedAt')
const sortOrder = ref('desc')
const previewRecord = ref(null)

const filteredHistory = computed(() => {
  if (!searchQuery.value) return history.value
  const q = searchQuery.value.toLowerCase()
  return history.value.filter(r => 
    r.title?.toLowerCase().includes(q) || 
    r.recipient?.toLowerCase().includes(q) ||
    r.metadata?.gameName?.toLowerCase().includes(q)
  )
})

const sortedHistory = computed(() => {
  const list = [...filteredHistory.value]
  list.sort((a, b) => {
    let valA, valB
    if (sortKey.value === 'savedAt') {
      valA = a.savedAt || ''
      valB = b.savedAt || ''
    } else if (sortKey.value === 'title') {
      valA = a.title || ''
      valB = b.title || ''
    } else if (sortKey.value === 'recipient') {
      valA = a.recipient || ''
      valB = b.recipient || ''
    } else if (sortKey.value === 'gameName') {
      valA = a.metadata?.gameName || ''
      valB = b.metadata?.gameName || ''
    }

    // Pinyin sort logic for strings
    const comparison = String(valA).localeCompare(String(valB), 'zh-Hans-CN')
    return sortOrder.value === 'asc' ? comparison : -comparison
  })
  return list
})

function getThemeBg(record) {
  const theme = record.style?.backgroundTheme
  if (theme === 'custom') return record.style?.customBgColor
  if (theme === 'dark') return 'linear-gradient(135deg, #0f0c20, #1a1228)'
  if (theme === 'parchment') return 'linear-gradient(135deg, #1a150a, #2a1f0f)'
  if (theme === 'cyber') return 'linear-gradient(135deg, #050d18, #0a1a2e)'
  if (theme === 'starry') return 'radial-gradient(ellipse at 30% 30%, #1a1040, #080820)'
  if (theme === 'minimal') return 'linear-gradient(135deg, #111118, #1c1c28)'
  return '#1a1a20'
}

function openPreview(record) {
  previewRecord.value = record
}

function editRecord(record) {
  store.loadRecord(record)
  router.push('/')
}

async function deleteRecord(record) {
  if (confirm('确定要删除这条成就吗？此操作不可撤销。')) {
    await store.deleteHistoryRecord(record.id)
    previewRecord.value = null
  }
}
</script>

<style scoped>
.showcase-view {
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.showcase-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: rgba(12,12,16,0.6);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  backdrop-filter: blur(8px);
  gap: 16px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0,0,0,0.3);
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid var(--border-subtle);
  width: 240px;
}
.toolbar-input {
  background: transparent;
  border: none;
  color: var(--text-primary);
  height: 34px;
  font-size: 13px;
  width: 100%;
}
.toolbar-input:focus { outline: none; }

.mode-toggle {
  display: flex;
  background: rgba(0,0,0,0.4);
  padding: 3px;
  border-radius: 8px;
  border: 1px solid var(--border-subtle);
}
.mode-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}
.mode-btn.active {
  background: rgba(191,149,63,0.2);
  color: var(--gold-2);
}

.sort-control {
  display: flex;
  align-items: center;
  gap: 4px;
}
.toolbar-select {
  background: rgba(0,0,0,0.4);
  border: 1px solid var(--border-subtle);
  color: var(--text-primary);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  outline: none;
}
.sort-order-btn {
  background: rgba(0,0,0,0.4);
  border: 1px solid var(--border-subtle);
  color: var(--gold-2);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  cursor: pointer;
}

/* Grid layout */
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}
.grid-item {
  cursor: pointer;
  transition: transform 0.2s;
}
.grid-item:hover {
  transform: translateY(-4px);
}
.item-card-mini {
  height: 140px;
  border-radius: 10px;
  border: 1px solid rgba(191,149,63,0.3);
  padding: 16px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.4);
}
.item-card-mini::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.6) 100%);
}
.mini-badge {
  font-size: 16px;
  margin-bottom: 8px;
  z-index: 1;
}
.mini-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--gold-2);
  margin-bottom: 4px;
  z-index: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.mini-recipient {
  font-size: 12px;
  color: rgba(255,255,255,0.8);
  margin-top: auto;
  z-index: 1;
}
.mini-date {
  font-size: 10px;
  color: rgba(255,255,255,0.4);
  z-index: 1;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  text-align: center;
}
.empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.3; }

/* Modal */
.preview-modal-box {
  background: #0f0f14;
  border: 1px solid var(--border-gold);
  border-radius: 12px;
  width: 90%;
  max-width: 1100px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.8);
  overflow: hidden;
}
.card-preview-wrap {
  transform-origin: top center;
  padding: 20px;
  background: #08080a;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--border-subtle);
  background: rgba(191,149,63,0.05);
}

@media (max-width: 800px) {
  .showcase-toolbar {
    flex-direction: column;
    padding: 16px;
  }
  .toolbar-left, .search-box {
    width: 100%;
  }
}
</style>
