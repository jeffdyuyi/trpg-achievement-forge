<template>
  <div class="timeline-view">
    <div class="timeline-controls">
      <div class="grouping-toggle">
        <button
          v-for="mode in ['day', 'week', 'month']"
          :key="mode"
          class="group-btn"
          :class="{ active: groupMode === mode }"
          @click="groupMode = mode"
        >
          {{ mode === 'day' ? '按日' : mode === 'week' ? '按周' : '按月' }}
        </button>
      </div>
    </div>

    <!-- 无数据 -->
    <div v-if="groupedHistory.length === 0" class="empty-tip">
      暂无记录
    </div>

    <!-- 分组区块 -->
    <div v-for="group in groupedHistory" :key="group.label" class="timeline-group">
      <!-- 分组标题标签 -->
      <div class="group-header">
        <div class="group-line"></div>
        <div class="group-label-pill">
          {{ group.label }}
          <span class="group-count">{{ group.items.length }} 条</span>
        </div>
        <div class="group-line"></div>
      </div>

      <!-- 多列卡片网格 -->
      <div class="group-grid">
        <div
          v-for="record in group.items"
          :key="record.id"
          class="grid-card"
          :style="{ borderTopColor: getThemeColor(record) }"
          @click="$emit('select', record)"
        >
          <!-- 卡片顶部色条由 border-top 实现 -->
          <div class="card-icon-wrap" v-if="record.iconBase64">
            <img :src="record.iconBase64" class="card-icon-img" alt="" />
          </div>
          <div class="card-icon-placeholder" v-else>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
            </svg>
          </div>

          <div class="card-body">
            <div class="card-title" v-html="record.title || '未命名'"></div>
            <div class="card-recipient">{{ record.recipient || '—' }}</div>
            <div class="card-meta-row">
              <span class="card-game" v-if="record.metadata?.gameName">{{ record.metadata.gameName }}</span>
              <span class="card-date">{{ record.metadata?.date || '' }}</span>
            </div>
          </div>

          <!-- 样式标签 -->
          <div v-if="record.metadata?.cardStyle && record.metadata.cardStyle !== 'classic'" class="card-style-tag" :class="`tag-${record.metadata.cardStyle}`">
            {{ record.metadata.cardStyle === 'xbox' ? 'Xbox' : 'PS' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  history: Array
})

const emit = defineEmits(['select'])

const groupMode = ref('day')

// 获取分组 label
function getGroupLabel(item) {
  const dateStr = item.metadata?.date || ''
  if (!dateStr) return '未知时间'

  if (groupMode.value === 'day') {
    return dateStr // YYYY-MM-DD
  } else if (groupMode.value === 'month') {
    return dateStr.substring(0, 7) // YYYY-MM
  } else {
    // 按周：计算自然周
    const d = new Date(dateStr + 'T00:00:00')
    if (isNaN(d.getTime())) return '未知时间'
    const year = d.getFullYear()
    // ISO 周号：每周从周一开始
    const startOfYear = new Date(year, 0, 1)
    const dayOfWeek = startOfYear.getDay() || 7 // 1=Mon...7=Sun
    const startOfWeek1 = new Date(startOfYear)
    if (dayOfWeek > 4) {
      startOfWeek1.setDate(startOfYear.getDate() + (8 - dayOfWeek))
    } else {
      startOfWeek1.setDate(startOfYear.getDate() + (1 - dayOfWeek))
    }
    const diff = d - startOfWeek1
    const weekNum = diff < 0 ? 53 : Math.floor(diff / 604800000) + 1
    return `${year} 第 ${weekNum} 周`
  }
}

const groupedHistory = computed(() => {
  if (!props.history || props.history.length === 0) return []

  const groups = new Map()

  ;[...props.history]
    .sort((a, b) => {
      const da = a.metadata?.date || ''
      const db = b.metadata?.date || ''
      return db.localeCompare(da) // 最新在前
    })
    .forEach(item => {
      const label = getGroupLabel(item)
      if (!groups.has(label)) groups.set(label, [])
      groups.get(label).push(item)
    })

  return Array.from(groups.entries()).map(([label, items]) => ({ label, items }))
})

function getThemeColor(record) {
  const theme = record.style?.backgroundTheme || record.backgroundTheme
  const colors = {
    dark: '#bf953f',
    parchment: '#8b5e34',
    cyber: '#00d2ff',
    starry: '#7d5fff',
    minimal: '#aaaaaa',
    custom: record.style?.customBgColor || '#bf953f'
  }
  // Xbox / PS 样式特殊颜色
  const cardStyle = record.metadata?.cardStyle
  if (cardStyle === 'xbox') return '#107C10'
  if (cardStyle === 'ps') return '#0070cc'
  return colors[theme] || colors.dark
}
</script>

<style scoped>
.timeline-view {
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 20px 16px 60px;
}

/* ── 控制栏 ── */
.timeline-controls {
  display: flex;
  justify-content: center;
}

.grouping-toggle {
  display: flex;
  background: rgba(191,149,63,0.05);
  border: 1px solid rgba(191,149,63,0.2);
  padding: 2px;
  border-radius: 20px;
}
.group-btn {
  padding: 6px 16px;
  border-radius: 18px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 11px;
  font-family: 'LXGW WenKai', 'Inter', sans-serif;
  transition: all 0.2s;
}
.group-btn.active {
  background: var(--gold-2);
  color: #000;
  font-weight: 700;
}

/* ── 无数据 ── */
.empty-tip {
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
  padding: 40px 0;
}

/* ── 分组区块 ── */
.timeline-group {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.group-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(191,149,63,0.25), transparent);
}

.group-label-pill {
  flex-shrink: 0;
  background: rgba(26,26,32,0.9);
  border: 1px solid rgba(191,149,63,0.4);
  color: var(--gold-2);
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  box-shadow: 0 0 12px rgba(191,149,63,0.12);
}

.group-count {
  font-size: 10px;
  font-weight: 400;
  color: var(--text-muted);
  background: rgba(191,149,63,0.1);
  padding: 1px 6px;
  border-radius: 8px;
}

/* ── 多列卡片网格 ── */
.group-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px;
}

/* ── 单张卡片 ── */
.grid-card {
  position: relative;
  background: rgba(22, 22, 30, 0.85);
  border: 1px solid rgba(191,149,63,0.1);
  border-top: 3px solid var(--gold-1);
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.2s;
  backdrop-filter: blur(4px);
  overflow: hidden;
}
.grid-card:hover {
  transform: translateY(-2px);
  border-color: rgba(191,149,63,0.35);
  background: rgba(30, 30, 40, 0.95);
  box-shadow: 0 6px 20px rgba(0,0,0,0.4);
}

/* 图标 */
.card-icon-wrap {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid rgba(191,149,63,0.3);
  flex-shrink: 0;
}
.card-icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.card-icon-placeholder {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px dashed rgba(191,149,63,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(191,149,63,0.3);
  flex-shrink: 0;
}

/* 卡片内容 */
.card-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.card-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.35;
  word-break: break-all;
}
.card-recipient {
  font-size: 11px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.card-meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;
  margin-top: 2px;
}
.card-game {
  font-size: 10px;
  color: var(--gold-2);
  opacity: 0.7;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80px;
}
.card-date {
  font-size: 10px;
  color: var(--text-muted);
  white-space: nowrap;
  flex-shrink: 0;
}

/* 样式标签 */
.card-style-tag {
  position: absolute;
  top: 6px;
  right: 6px;
  font-size: 9px;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 4px;
}
.tag-xbox {
  background: rgba(16,124,16,0.3);
  color: #4ddc4d;
  border: 1px solid rgba(16,124,16,0.5);
}
.tag-ps {
  background: rgba(0,112,204,0.3);
  color: #80aaff;
  border: 1px solid rgba(0,112,204,0.5);
}
</style>
