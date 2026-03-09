/**
 * Utility to embed and extract JSON metadata from PNG images
 * without corrupting the PNG file structure (appending to the end of the file).
 */

const META_PREFIX = '___TRPG_META___'
const META_SUFFIX = '___TRPG_END___'

/**
 * Embed metadata into a Data URL (converted to Blob)
 * @param {string} dataUrl - The base64 data URL
 * @param {Object} metadata - The JSON object to embed
 * @param {string} mimeType - The mime type of the output (e.g. 'image/png' or 'image/gif')
 * @returns {Blob} The new image Blob containing metadata
 */
export async function embedMetadataToImage(dataUrl, metadata, mimeType = 'image/png') {
    // 1. Convert Data URL to Blob
    const res = await fetch(dataUrl)
    const imageBlob = await res.blob()

    // 2. Prepare metadata string
    const jsonString = JSON.stringify(metadata)
    const metaString = `${META_PREFIX}${jsonString}${META_SUFFIX}`

    // 3. Convert metadata string to Blob
    const metaBlob = new Blob([metaString], { type: 'text/plain' })

    // 4. Concatenate Image Blob and Meta Blob
    return new Blob([imageBlob, metaBlob], { type: 'image/png' })
}

/**
 * Extract metadata from a File or Blob
 * @param {Blob|File} file - The image file to parse
 * @returns {Object|null} The parsed JSON object or null if not found
 */
export async function extractMetadataFromImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (e) => {
            const buffer = e.target.result

            // We only read the last 5MB or less to avoid parsing huge files entirely
            // However, for TRPG cards, files are small enough (< 2MB) so parsing whole is fine.
            const textDecoder = new TextDecoder('utf-8')
            const text = textDecoder.decode(buffer)

            const startIndex = text.lastIndexOf(META_PREFIX)
            if (startIndex === -1) {
                return resolve(null) // No metadata found
            }

            const endIndex = text.lastIndexOf(META_SUFFIX)
            if (endIndex === -1 || endIndex <= startIndex) {
                return resolve(null) // Corrupted metadata
            }

            try {
                const jsonString = text.substring(startIndex + META_PREFIX.length, endIndex)
                const metadata = JSON.parse(jsonString)
                resolve(metadata)
            } catch (err) {
                console.error('Failed to parse embedded JSON', err)
                resolve(null)
            }
        }

        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsArrayBuffer(file)
    })
}
