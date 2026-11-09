<script setup>
// Compte à rebours du quiz, calculé depuis l'horodatage de départ (pas de dérive des intervalles).
const props = defineProps({
  startedAt: { type: Number, required: true }, // ms (Date.now())
  duration: { type: Number, required: true },  // secondes
  stopped: { type: Boolean, default: false },
})
const emit = defineEmits(['expire'])

const now = ref(Date.now())
const remainingMs = computed(() => Math.max(0, props.duration * 1000 - (now.value - props.startedAt)))
const seconds = computed(() => Math.ceil(remainingMs.value / 1000))
const label = computed(() => `${Math.floor(seconds.value / 60)}:${String(seconds.value % 60).padStart(2, '0')}`)
const level = computed(() => (seconds.value <= 10 ? 'danger' : seconds.value <= 20 ? 'warn' : ''))

// Annonces lecteur d'écran aux paliers seulement.
const announce = ref('')
watch(seconds, s => {
  if (s === 60) announce.value = 'Plus qu\'une minute.'
  else if (s === 30) announce.value = 'Plus que 30 secondes.'
  else if (s === 10) announce.value = 'Plus que 10 secondes.'
})

let timer = null
let expired = false
const stop = () => { clearInterval(timer); timer = null }
const tick = () => {
  now.value = Date.now()
  if (!expired && remainingMs.value === 0) {
    expired = true
    stop()
    emit('expire')
  }
}
onMounted(() => {
  if (props.stopped) return
  tick()
  timer = setInterval(tick, 250)
})
watch(() => props.stopped, s => { if (s) stop() })
onBeforeUnmount(stop)
</script>

<template>
  <span class="chip timer" :class="level" role="timer" :aria-label="`Temps restant : ${label}`">
    <AppIcon name="clock" :size="20" />{{ label }}
  </span>
  <span class="sr-only" aria-live="polite">{{ announce }}</span>
</template>

<style scoped>
.timer { min-width: 104px; justify-content: center; font-size: 1.3rem; border-color: var(--ink); border-width: 3px; }
.timer.warn { background: var(--orange-tint); border-color: var(--orange-ink); color: var(--orange-ink); }
.timer.danger { background: var(--bad); border-color: var(--bad); color: #fff; animation: pulse 1s ease-in-out infinite; }
@keyframes pulse { 50% { transform: scale(1.06); } }
</style>
