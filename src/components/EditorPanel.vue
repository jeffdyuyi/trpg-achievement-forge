<template>
  <div class="editor-panel">
    <h2 class="panel-title">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      编辑成就内容
    </h2>

    <!-- Icon Upload -->
    <div class="form-group">
      <label class="form-label">成就图标 <span class="optional-tag">可选</span></label>
      <div class="icon-upload-area" @click="triggerIconUpload" @dragover.prevent @drop.prevent="handleIconDrop">
        <img v-if="form.iconBase64" :src="form.iconBase64" class="icon-preview" />
        <div v-else class="icon-upload-placeholder">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          <span>点击上传图片<br/><small>支持拖拽，自动裁为圆形</small></span>
        </div>
        <input
          ref="iconInputRef"
          type="file"
          accept="image/*"
          style="display:none"
          @change="handleIconChange"
        />
      </div>
      <button v-if="form.iconBase64" class="btn-danger mt-2" @click="form.iconBase64 = ''">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
        移除图标
      </button>
    </div>

    <!-- Title (required) -->
    <div class="form-group">
      <label class="form-label" style="display:flex; justify-content:space-between; align-items:center;">
        <span>
          成就名称 <span class="required-tag">必填</span>
          <span class="char-count" :class="{ warn: (form.title?.length || 0) > 16 }">
            {{ form.title?.length || 0 }}/20
          </span>
        </span>
        <div class="text-align-control">
          <button type="button" class="align-btn" :class="{active: form.coreAlign === 'left'}" @click="form.coreAlign = 'left'" title="主信息局左">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
          </button>
          <button type="button" class="align-btn" :class="{active: form.coreAlign === 'center'}" @click="form.coreAlign = 'center'" title="主信息居中">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="18" y1="18" x2="6" y2="18"/></svg>
          </button>
          <button type="button" class="align-btn" :class="{active: form.coreAlign === 'right'}" @click="form.coreAlign = 'right'" title="主信息居右">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/></svg>
          </button>
        </div>
      </label>
      <RichInput
        v-model="form.title"
        placeholder="如：直面古神而不疯"
        maxlength="20"
      />
    </div>

    <!-- Recipient (required) -->
    <div class="form-group">
      <label class="form-label">获得者 <span class="required-tag">必填</span></label>
      <RichInput
        v-model="form.recipient"
        placeholder="如：调查员 约翰·史密斯"
      />
    </div>

    <!-- Description (required) -->
    <div class="form-group">
      <label class="form-label" style="display:flex; justify-content:space-between; align-items:center;">
        <span>成就描述 <span class="required-tag">必填</span></span>
        <div class="text-align-control">
          <button type="button" class="align-btn" :class="{active: form.descAlign === 'left'}" @click="form.descAlign = 'left'" title="描述居左">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
          </button>
          <button type="button" class="align-btn" :class="{active: form.descAlign === 'center'}" @click="form.descAlign = 'center'" title="描述居中">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="18" y1="18" x2="6" y2="18"/></svg>
          </button>
          <button type="button" class="align-btn" :class="{active: form.descAlign === 'right'}" @click="form.descAlign = 'right'" title="描述居右">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/></svg>
          </button>
        </div>
      </label>
      <RichInput
        multiline
        v-model="form.description"
        placeholder="在目击了克苏鲁的虚影后，连续三次通过了极难的理智检定……"
        rows="4"
        style="resize:vertical; min-height: 80px;"
      />
    </div>

    <!-- Font size for description -->
    <div class="form-group">
      <label class="form-label" style="display:flex; justify-content:space-between;">
        <span>描述字体大小</span>
        <span>{{ form.descriptionFontSize }} px</span>
      </label>
      <input 
        type="range" 
        min="10" 
        max="36" 
        v-model.number="form.descriptionFontSize" 
        style="width:100%; height:4px; accent-color: var(--gold-1); cursor:pointer;" 
      />
    </div>

    <!-- Separator -->
    <div class="form-separator">
      <span>可选信息</span>
      <div class="text-align-control" style="margin-left: auto;">
        <button type="button" class="align-btn" :class="{active: form.metaAlign === 'left'}" @click="form.metaAlign = 'left'" title="信息居左">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
        </button>
        <button type="button" class="align-btn" :class="{active: form.metaAlign === 'center'}" @click="form.metaAlign = 'center'" title="信息居中">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="10" x2="6" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="18" y1="18" x2="6" y2="18"/></svg>
        </button>
        <button type="button" class="align-btn" :class="{active: form.metaAlign === 'right'}" @click="form.metaAlign = 'right'" title="信息居右">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" y1="10" x2="7" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="7" y2="18"/></svg>
        </button>
      </div>
    </div>

    <!-- Game Name -->
    <div class="form-group">
      <label class="form-label">游戏名称 <span class="optional-tag">可选</span></label>
      <RichInput
        v-model="form.gameName"
        placeholder="如：克苏鲁的呼唤：星之吸血鬼"
      />
    </div>

    <!-- Issuer -->
    <div class="form-group">
      <label class="form-label">颁发者 <span class="optional-tag">可选</span></label>
      <RichInput
        v-model="form.issuer"
        placeholder="如：KP 无情的骰子"
      />
    </div>

    <!-- Date -->
    <div class="form-group">
      <label class="form-label">日期 <span class="optional-tag">可选</span></label>
      <input
        class="forge-input"
        type="date"
        v-model="form.date"
      />
    </div>

    <!-- Background Theme -->
    <div class="form-group">
      <label class="form-label">背景主题</label>
      <div class="theme-grid">
        <button
          v-for="theme in themes"
          :key="theme.id"
          class="theme-btn"
          :class="{ active: form.backgroundTheme === theme.id }"
          :style="{ background: theme.preview }"
          @click="form.backgroundTheme = theme.id"
          :title="theme.label"
        >
          <span class="theme-label">{{ theme.label }}</span>
          <div v-if="form.backgroundTheme === theme.id" class="theme-check">✓</div>
        </button>
      </div>
      <!-- Custom color picker -->
      <div v-if="form.backgroundTheme === 'custom'" class="custom-color-row">
        <input type="color" v-model="form.customBgColor" class="color-picker" />
        <span style="color:var(--text-secondary);font-size:13px;">自定义背景色</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAchievementStore } from '../stores/achievement.js'
import { storeToRefs } from 'pinia'
import RichInput from './RichInput.vue'

const store = useAchievementStore()
const { form } = storeToRefs(store)

const iconInputRef = ref(null)

const themes = [
  { id: 'dark', label: '暗黑', preview: 'linear-gradient(135deg, #0f0c20, #1a1228)' },
  { id: 'parchment', label: '羊皮纸', preview: 'linear-gradient(135deg, #1a150a, #2a1f0f)' },
  { id: 'cyber', label: '赛博', preview: 'linear-gradient(135deg, #050d18, #0a1a2e)' },
  { id: 'starry', label: '星空', preview: 'radial-gradient(ellipse at 30% 30%, #1a1040, #080820)' },
  { id: 'minimal', label: '极简', preview: 'linear-gradient(135deg, #111118, #1c1c28)' },
  { id: 'custom', label: '自定义', preview: 'conic-gradient(from 0deg, #bf953f, #fcf6ba, #b38728, #bf953f)' },
]

function triggerIconUpload() {
  iconInputRef.value?.click()
}

function processImageFile(file) {
  if (!file || !file.type.startsWith('image/')) return
  const reader = new FileReader()
  reader.onload = (e) => {
    // Use canvas to crop to square
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const size = Math.min(img.width, img.height)
      canvas.width = 200
      canvas.height = 200
      const ctx = canvas.getContext('2d')
      const sx = (img.width - size) / 2
      const sy = (img.height - size) / 2
      ctx.drawImage(img, sx, sy, size, size, 0, 0, 200, 200)
      form.value.iconBase64 = canvas.toDataURL('image/png')
    }
    img.src = e.target.result
  }
  reader.readAsDataURL(file)
}

function handleIconChange(e) {
  processImageFile(e.target.files[0])
  // Reset input so same file can be selected again
  e.target.value = ''
}

function handleIconDrop(e) {
  processImageFile(e.dataTransfer.files[0])
}
</script>

<style scoped>
.editor-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  background: var(--bg-panel);
  border-right: 1px solid var(--border-subtle);
  height: 100%;
  overflow-y: auto;
}

.panel-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.required-tag {
  font-size: 10px;
  color: #d4956a;
  background: rgba(212,149,106,0.12);
  border: 1px solid rgba(212,149,106,0.25);
  padding: 1px 5px;
  border-radius: 3px;
  font-weight: 400;
}

.optional-tag {
  font-size: 10px;
  color: var(--text-muted);
  background: rgba(107,98,80,0.15);
  padding: 1px 5px;
  border-radius: 3px;
  font-weight: 400;
}

.char-count {
  margin-left: auto;
  font-size: 10px;
  color: var(--text-muted);
  font-weight: 400;
}
.char-count.warn {
  color: #e09060;
}

/* Icon upload */
.icon-upload-area {
  border: 2px dashed var(--border-subtle);
  border-radius: 10px;
  padding: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 90px;
  transition: border-color 0.2s, background 0.2s;
  position: relative;
}
.icon-upload-area:hover {
  border-color: var(--border-gold);
  background: rgba(191,149,63,0.05);
}
.icon-preview {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(191,149,63,0.5);
}
.icon-upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
  font-size: 13px;
  text-align: center;
}
.icon-upload-placeholder small {
  font-size: 11px;
  color: var(--text-muted);
  opacity: 0.7;
}

/* Form separator */
.form-separator {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  letter-spacing: 1px;
  color: var(--text-muted);
  text-transform: uppercase;
  margin: 4px 0;
}
.form-separator::before,
.form-separator::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-subtle);
}

/* Theme grid */
.theme-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.theme-btn {
  position: relative;
  height: 44px;
  border-radius: 8px;
  border: 2px solid transparent;
  cursor: pointer;
  display: flex;
  align-items: flex-end;
  padding: 4px 6px;
  transition: all 0.2s;
  overflow: hidden;
}
.theme-btn:hover {
  border-color: rgba(191,149,63,0.5);
  transform: scale(1.02);
}
.theme-btn.active {
  border-color: rgba(191,149,63,0.9);
  box-shadow: 0 0 10px rgba(191,149,63,0.3);
}
.theme-label {
  font-size: 10px;
  color: rgba(255,255,255,0.8);
  text-shadow: 0 1px 3px rgba(0,0,0,0.8);
  font-weight: 500;
  z-index: 1;
  position: relative;
}
.theme-check {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 14px;
  height: 14px;
  background: rgba(191,149,63,0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  color: #000;
  font-weight: 700;
}

.custom-color-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
}
.color-picker {
  width: 40px;
  height: 32px;
  border: 1px solid var(--border-subtle);
  border-radius: 6px;
  cursor: pointer;
  background: none;
  padding: 2px;
}

/* Align Controls */
.text-align-control {
  display: flex;
  gap: 4px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  padding: 3px;
  border: 1px solid var(--border-subtle);
}
.align-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  padding: 3px 6px;
  border-radius: 3px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.align-btn:hover {
  background: rgba(255, 255, 255, 0.05);
}
.align-btn.active {
  background: rgba(191,149,63,0.2);
  color: var(--gold-2);
}

.mt-2 { margin-top: 8px; }
</style>
