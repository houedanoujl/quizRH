// Export CSV des participants pour Excel FR : UTF-8 avec BOM, séparateur « ; ».
import { SOFT_SKILLS } from '~/data/questions'

// Saisie publique : une cellule commençant par =, @, + ou - serait lue comme une formule
// par Excel. Numéro de téléphone (+225 07…) : une espace en tête suffit à le garder en texte.
const neutraliser = s => {
  if (/^[+-][\d\s().]+$/.test(s)) return ` ${s}`
  return /^[=+\-@\t\r]/.test(s) ? `'${s}` : s
}

const cell = v => {
  const s = neutraliser(v == null ? '' : String(v))
  return /[;"\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export const toCsv = rows => '\uFEFF' + rows.map(r => r.map(cell).join(';')).join('\r\n') + '\r\n'

const dateFr = iso => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })
}
const ouiNon = v => (v === true ? 'Oui' : v === false ? 'Non' : '')

// `appareil` : nom de l'appareil qui exporte (chaque appareil n'exporte que ses propres participants).
export const participantsCsv = (participants, questions, appareil = '') => {
  const skills = Object.keys(SOFT_SKILLS)
  // Score = nombre de « oui » ; le maximum est dans l'en-tête (« 2/3 » deviendrait une date dans Excel).
  const max = s => questions.filter(q => q.categorie === s).length
  const header = [
    'Appareil', 'Date', 'Prénom', 'Nom', 'Email', 'Téléphone', 'Consentement', 'Date du consentement', 'Métier',
    ...skills.map(s => `${SOFT_SKILLS[s]} (sur ${max(s)})`),
    'Durée (s)', 'Temps écoulé',
    ...questions.map((q, i) => `Q${i + 1}`)
  ]
  const rows = participants.map(p => [
    appareil, dateFr(p.createdAt), p.prenom, p.nom, p.email, p.contact,
    p.consentement ? 'Oui' : 'Non', dateFr(p.consentementAt), p.metier,
    ...skills.map(s => p.scores?.[s]?.points ?? ''),
    p.dureeSec, p.tempsEcoule ? 'Oui' : 'Non',
    ...questions.map(q => ouiNon(p.reponses?.[q.id]))
  ])
  return toCsv([header, ...rows])
}
