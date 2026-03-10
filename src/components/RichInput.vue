<template>
  <div class="rich-input-container">
    <div class="rich-toolbar">
      <button type="button" class="rich-btn" @click.prevent="applyFormat('b')" title="加粗 (Bold)"><b style="font-family: serif;">B</b></button>
      <button type="button" class="rich-btn" @click.prevent="applyFormat('i')" title="斜体 (Italic)"><i style="font-family: serif;">I</i></button>
      <slot name="toolbar-extra"></slot>
    </div>
    <textarea 
      v-if="multiline" 
      ref="inputEl" 
      class="forge-input" 
      :value="modelValue" 
      @input="onInput" 
      v-bind="$attrs"
    ></textarea>
    <input 
      v-else 
      ref="inputEl" 
      class="forge-input" 
      type="text" 
      :value="modelValue" 
      @input="onInput" 
      v-bind="$attrs" 
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: String,
  multiline: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue'])
const inputEl = ref(null)

function onInput(e) {
  emit('update:modelValue', e.target.value)
}

function applyFormat(tag) {
  const el = inputEl.value
  if (!el) return
  const start = el.selectionStart
  const end = el.selectionEnd
  const val = props.modelValue || ''

  const before = val.substring(0, start)
  const selected = val.substring(start, end)
  const after = val.substring(end)
  
  const insert = `<${tag}>${selected}</${tag}>`
  const newVal = before + insert + after
  
  emit('update:modelValue', newVal)
  
  setTimeout(() => {
    el.focus()
    el.setSelectionRange(start + tag.length + 2, end + tag.length + 2)
  }, 0)
}
</script>

<style scoped>
.rich-input-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.rich-toolbar {
  display: flex;
  gap: 4px;
  padding: 0 4px;
}
.rich-btn {
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 13px;
  transition: all 0.2s;
}
.rich-btn:hover {
  background: rgba(191,149,63,0.15);
  color: var(--gold-2);
  border-color: rgba(191,149,63,0.3);
}
</style>
