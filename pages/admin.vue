<script setup>
// Administration de la borne : nombre de participants, export CSV (clé USB), fermeture.
// Accès : 5 tapes rapides sur le logo, puis code PIN (BORNE_ADMIN_PIN, obligatoire au build).
import { QUESTIONS } from '~/data/questions'
import { participantsCsv } from '~/utils/csv'

const { adminPin } = useRuntimeConfig().public
const borne = useBorne()

const pin = ref('')
const pinError = ref('')
const unlocked = ref(false)
const count = ref(0)
const message = ref('')
const busy = ref(false)

const refresh = async () => { count.value = (await borne.list()).length }

// Saisie au doigt : 5 erreurs bloquent l'accès 5 minutes (compteur gardé entre deux visites).
const MAX_ESSAIS = 5
const BLOCAGE_MS = 5 * 60_000
const essais = useState('admin-essais', () => ({ n: 0, jusqua: 0 }))
const actif = !!String(adminPin || '')

const unlock = async () => {
  if (!actif) return
  if (Date.now() < essais.value.jusqua) {
    pinError.value = 'Trop d\'essais. Réessayez dans quelques minutes.'
    pin.value = ''
    return
  }
  if (pin.value === String(adminPin)) {
    essais.value = { n: 0, jusqua: 0 }
    unlocked.value = true
    pinError.value = ''
    await refresh()
  } else {
    essais.value.n++
    if (essais.value.n >= MAX_ESSAIS) essais.value = { n: 0, jusqua: Date.now() + BLOCAGE_MS }
    pinError.value = 'Code incorrect.'
    pin.value = ''
  }
}

const exporter = async () => {
  busy.value = true
  message.value = ''
  try {
    const list = await borne.list()
    const stamp = new Date().toISOString().slice(0, 16).replace(/[-:]/g, '').replace('T', '-')
    const res = await borne.saveFile(`participants-ciprel-${stamp}.csv`, participantsCsv(list, QUESTIONS))
    message.value = res?.ok ? `${list.length} participant${list.length > 1 ? 's' : ''} exporté${list.length > 1 ? 's' : ''} : ${res.path}` : 'Export annulé.'
  } catch (error) {
    console.error(error)
    message.value = 'Export impossible.'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="page">
    <AppHeader title="Administration de la borne" />

    <section v-if="!actif" class="box panel">
      <p>Administration désactivée : aucun code PIN n'a été défini lors de la construction de l'application.</p>
      <div class="row">
        <NuxtLink to="/" class="btn ghost"><AppIcon name="home" :size="18" />Accueil</NuxtLink>
      </div>
    </section>

    <form v-else-if="!unlocked" class="box panel" @submit.prevent="unlock">
      <label for="pin">Code PIN</label>
      <input id="pin" v-model="pin" type="password" inputmode="numeric" autocomplete="off" required>
      <p v-if="pinError" class="error" role="alert">{{ pinError }}</p>
      <div class="row">
        <button class="btn" type="submit">Valider</button>
        <NuxtLink to="/" class="btn ghost"><AppIcon name="home" :size="18" />Accueil</NuxtLink>
      </div>
    </form>

    <section v-else class="box panel">
      <p class="count"><strong>{{ count }}</strong> participant{{ count > 1 ? 's' : '' }} enregistré{{ count > 1 ? 's' : '' }}</p>
      <p v-if="!borne.native" class="hint">Mode navigateur : les données sont dans le stockage local de ce navigateur.</p>
      <div class="row">
        <button class="btn" type="button" :disabled="busy" @click="exporter">
          <AppIcon name="download" :size="18" />Exporter en CSV
        </button>
        <NuxtLink to="/" class="btn ghost"><AppIcon name="home" :size="18" />Accueil</NuxtLink>
        <button v-if="borne.native" class="btn ghost" type="button" @click="borne.quit()">
          <AppIcon name="cross" :size="18" />Quitter l'application
        </button>
      </div>
      <p v-if="message" class="msg" role="status">{{ message }}</p>
    </section>
  </div>
</template>

<style scoped>
.box { padding: 24px; display: grid; gap: 14px; max-width: 640px; width: 100%; margin: 0 auto; }
label { font-family: var(--font-display); font-weight: 700; font-size: 1.1rem; }
input {
  min-height: 54px; padding: 10px 14px; border-radius: 14px; border: 2px solid var(--line); background: var(--tray);
  font: inherit; font-size: 1.4rem; letter-spacing: .3em; color: var(--ink);
}
.row { display: flex; flex-wrap: wrap; gap: 10px; }
.count { font-size: 1.3rem; }
.count strong { font-family: var(--font-display); font-size: 2rem; }
.hint { color: var(--ink-2); }
.error { color: var(--bad); font-weight: 700; }
.msg { font-weight: 700; color: var(--ok); word-break: break-all; }
</style>
