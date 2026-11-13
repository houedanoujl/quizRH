// Administration : vérification du code PIN (empreinte scrypt), blocage après 5 erreurs
// et nom de l'appareil. Les essais ratés sont écrits sur le disque : redémarrer
// l'application ne remet pas le compteur à zéro.
const crypto = require('node:crypto')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const MAX_ESSAIS = 5
const BLOCAGE_MS = 5 * 60_000

const lire = (file, defaut) => {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return defaut }
}
const ecrire = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(value), 'utf8')
}

// pinFile : empreinte écrite au build (scripts/borne-pin.mjs). Absente : administration désactivée.
function createAdmin ({ pinFile, dataDir }) {
  const empreinte = lire(pinFile, null)
  const actif = !!(empreinte?.sel && empreinte?.hash)
  const essaisFile = path.join(dataDir, 'admin-essais.json')
  const configFile = path.join(dataDir, 'config.json')

  let ouvert = false
  let essais = { n: 0, jusqua: 0, ...lire(essaisFile, {}) }
  let config = { appareil: os.hostname(), ...lire(configFile, {}) }

  const noter = suivant => {
    essais = suivant
    try { ecrire(essaisFile, essais) } catch (error) { console.error('admin-essais.json :', error) }
  }

  return {
    status: () => ({ actif, appareil: config.appareil }),
    estOuvert: () => ouvert,
    lock () { ouvert = false },
    unlock (pin) {
      if (!actif) return { ok: false, code: 'DESACTIVE' }
      if (Date.now() < essais.jusqua) return { ok: false, code: 'BLOQUE' }
      const attendu = Buffer.from(empreinte.hash, 'hex')
      const recu = crypto.scryptSync(String(pin ?? ''), Buffer.from(empreinte.sel, 'hex'), attendu.length, empreinte.params)
      if (crypto.timingSafeEqual(recu, attendu)) {
        if (essais.n || essais.jusqua) noter({ n: 0, jusqua: 0 })
        ouvert = true
        return { ok: true }
      }
      const n = essais.n + 1
      noter(n >= MAX_ESSAIS ? { n: 0, jusqua: Date.now() + BLOCAGE_MS } : { n, jusqua: 0 })
      return { ok: false, code: n >= MAX_ESSAIS ? 'BLOQUE' : 'INCORRECT' }
    },
    setAppareil (nom) {
      if (!ouvert) return { ok: false, code: 'VERROUILLE' }
      const appareil = String(nom ?? '').trim().slice(0, 40)
      if (!appareil) return { ok: false, code: 'NOM_VIDE' }
      try {
        ecrire(configFile, { ...config, appareil })
      } catch (error) {
        console.error('config.json :', error)
        return { ok: false, code: 'ECRITURE_IMPOSSIBLE' }
      }
      config = { ...config, appareil }
      return { ok: true, appareil }
    }
  }
}

module.exports = { createAdmin }
