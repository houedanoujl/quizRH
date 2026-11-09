<script setup>
// QR code généré sur la borne (hors ligne) : il contient le texte des résultats.
// Le visiteur le scanne avec l'appareil photo de son téléphone pour garder ses résultats.
import QRCode from 'qrcode'

const props = defineProps({
  text: { type: String, required: true },
})

const svg = ref('')
watchEffect(async () => {
  try {
    svg.value = await QRCode.toString(props.text, { type: 'svg', errorCorrectionLevel: 'M', margin: 2, color: { dark: '#1f2832', light: '#ffffff' } })
  } catch (error) {
    console.error('QR code impossible :', error)
    svg.value = ''
  }
})
</script>

<template>
  <section v-if="svg" class="qr panel" aria-labelledby="qr-title">
    <div class="code" role="img" aria-label="QR code de vos résultats" v-html="svg" />
    <div class="legend">
      <h2 id="qr-title">Gardez vos résultats</h2>
      <p>Scannez ce code avec l'appareil photo de votre téléphone.</p>
    </div>
  </section>
</template>

<style scoped>
.qr { padding: 18px; display: grid; gap: 12px; justify-items: center; align-content: center; text-align: center; border: 3px solid var(--ink); }
.code { width: min(260px, 70vw); aspect-ratio: 1; }
.code :deep(svg) { width: 100%; height: 100%; display: block; }
.legend { display: grid; gap: 4px; }
.legend h2 { font-size: 1.25rem; font-weight: 800; }
.legend p { color: var(--ink-2); font-weight: 600; max-width: 26ch; }
</style>
