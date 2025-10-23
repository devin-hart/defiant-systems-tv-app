import Blits from '@lightningjs/blits'
import Button from '../components/Button.js'

let audio = new Audio('/music/bronson.wav')
audio.crossOrigin = 'anonymous'

let audioCtx, analyser, mediaSrc, rafId
const NUM_BARS = 64
let freqData,
  idxRanges,
  frameCount = 0

// ---------------- utils ----------------
function ensureVizCanvasSize() {
  const c = document.getElementById('vizOverlay')
  if (!c) return null
  const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
  // physical pixels for sharpness
  c.width = Math.round(1920 * dpr)
  c.height = Math.round(1080 * dpr)
  // CSS pixels (layout size)
  c.style.width = '1920px'
  c.style.height = '1080px'
  const ctx = c.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0) // normalize drawing to CSS pixels
  return ctx
}

function makeLogRanges(numBars, binCount) {
  const stops = new Array(numBars + 1)
  for (let i = 0; i <= numBars; i++) {
    const t = i / numBars
    const exp = Math.pow(10, t) - 1
    const norm = exp / 9
    stops[i] = Math.min(binCount - 1, Math.round(norm * (binCount - 1)))
  }
  const ranges = new Array(numBars)
  for (let i = 0; i < numBars; i++) {
    const a = stops[i]
    const b = Math.max(a, stops[i + 1])
    ranges[i] = [a, b]
  }
  return ranges
}
function avgRange(arr, a, b) {
  let sum = 0,
    n = 0
  for (let i = a; i <= b; i++) {
    sum += arr[i]
    n++
  }
  return n ? sum / n : 0
}

// Overlay canvas helpers
function getVizCtx() {
  const c = document.getElementById('vizOverlay')
  return c ? c.getContext('2d') : null
}

// Draw bars with smoothing + gradient
function drawBars(ctx, values) {
  if (!drawBars.prev) drawBars.prev = new Float32Array(values)
  const prev = drawBars.prev
  for (let i = 0; i < values.length; i++) {
    prev[i] = prev[i] + (values[i] - prev[i]) * 0.3 // easing
  }

  const W = ctx.canvas.width,
    H = ctx.canvas.height
  const N = prev.length
  const bw = W / N

  ctx.clearRect(0, 0, W, H)

  // faint background glow (shifted to synthwave hue)
  ctx.fillStyle = 'rgba(255, 45, 149, 0.00)' // pink haze
  ctx.fillRect(0, 0, W, H)

  // synthwave gradient: yellow → orange → pink (top→bottom)
  const g = ctx.createLinearGradient(0, 0, 0, H)
  g.addColorStop(0.0, '#FFD166') // yellow
  g.addColorStop(0.5, '#FF7F11') // orange
  g.addColorStop(1.0, '#FF2D95') // pink
  ctx.fillStyle = g

  // neon glow pass
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  ctx.shadowBlur = 18
  ctx.shadowColor = 'rgba(255, 45, 149, 0.35)'

  // draw bars
  for (let i = 0; i < N; i++) {
    const h = Math.max(2, Math.round(prev[i] * prev[i] * H))
    const x = i * bw,
      y = H - h
    ctx.fillRect(x, y, bw - 2, h)
  }
  ctx.restore()
}

// keep overlay crisp on resize
window.addEventListener('resize', ensureVizCanvasSize)

export default Blits.Component('Home', {
  components: { Button },

  template: `
      <Element w="1920" h="1080" z="100">
      <Element src="assets/defisys.png" w="534" h="69" x="10" y="110" />
      <Button ref="btn1" w="300" textAlign="left" x="10" y="80"  buttonText=".//bronson" />
      <Button ref="btn2" w="300" textAlign="left" x="10" y="150" buttonText=".//c_nail" />
      <Button ref="btn3" w="300" textAlign="left" x="10" y="220" buttonText=".//neo_industrial_complex" />
      <Button ref="btn4" w="300" textAlign="left" x="10" y="290" buttonText=".//tech_noir" />
      <Element src="assets/cybergirl3.png" w="1920" h="1280" x="0" y="0" />
    </Element>
  `,

  state() {
    return {
      focusIndex: 0,
      songs: ['bronson.mp3', 'coke-nail.mp3', 'neo-industrial-complex.mp3', 'tech-noir.mp3'],
      isPaused: false,
    }
  },

  methods: {
    ensureAudioGraph() {
      if (!audioCtx) {
        const AC = window.AudioContext || window.webkitAudioContext
        audioCtx = new AC()
      }
      if (!analyser) {
        analyser = audioCtx.createAnalyser()
        analyser.fftSize = 1024
        analyser.smoothingTimeConstant = 0.6
        analyser.minDecibels = -100
        analyser.maxDecibels = -20
      }
      if (!mediaSrc) {
        mediaSrc = audioCtx.createMediaElementSource(audio)
        mediaSrc.connect(analyser)
        analyser.connect(audioCtx.destination)
      }

      freqData = new Uint8Array(analyser.frequencyBinCount)
      idxRanges = makeLogRanges(NUM_BARS, analyser.frequencyBinCount)
    },

    reconnectForNewAudio() {
      if (mediaSrc) {
        try {
          mediaSrc.disconnect()
        } catch {}
        mediaSrc = null
      }
      this.ensureAudioGraph()
    },

    startLoop() {
      ensureVizCanvasSize()
      if (!rafId) rafId = requestAnimationFrame(() => this.tick())
    },

    tick() {
      const ctx = getVizCtx()
      if (!analyser || !ctx) {
        rafId = requestAnimationFrame(() => this.tick())
        return
      }

      analyser.getByteFrequencyData(freqData)

      // normalized boosted values
      const boost = 2.5,
        floor = 0.02
      const vals = new Array(NUM_BARS)
      for (let i = 0; i < NUM_BARS; i++) {
        const [a, b] = idxRanges[i]
        const k = Math.max(a, Math.min(b, b - 1))
        let v = freqData[k] / 255
        v = Math.max(0, v - floor) * boost
        v = Math.min(1, Math.sqrt(v))
        vals[i] = v
      }

      drawBars(ctx, vals)
      rafId = requestAnimationFrame(() => this.tick())
    },
  },

  input: {
    down(e) {
      e.preventDefault()
      if (this.focusIndex < 4) {
        this.focusIndex++
        const button = this.$select(`btn${this.focusIndex}`)
        if (button) button.$focus()
      }
    },
    up(e) {
      e.preventDefault()
      if (this.focusIndex > 1) {
        this.focusIndex--
        const button = this.$select(`btn${this.focusIndex}`)
        if (button) button.$focus()
      }
    },

    async enter(e) {
      e.preventDefault()
      audio.pause()
      audio.currentTime = 0
      audio = new Audio(`/music/${this.songs[this.focusIndex - 1]}`)
      audio.crossOrigin = 'anonymous'

      this.reconnectForNewAudio()

      audio.addEventListener('play', async () => {
        try {
          await audioCtx?.resume?.()
        } catch {}
        this.startLoop()
      })

      try {
        await audioCtx?.resume?.()
      } catch {}
      this.ensureAudioGraph()
      this.startLoop()
      audio.play()
    },

    async space(e) {
      e.preventDefault()
      if (!this.isPaused) {
        this.isPaused = true
        audio.pause()
      } else {
        this.isPaused = false
        try {
          await audioCtx.resume()
        } catch {}
        audio.play()
      }
    },
  },
})
