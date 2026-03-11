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

    <div class="timeline-river">
      <!-- The central trunk -->
      <div class="timeline-trunk"></div>

      <!-- Groups -->
      <div v-for="group in groupedHistory" :key="group.label" class="timeline-group">
        <div class="group-label-pill">{{ group.label }}</div>
        
        <div class="group-items">
          <div 
            v-for="(record, index) in group.items" 
            :key="record.id" 
            class="timeline-item"
            :class="index % 2 === 0 ? 'item-left' : 'item-right'"
            @click="$emit('select', record)"
          >
            <!-- Connecting branch -->
            <div class="item-branch"></div>
            
            <div class="item-bubble" :style="{ borderLeftColor: getThemeColor(record) }">
              <div class="bubble-header">
                <span class="bubble-game">{{ record.metadata?.gameName || '未知规则' }}</span>
                <span class="bubble-date">{{ record.metadata?.date }}</span>
              </div>
              <div class="bubble-title" v-html="record.title"></div>
              <div class="bubble-footer">
                <span class="bubble-recipient">颁发给：{{ record.recipient }}</span>
              </div>
            </div>
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

const groupedHistory = computed(() => {
  const groups = {}
  
  props.history.forEach(item => {
    const dateStr = item.metadata?.date || '未知日期'
    let label = ''
    
    if (groupMode.value === 'day') {
      label = dateStr
    } else if (groupMode.value === 'month') {
      label = dateStr.substring(0, 7) // YYYY-MM
    } else if (groupMode.value === 'week') {
      const d = new Date(dateStr)
      const year = d.getFullYear()
      const firstDayOfYear = new Date(year, 0, 1)
      const pastDaysOfYear = (d - firstDayOfYear) / 86400000
      const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
      label = `${year} 第 ${weekNum} 周`
    }
    
    if (!groups[label]) groups[label] = []
    groups[label].push(item)
  })
  
  return Object.keys(groups).map(label => ({
    label,
    items: groups[label]
  }))
})

function getThemeColor(record) {
  const theme = record.backgroundTheme || record.style?.backgroundTheme
  const colors = {
    dark: '#bf953f',
    parchment: '#8b5e34',
    cyber: '#00d2ff',
    starry: '#7d5fff',
    minimal: '#ffffff',
    custom: record.style?.customBgColor || '#bf953f'
  }
  return colors[theme] || colors.dark
}
</script>

<style scoped>
.timeline-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 30px;
  padding: 20px 0 60px;
}

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
  transition: all 0.2s;
}
.group-btn.active {
  background: var(--gold-2);
  color: #000;
  font-weight: 700;
}

.timeline-river {
  position: relative;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 20px 0;
}

.timeline-trunk {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, 
    transparent, 
    var(--gold-1) 50px, 
    var(--gold-1) calc(100% - 50px), 
    transparent
  );
  transform: translateX(-50%);
  opacity: 0.3;
}

.timeline-group {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
  z-index: 2;
}

.group-label-pill {
  background: #1a1a20;
  border: 1px solid var(--gold-2);
  color: var(--gold-2);
  padding: 4px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 30px;
  box-shadow: 0 0 15px rgba(191,149,63,0.2);
}

.group-items {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.timeline-item {
  display: flex;
  align-items: center;
  position: relative;
  width: 50%;
  cursor: pointer;
}

.item-left {
  align-self: flex-start;
  flex-direction: row-reverse;
  padding-right: 30px;
}
.item-right {
  align-self: flex-end;
  padding-left: 30px;
}

.item-branch {
  position: absolute;
  height: 2px;
  background: rgba(191,149,63,0.2);
  width: 30px;
}
.item-left .item-branch { right: 0; }
.item-right .item-branch { left: 0; }

.item-left .item-branch::after {
  content: '';
  position: absolute;
  right: -4px;
  top: -3px;
  width: 8px;
  height: 8px;
  background: var(--gold-2);
  border-radius: 50%;
}
.item-right .item-branch::after {
  content: '';
  position: absolute;
  left: -4px;
  top: -3px;
  width: 8px;
  height: 8px;
  background: var(--gold-2);
  border-radius: 50%;
}

.item-bubble {
  background: rgba(25, 25, 30, 0.8);
  border: 1px solid rgba(191,149,63,0.1);
  border-left: 3px solid var(--gold-2);
  border-radius: 8px;
  padding: 12px 16px;
  width: 100%;
  transition: all 0.2s;
  backdrop-filter: blur(4px);
}
.item-bubble:hover {
  transform: scale(1.02);
  background: rgba(35, 35, 45, 0.95);
  border-color: rgba(191,149,63,0.4);
}

.bubble-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}
.bubble-game {
  font-size: 10px;
  color: var(--gold-2);
  opacity: 0.8;
  font-weight: 600;
}
.bubble-date {
  font-size: 10px;
  color: var(--text-muted);
}
.bubble-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
  line-height: 1.4;
}
.bubble-recipient {
  font-size: 11px;
  color: var(--text-secondary);
}

@media (max-width: 600px) {
  .timeline-trunk { left: 20px; transform: none; }
  .timeline-item { width: 100%; padding-left: 45px; flex-direction: row; align-self: flex-start; }
  .item-left .item-branch, .item-right .item-branch { left: 20px; width: 25px; right: auto; }
  .item-left .item-branch::after, .item-right .item-branch::after { left: -4px; right: auto; }
}
</style>
