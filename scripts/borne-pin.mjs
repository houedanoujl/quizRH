// Écrit l'empreinte du code PIN de l'administration dans electron/admin-pin.json.
// Le PIN lui-même n'est embarqué nulle part dans l'application.
//   BORNE_ADMIN_PIN=123456 node scripts/borne-pin.mjs
import { randomBytes, scryptSync } from 'node:crypto'
import { writeFileSync } from 'node:fs'

// Pas de valeur par défaut : un PIN connu ouvrirait l'export des données des participants.
const pin = String(process.env.BORNE_ADMIN_PIN || '')
if (!/^\d{4,8}$/.test(pin)) {
  console.error('BORNE_ADMIN_PIN manquant ou invalide (4 à 8 chiffres) : BORNE_ADMIN_PIN=xxxxxx yarn borne:build')
  process.exit(1)
}

const params = { N: 2 ** 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }
const sel = randomBytes(16)
const hash = scryptSync(pin, sel, 32, params)

writeFileSync(
  new URL('../electron/admin-pin.json', import.meta.url),
  JSON.stringify({ sel: sel.toString('hex'), hash: hash.toString('hex'), params }) + '\n'
)
console.log(`electron/admin-pin.json : empreinte du PIN écrite (${pin.length} chiffres)`)
