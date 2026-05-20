/**
 * 图标预设生成工具
 * 生成像素风格的预设图标，返回 base64 PNG (200×200)
 */

const ICON_SIZE = 200

// ─── D20 骰子 ────────────────────────────────────────────────────────────────
function drawD20(ctx, size) {
  const s = size
  const cx = s / 2, cy = s / 2

  // 背景渐变
  const bg = ctx.createRadialGradient(cx - s * 0.15, cy - s * 0.15, s * 0.05, cx, cy, s * 0.52)
  bg.addColorStop(0, '#4a3f8c')
  bg.addColorStop(1, '#1a1040')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, s, s)

  const R = s * 0.44  // 外接圆半径
  const pts = []

  // D20 投影：正二十面体简化为正六边形 + 中心点的顶视图
  // 顶点：上顶点 + 5个外顶点 + 5个内顶点 + 底点
  // 简化为平面正多边形分层表达
  function poly(n, r, ox, oy, startAngle = 0) {
    const p = []
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + startAngle
      p.push([ox + Math.cos(a) * r, oy + Math.sin(a) * r])
    }
    return p
  }

  // 外层五边形顶点
  const outerPts = poly(5, R, cx, cy, -Math.PI / 2)
  // 内层五边形顶点（旋转36度，缩小）
  const innerPts = poly(5, R * 0.42, cx, cy, -Math.PI / 2 + Math.PI / 5)
  const top = [cx, cy - R]       // 顶点（同 outerPts[0]）
  const bottom = [cx, cy + R * 0.42] // 中心底

  // 外边框
  ctx.save()
  ctx.strokeStyle = '#9b8dff'
  ctx.lineWidth = s * 0.025

  // 画各个三角面（5个外三角 + 5个内三角 + 顶部五边形 + 底部五边形）
  const colors = [
    'rgba(80,60,180,0.85)',
    'rgba(60,45,150,0.85)',
    'rgba(100,80,200,0.7)',
    'rgba(50,35,130,0.9)',
    'rgba(90,70,190,0.75)',
  ]

  // 5个外侧三角（从顶点到外五边形相邻两点）
  for (let i = 0; i < 5; i++) {
    const a = outerPts[i]
    const b = outerPts[(i + 1) % 5]
    const inn = innerPts[i]
    ctx.beginPath()
    ctx.moveTo(a[0], a[1])
    ctx.lineTo(b[0], b[1])
    ctx.lineTo(inn[0], inn[1])
    ctx.closePath()
    ctx.fillStyle = colors[i]
    ctx.fill()
    ctx.stroke()
  }

  // 中心五边形
  ctx.beginPath()
  innerPts.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y))
  ctx.closePath()
  ctx.fillStyle = 'rgba(110,90,210,0.9)'
  ctx.fill()
  ctx.stroke()

  // 5个从内顶点向外顶点的三角（下部）
  for (let i = 0; i < 5; i++) {
    const a = innerPts[i]
    const b = innerPts[(i + 1) % 5]
    const out = outerPts[(i + 1) % 5]
    ctx.beginPath()
    ctx.moveTo(a[0], a[1])
    ctx.lineTo(b[0], b[1])
    ctx.lineTo(out[0], out[1])
    ctx.closePath()
    ctx.fillStyle = colors[(i + 2) % 5]
    ctx.fill()
    ctx.stroke()
  }

  // 数字 "20"
  ctx.fillStyle = '#ffffff'
  ctx.font = `bold ${s * 0.22}px "Arial", sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = '#c8b8ff'
  ctx.shadowBlur = s * 0.06
  ctx.fillText('20', cx, cy)
  ctx.shadowBlur = 0
  ctx.restore()
}

// ─── D6 骰子 ─────────────────────────────────────────────────────────────────
function drawD6(ctx, size) {
  const s = size
  const margin = s * 0.12
  const faceSize = s * 0.64
  const fx = margin + s * 0.02, fy = margin + s * 0.14

  // 背景
  const bg = ctx.createRadialGradient(s * 0.35, s * 0.3, s * 0.05, s * 0.5, s * 0.5, s * 0.55)
  bg.addColorStop(0, '#2a1f60')
  bg.addColorStop(1, '#0e0820')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, s, s)

  // 立体骰子 - 三面可见
  const faceColor = '#3d2fa0'
  const sideColor = '#261d75'
  const topColor = '#5046c8'
  const depth = s * 0.18

  // 主正面
  ctx.fillStyle = faceColor
  roundRect(ctx, fx, fy, faceSize, faceSize, s * 0.07)
  ctx.fill()

  // 右侧面（平行四边形）
  ctx.beginPath()
  ctx.moveTo(fx + faceSize, fy)
  ctx.lineTo(fx + faceSize + depth, fy - depth * 0.6)
  ctx.lineTo(fx + faceSize + depth, fy + faceSize - depth * 0.6)
  ctx.lineTo(fx + faceSize, fy + faceSize)
  ctx.closePath()
  ctx.fillStyle = sideColor
  ctx.fill()

  // 顶面（平行四边形）
  ctx.beginPath()
  ctx.moveTo(fx, fy)
  ctx.lineTo(fx + faceSize, fy)
  ctx.lineTo(fx + faceSize + depth, fy - depth * 0.6)
  ctx.lineTo(fx + depth, fy - depth * 0.6)
  ctx.closePath()
  ctx.fillStyle = topColor
  ctx.fill()

  // 边框
  ctx.strokeStyle = '#8070ff'
  ctx.lineWidth = s * 0.018
  roundRect(ctx, fx, fy, faceSize, faceSize, s * 0.07)
  ctx.stroke()

  // 正面的点（展示数字 6 的排列：2列3行）
  const dotR = s * 0.055
  const dotColor = '#ffffff'
  ctx.fillStyle = dotColor
  const dotPositions = [
    [fx + faceSize * 0.28, fy + faceSize * 0.22],
    [fx + faceSize * 0.72, fy + faceSize * 0.22],
    [fx + faceSize * 0.28, fy + faceSize * 0.50],
    [fx + faceSize * 0.72, fy + faceSize * 0.50],
    [fx + faceSize * 0.28, fy + faceSize * 0.78],
    [fx + faceSize * 0.72, fy + faceSize * 0.78],
  ]
  dotPositions.forEach(([dx, dy]) => {
    ctx.beginPath()
    ctx.arc(dx, dy, dotR, 0, Math.PI * 2)
    ctx.fill()
  })
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

// ─── 像素风格汉字图标 ──────────────────────────────────────────────────────────
/**
 * 将单个汉字渲染为像素风格方块图标
 * @param {string} char - 单个汉字
 * @param {object} opts - { bgColor, textColor, pixelSize }
 */
function drawPixelChar(ctx, size, char, opts = {}) {
  const {
    bgColor = '#1a1040',
    textColor = '#ffffff',
    pixelSize = 8,   // 像素块大小（越大越像素风）
  } = opts

  const s = size

  // Step 1: 小画布渲染文字
  const smallSize = Math.floor(s / pixelSize)
  const offCanvas = document.createElement('canvas')
  offCanvas.width = smallSize
  offCanvas.height = smallSize
  const offCtx = offCanvas.getContext('2d')

  // 填充背景
  offCtx.fillStyle = bgColor
  offCtx.fillRect(0, 0, smallSize, smallSize)

  // 渲染文字
  offCtx.fillStyle = textColor
  offCtx.font = `bold ${Math.floor(smallSize * 0.78)}px "LXGW WenKai", "Microsoft YaHei", sans-serif`
  offCtx.textAlign = 'center'
  offCtx.textBaseline = 'middle'
  offCtx.imageSmoothingEnabled = false
  offCtx.fillText(char, smallSize / 2, smallSize / 2)

  // Step 2: 读取像素数据，在主画布上画放大的像素块
  const imageData = offCtx.getImageData(0, 0, smallSize, smallSize)
  const data = imageData.data

  // 主画布背景
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, s, s)

  // 略微圆角背景框
  ctx.fillStyle = 'rgba(255,255,255,0.03)'
  roundRect(ctx, s * 0.04, s * 0.04, s * 0.92, s * 0.92, s * 0.1)
  ctx.fill()

  // 绘制像素块
  for (let py = 0; py < smallSize; py++) {
    for (let px = 0; px < smallSize; px++) {
      const idx = (py * smallSize + px) * 4
      const r = data[idx]
      const g = data[idx + 1]
      const b = data[idx + 2]
      const a = data[idx + 3]
      if (a > 40) {
        // 文字区域
        ctx.fillStyle = `rgba(${r},${g},${b},${(a / 255).toFixed(2)})`
        ctx.fillRect(px * pixelSize, py * pixelSize, pixelSize - 1, pixelSize - 1)
      }
    }
  }
}

// ─── 公开接口 ─────────────────────────────────────────────────────────────────

/**
 * 创建指定类型的图标，返回 base64 PNG 字符串
 * @param {'d20'|'d6'|string} type - 'D20' / 'D6' / 单个汉字
 */
export function generatePresetIcon(type) {
  const canvas = document.createElement('canvas')
  canvas.width = ICON_SIZE
  canvas.height = ICON_SIZE
  const ctx = canvas.getContext('2d')

  if (type === 'd20') {
    drawD20(ctx, ICON_SIZE)
  } else if (type === 'd6') {
    drawD6(ctx, ICON_SIZE)
  } else {
    // 单个汉字 - 根据字符选配色
    const charPalettes = {
      '顶': { bgColor: '#1a0a2e', textColor: '#f0b840' },
      '赞': { bgColor: '#0a1e0a', textColor: '#5adf5a' },
      '绝': { bgColor: '#1e0a0a', textColor: '#ff6060' },
      '帅': { bgColor: '#0a0e1e', textColor: '#60a0ff' },
      '炸': { bgColor: '#1e1000', textColor: '#ff9020' },
      '懵': { bgColor: '#1a1a1a', textColor: '#c0c0e0' },
    }
    const palette = charPalettes[type] || { bgColor: '#12102a', textColor: '#e0d4ff' }
    drawPixelChar(ctx, ICON_SIZE, type, palette)
  }

  return canvas.toDataURL('image/png')
}

/**
 * 预设图标列表
 */
export const PRESET_ICONS = [
  { id: 'd20', label: 'D20', desc: '二十面骰' },
  { id: 'd6', label: 'D6', desc: '六面骰' },
  { id: '顶', label: '顶', desc: '像素汉字' },
  { id: '赞', label: '赞', desc: '像素汉字' },
  { id: '绝', label: '绝', desc: '像素汉字' },
  { id: '帅', label: '帅', desc: '像素汉字' },
  { id: '炸', label: '炸', desc: '像素汉字' },
  { id: '懵', label: '懵', desc: '像素汉字' },
]
