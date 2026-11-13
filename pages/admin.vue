<script setup>
// Administration de l'appareil : nombre de participants, nom de l'appareil, export CSV (clé USB), fermeture.
// Accès : 5 tapes rapides sur le logo, puis code PIN. Le PIN est vérifié par l'application
// (electron/admin.cjs) : 5 erreurs bloquent l'accès 5 minutes, même après un redémarrage.
import { QUESTIONS } from '~/data/questions'
import { participantsCsv } from '~/utils/csv'

const borne = useBorne()

const pin = ref('')
const pinError = ref('')
const actif = ref(null) // null : état pas encore connu
const unlocked = ref(false)
const count = ref(0)
const appareil = ref('')
const message = ref('')
const busy = ref(false)

const refresh = async () => { count.value = (await borne.list()).length }

onMounted(async () => {
  const status = await borne.adminStatus()
  actif.value = !!status.actif
  appareil.value = status.appareil || ''
})
onBeforeUnmount(() => borne.lock())

const unlock = async () => {
  const res = await borne.unlock(pin.value)
  pin.value = ''
  if (res?.ok) {
    unlocked.value = true
    pinError.value = ''
    await refresh()
  } else {
    pinError.value = res?.code === 'BLOQUE' ? 'Trop d\'essais. Réessayez dans 5 minutes.' : 'Code incorrect.'
  }
}

const nommer = async () => {
  const res = await borne.setAppareil(appareil.value)
  if (res?.ok) appareil.value = res.appareil
  message.value = res?.ok ? `Nom de l'appareil enregistré : ${res.appareil}` : 'Nom non enregistré.'
}

const exporter = async () => {
  busy.value = true
  message.value = ''
  try {
    const list = await borne.list()
    const stamp = new Date().toISOString().slice(0, 16).replace(/[-:]/g, '').replace('T', '-')
    const nom = appareil.value.normalize('NFD').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'appareil'
    const res = await borne.saveFile(`participants-ciprel-${nom}-${stamp}.csv`, participantsCsv(list, QUESTIONS, appareil.value))
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
    <AppHeader title="Administration" />

    <section v-if="actif === false" class="box panel">
      <p>Administration désactivée : aucun code PIN n'a été défini lors de la construction de l'application.</p>
      <div class="row">
        <NuxtLink to="/" class="btn ghost"><AppIcon name="home" :size="18" />Accueil</NuxtLink>
      </div>
    </section>

    <form v-else-if="actif && !unlocked" class="box panel" @submit.prevent="unlock">
      <label for="pin">Code PIN</label>
      <input id="pin" v-model="pin" type="password" inputmode="numeric" autocomplete="off" required>
      <p v-if="pinError" class="error" role="alert">{{ pinError }}</p>
      <div class="row">
        <button class="btn" type="submit">Valider</button>
        <NuxtLink to="/" class="btn ghost"><AppIcon name="home" :size="18" />Accueil</NuxtLink>
      </div>
    </form>

    <section v-else-if="unlocked" class="box panel">
      <p class="count"><strong>{{ count }}</strong> participant{{ count > 1 ? 's' : '' }} enregistré{{ count > 1 ? 's' : '' }}</p>
      <p v-if="!borne.native" class="hint">Mode navigateur : les données sont dans le stockage local de ce navigateur.</p>
      <form class="name" @submit.prevent="nommer">
        <label for="appareil">Nom de cet appareil</label>
        <div class="row">
          <input id="appareil" v-model="appareil" type="text" maxlength="40" autocomplete="off" required>
          <button class="btn ghost" type="submit">Enregistrer</button>
        </div>
        <p class="hint">Exemples : Borne, Tablette 1, Tablette 2. Ce nom figure dans le fichier exporté.</p>
      </form>
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
.name { display: grid; gap: 8px; }
.name input { flex: 1 1 220px; font-size: 1.1rem; letter-spacing: 0; }
.count { font-size: 1.3rem; }
.count strong { font-family: var(--font-display); font-size: 2rem; }
.hint { color: var(--ink-2); }
.error { color: var(--bad); font-weight: 700; }
.msg { font-weight: 700; color: var(--ok); word-break: break-all; }
</style>
