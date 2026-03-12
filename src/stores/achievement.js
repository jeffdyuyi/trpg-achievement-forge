import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import localforage from 'localforage'

const DB_KEY = 'trpg-achievements'
const DRAFT_KEY = 'trpg-draft'

function getLocalDateString() {
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

export const useAchievementStore = defineStore('achievement', () => {
    // Current form state
    const form = ref({
        title: '',
        recipient: '',
        coreAlign: 'left',
        description: '',
        descAlign: 'left',
        descriptionFontSize: 13,
        gameName: '',
        issuer: '',
        metaAlign: 'left',
        date: getLocalDateString(),
        backgroundTheme: 'dark',
        iconBase64: '',
        customBgColor: '#0f0c20',
    })

    // Restore draft if exists
    try {
        const draft = localStorage.getItem(DRAFT_KEY)
        if (draft) {
            const parsed = JSON.parse(draft)
            // Use Object.assign to merge with defaults in case of new properties
            if (parsed.form) {
                Object.assign(form.value, parsed.form)
            }
            if (parsed.selectedId) {
                selectedHistoryId.value = parsed.selectedId
            }
        }
    } catch (e) {
        console.warn('Failed to load draft:', e)
    }

    // Auto-save draft on any form changes or ID changes
    watch([form, selectedHistoryId], ([newForm, newId]) => {
        try {
            localStorage.setItem(DRAFT_KEY, JSON.stringify({
                form: newForm,
                selectedId: newId
            }))
        } catch (e) {
            console.warn('Failed to save draft:', e)
        }
    }, { deep: true })

    // History records
    const history = ref([])
    const historyLoaded = ref(false)

    // Selected history item id (for highlight)
    const selectedHistoryId = ref(null)

    // Load history from IndexedDB
    async function loadHistory() {
        try {
            const data = await localforage.getItem(DB_KEY)
            if (data && Array.isArray(data)) {
                history.value = data
            }
        } catch (e) {
            console.warn('Failed to load history:', e)
        }
        historyLoaded.value = true
    }

    // Save history to IndexedDB
    async function persistHistory() {
        try {
            await localforage.setItem(DB_KEY, history.value)
        } catch (e) {
            console.warn('Failed to persist history:', e)
        }
    }

    // Build a record object with specific ID
    function buildRecord(existingId = null) {
        return {
            id: existingId || Date.now().toString(),
            version: '1.0',
            title: form.value.title,
            recipient: form.value.recipient,
            description: form.value.description,
            iconBase64: form.value.iconBase64,
            metadata: {
                coreAlign: form.value.coreAlign,
                descAlign: form.value.descAlign,
                metaAlign: form.value.metaAlign,
                descriptionFontSize: form.value.descriptionFontSize,
                gameName: form.value.gameName,
                issuer: form.value.issuer,
                date: form.value.date,
            },
            style: {
                backgroundTheme: form.value.backgroundTheme,
                customBgColor: form.value.customBgColor,
            },
            savedAt: new Date().toISOString(),
        }
    }

    // Save as new record
    async function saveAsNewRecord() {
        const record = buildRecord() // New ID
        history.value = [record, ...history.value.slice(0, 49)]
        selectedHistoryId.value = record.id
        await persistHistory()
        return record
    }

    // Update existing record
    async function updateRecord() {
        if (!selectedHistoryId.value) return saveAsNewRecord()

        const record = buildRecord(selectedHistoryId.value) // Same ID
        const index = history.value.findIndex(r => r.id === selectedHistoryId.value)

        if (index !== -1) {
            // Replace in place
            history.value[index] = record
            // Optionally move to top? Usually overwrite stays in place or moves up. Let's stay in place but re-persist.
        } else {
            // ID not found (maybe deleted?), treat as new
            history.value = [record, ...history.value.slice(0, 49)]
        }

        await persistHistory()
        return record
    }

    // (Deprecated/Wrapper) Legacy save function
    async function saveToHistory() {
        if (selectedHistoryId.value) {
            return updateRecord()
        }
        return saveAsNewRecord()
    }

    // Delete a history record
    async function deleteHistoryRecord(id) {
        history.value = history.value.filter(r => r.id !== id)
        await persistHistory()
        if (selectedHistoryId.value === id) {
            selectedHistoryId.value = null
        }
    }

    // Clear all history
    async function clearHistory() {
        history.value = []
        await persistHistory()
        selectedHistoryId.value = null
    }

    // Load a history record into form
    function loadRecord(record) {
        form.value.title = record.title || ''
        form.value.recipient = record.recipient || ''
        form.value.coreAlign = record.metadata?.coreAlign || 'left'
        form.value.description = record.description || ''
        form.value.descAlign = record.metadata?.descAlign || 'left'
        form.value.descriptionFontSize = record.metadata?.descriptionFontSize || 13
        form.value.iconBase64 = record.iconBase64 || ''
        form.value.gameName = record.metadata?.gameName || ''
        form.value.issuer = record.metadata?.issuer || ''
        form.value.metaAlign = record.metadata?.metaAlign || 'left'
        form.value.date = record.metadata?.date || getLocalDateString()
        form.value.backgroundTheme = record.style?.backgroundTheme || 'dark'
        form.value.customBgColor = record.style?.customBgColor || '#0f0c20'
        selectedHistoryId.value = record.id
    }

    // Reset form
    function resetForm() {
        form.value = {
            title: '',
            recipient: '',
            coreAlign: 'left',
            description: '',
            descAlign: 'left',
            descriptionFontSize: 13,
            gameName: '',
            issuer: '',
            metaAlign: 'left',
            date: getLocalDateString(),
            backgroundTheme: 'dark',
            iconBase64: '',
            customBgColor: '#0f0c20',
        }
        selectedHistoryId.value = null
    }

    // Export as JSON
    function exportJSON() {
        const record = buildRecord()
        const blob = new Blob([JSON.stringify(record, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `achievement-${record.title || 'untitled'}-${record.id}.json`
        a.click()
        URL.revokeObjectURL(url)
    }

    // Import from JSON
    async function importJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result)
                    loadRecord(data)
                    resolve(data)
                } catch (err) {
                    reject(new Error('JSON 文件解析失败，请检查文件格式'))
                }
            }
            reader.onerror = () => reject(new Error('文件读取失败'))
            reader.readAsText(file)
        })
    }

    return {
        form,
        history,
        historyLoaded,
        selectedHistoryId,
        loadHistory,
        saveToHistory,
        saveAsNewRecord,
        updateRecord,
        deleteHistoryRecord,
        clearHistory,
        loadRecord,
        resetForm,
        exportJSON,
        importJSON,
        buildRecord,
    }
})
