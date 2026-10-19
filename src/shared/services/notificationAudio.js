// Notification sound generator using Web Audio API
// This avoids external MP3 assets, CORS problems, or missing sound files.

let audioCtx = null

function getAudioContext() {
  if (typeof window === 'undefined') return null
  const AudioContext = window.AudioContext || window.webkitAudioContext
  if (!AudioContext) return null

  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new AudioContext()
  }
  return audioCtx
}

export function playNotificationChime() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    // Browsers require a user gesture before playing audio; resume if suspended
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }

    const now = ctx.currentTime

    // First harmonious ping (E5)
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(659.25, now)
    gain1.gain.setValueAtTime(0.15, now)
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.35)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.35)

    // Second higher chime (B5)
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(987.77, now + 0.1)
    gain2.gain.setValueAtTime(0.2, now + 0.1)
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.55)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.1)
    osc2.stop(now + 0.55)
  } catch (err) {
    console.debug('[notificationAudio] Audio chime skipped:', err?.message)
  }
}
