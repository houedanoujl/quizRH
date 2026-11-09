// Génère les fichiers à envoyer au client dans client/ (Excel FR : UTF-8 avec BOM, séparateur « ; »).
//   node scripts/export-client.mjs
import { mkdirSync, writeFileSync } from 'node:fs'
import { QUESTIONS, SOFT_SKILLS } from '../data/questions.js'
import { METIERS, PAIRES } from '../data/metiers.js'

// Contrôle : chacune des 15 paires de soft skills mène à un seul métier.
const skills = Object.keys(SOFT_SKILLS)
const vues = new Map()
for (const [metier, paires] of Object.entries(PAIRES)) {
  for (const p of paires) {
    const k = [...p].sort().join('+')
    if (vues.has(k)) throw new Error(`Paire ${k} attribuée deux fois (${vues.get(k)}, ${metier})`)
    vues.set(k, metier)
  }
}
const attendues = skills.length * (skills.length - 1) / 2
if (vues.size !== attendues) throw new Error(`${vues.size} paires définies sur ${attendues}`)

const cell = v => {
  const s = v == null ? '' : String(v)
  return /[;"\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}
const csv = rows => '\uFEFF' + rows.map(r => r.map(cell).join(';')).join('\r\n') + '\r\n'

mkdirSync('client', { recursive: true })

writeFileSync('client/questions.csv', csv([
  ['N°', 'Question', 'Soft skill évaluée (« Oui » = 1 point)'],
  ...QUESTIONS.map((q, i) => [i + 1, q.texte, SOFT_SKILLS[q.categorie]]),
]))

writeFileSync('client/metiers.csv', csv([
  ['Métier', 'Recommandé quand les 2 soft skills dominantes sont', 'Texte à afficher avec le résultat (à rédiger)'],
  ...Object.entries(METIERS).map(([key, m]) => [
    m.label,
    PAIRES[key].map(([a, b]) => `${SOFT_SKILLS[a]} + ${SOFT_SKILLS[b]}`).join(' / '),
    m.texte,
  ]),
]))

console.log(`client/questions.csv : ${QUESTIONS.length} questions`)
console.log(`client/metiers.csv : ${Object.keys(METIERS).length} métiers, ${vues.size} paires`)
