<script setup>
// Partage des résultats, repris de la carte souvenir de « La centrale du futur » :
// LinkedIn en premier, puis WhatsApp, Facebook, X, partage natif et téléchargement.
// L'image est la capture de la zone de résultats (html2canvas).
const props = defineProps({
  departement: { type: String, required: true },
  skills: { type: Array, default: () => [] }, // libellés des soft skills les plus marquées
  target: { type: String, default: 'capture-zone' }, // id de l'élément à capturer
})

const FILE_NAME = 'resultats-ciprel.png'
const blob = ref(null)
const message = ref('')
const canNative = ref(false)

const siteUrl = computed(() => (import.meta.client ? window.location.origin : ''))
const text = computed(() => {
  const top = props.skills.filter(Boolean)
  const skills = top.length ? `, avec ${top.join(' et ')} comme soft skills les plus marquées` : ''
  return `J'ai fait le questionnaire d'orientation de CIPREL : le département qui me correspond est ${props.departement}${skills}. ` +
    `18 questions oui/non pour découvrir le vôtre : ${siteUrl.value} ` +
    '#CIPREL #RessourcesHumaines #CôteDIvoire #Abidjan'
})

async function render () {
  const element = document.getElementById(props.target)
  if (!element) return null
  const html2canvas = (await import('html2canvas')).default
  const canvas = await html2canvas(element, { useCORS: true, scale: 2, backgroundColor: '#e6f3f9' })
  return new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
}
// Capture préparée à l'avance : le partage natif doit suivre le clic sans attente.
async function ensureBlob () {
  if (!blob.value) blob.value = await render()
  return blob.value
}
const toFile = b => new File([b], FILE_NAME, { type: 'image/png' })

onMounted(async () => {
  await document.fonts?.ready
  const b = await ensureBlob()
  canNative.value = !!(b && navigator.canShare?.({ files: [toFile(b)] }))
})

async function download () {
  const b = await ensureBlob()
  if (!b) return false
  const url = URL.createObjectURL(b)
  const a = document.createElement('a')
  a.href = url
  a.download = FILE_NAME
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return true
}
async function copyText () {
  try { await navigator.clipboard.writeText(text.value); return true } catch { return false }
}
async function nativeShare () {
  const b = await ensureBlob()
  try {
    await navigator.share({ files: [toFile(b)], text: text.value, title: 'Mes résultats CIPREL' })
    message.value = 'Résultats partagés.'
  } catch (e) {
    if (e?.name !== 'AbortError') message.value = 'Partage impossible depuis cet appareil : téléchargez vos résultats.'
  }
}

const open = url => window.open(url, '_blank', 'noopener,noreferrer,width=640,height=720')

async function share (network) {
  const t = encodeURIComponent(text.value)
  const u = encodeURIComponent(siteUrl.value)
  if (network === 'linkedin') {
    // Sur téléphone, le partage natif envoie l'image directement dans l'application LinkedIn.
    if (canNative.value) return nativeShare()
    // Sur ordinateur, LinkedIn ne reçoit pas d'image par lien : on prépare le texte
    // et l'image, puis on ouvre l'éditeur de publication.
    const copied = await copyText()
    await download()
    open(`https://www.linkedin.com/feed/?shareActive=true&text=${t}`)
    message.value = `Image téléchargée${copied ? ' et texte copié' : ''} : dans LinkedIn, ajoutez l'image à votre publication (icône photo).`
  } else if (network === 'whatsapp') {
    open(`https://wa.me/?text=${t}`)
  } else if (network === 'facebook') {
    open(`https://www.facebook.com/sharer/sharer.php?u=${u}`)
  } else if (network === 'x') {
    open(`https://x.com/intent/post?text=${t}`)
  }
}
async function onCopy () {
  message.value = (await copyText()) ? 'Texte copié.' : 'Copie impossible : sélectionnez le texte ci-dessus.'
}
async function onDownload () {
  message.value = (await download()) ? 'Image téléchargée.' : 'Téléchargement impossible pour le moment.'
}
</script>

<template>
  <section class="share" aria-labelledby="share-title">
    <h2 id="share-title">Partager mes résultats</h2>
    <div class="buttons">
      <button class="btn linkedin" type="button" @click="share('linkedin')">
        <SocialIcon name="linkedin" :size="22" ink="#0a66c2" />Partager sur LinkedIn
      </button>
      <div class="others">
        <button class="btn ghost icon" type="button" aria-label="Partager sur WhatsApp" @click="share('whatsapp')"><SocialIcon name="whatsapp" :size="22" /></button>
        <button class="btn ghost icon" type="button" aria-label="Partager sur Facebook" @click="share('facebook')"><SocialIcon name="facebook" :size="22" /></button>
        <button class="btn ghost icon" type="button" aria-label="Partager sur X" @click="share('x')"><SocialIcon name="x" :size="22" /></button>
        <button v-if="canNative" class="btn ghost icon" type="button" aria-label="Autres applications" @click="nativeShare"><AppIcon name="share" :size="20" /></button>
        <button class="btn ghost icon" type="button" aria-label="Télécharger mes résultats" @click="onDownload"><AppIcon name="download" :size="20" /></button>
      </div>
    </div>
    <details class="text">
      <summary>Texte proposé</summary>
      <p>{{ text }}</p>
      <button class="btn ghost" type="button" @click="onCopy">Copier le texte</button>
    </details>
    <p v-if="message" class="msg" role="status">{{ message }}</p>
  </section>
</template>

<style scoped>
.share { display: grid; gap: 12px; padding: 16px 18px; border-radius: var(--radius); background: var(--tray); border: 2px solid var(--line); }
.share h2 { font-size: 1.15rem; font-weight: 800; }
.buttons { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
.btn.linkedin { background: #0a66c2; color: #fff; border-color: #073f78; }
.btn.linkedin:hover { background: #0854a0; }
.others { display: flex; gap: 8px; flex-wrap: wrap; }
.others .btn { color: var(--ink); }
.text summary { cursor: pointer; font-weight: 700; color: var(--ink-2); }
.text p { margin: 8px 0; font-size: .95rem; background: var(--surface); border-radius: 12px; padding: 10px 12px; border: 1px solid var(--line); }
.msg { font-weight: 700; color: var(--ok); }
@media (min-width: 768px) {
  .share { padding: 20px 30px; }
}
</style>
