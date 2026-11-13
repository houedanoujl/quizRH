// Fusionne les CSV exportés par chaque appareil (borne, tablettes) en un seul fichier.
// Aucune ligne n'est supprimée : la colonne « Doublon » nomme les autres appareils
// où la même adresse email a participé.
//   yarn fusion borne.csv tablette-1.csv tablette-2.csv   → participants-fusion.csv
import { readFileSync, writeFileSync } from 'node:fs'

const SORTIE = 'participants-fusion.csv'
const fichiers = process.argv.slice(2)
if (fichiers.length < 2) {
  console.error('Usage : yarn fusion <export-1.csv> <export-2.csv> [...]')
  process.exit(1)
}

// CSV Excel FR : séparateur « ; », cellules entre guillemets si besoin, BOM en tête.
const lire = texte => {
  const lignes = []
  let ligne = []
  let cellule = ''
  let guillemets = false
  const s = texte.replace(/^﻿/, '')
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (guillemets) {
      if (c === '"' && s[i + 1] === '"') { cellule += '"'; i++ } else if (c === '"') guillemets = false
      else cellule += c
    } else if (c === '"') guillemets = true
    else if (c === ';') { ligne.push(cellule); cellule = '' } else if (c === '\n' || c === '\r') {
      if (c === '\r' && s[i + 1] === '\n') i++
      ligne.push(cellule)
      lignes.push(ligne)
      ligne = []
      cellule = ''
    } else cellule += c
  }
  if (cellule || ligne.length) { ligne.push(cellule); lignes.push(ligne) }
  return lignes.filter(l => l.some(v => v !== ''))
}

// Les cellules viennent d'un export déjà protégé contre les formules : on ne les modifie pas.
const cell = s => (/[;"\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s)
const csv = rows => '﻿' + rows.map(r => r.map(cell).join(';')).join('\r\n') + '\r\n'

let entete = null
const lignes = []
for (const fichier of fichiers) {
  const [tete, ...reste] = lire(readFileSync(fichier, 'utf8'))
  if (!tete) throw new Error(`${fichier} : fichier vide`)
  entete ??= tete
  if (tete.join(';') !== entete.join(';')) {
    throw new Error(`${fichier} : colonnes différentes de ${fichiers[0]} (exports de versions différentes ?)`)
  }
  lignes.push(...reste)
  console.log(`${fichier} : ${reste.length} participant(s)`)
}

const iAppareil = entete.indexOf('Appareil')
const iEmail = entete.indexOf('Email')
if (iAppareil < 0 || iEmail < 0) throw new Error('Colonnes « Appareil » et « Email » introuvables')

const appareilsParEmail = new Map()
for (const l of lignes) {
  const email = l[iEmail].trim().toLowerCase()
  appareilsParEmail.set(email, [...(appareilsParEmail.get(email) ?? []), l[iAppareil]])
}

let doublons = 0
const sortie = lignes.map(l => {
  const email = l[iEmail].trim().toLowerCase()
  const autres = [...appareilsParEmail.get(email)]
  autres.splice(autres.indexOf(l[iAppareil]), 1)
  if (autres.length) doublons++
  return [...l, autres.join(', ')]
})

writeFileSync(SORTIE, csv([[...entete, 'Doublon'], ...sortie]))
const appareils = new Set(lignes.map(l => l[iAppareil]))
console.log(`${SORTIE} : ${lignes.length} participant(s), ${appareils.size} appareil(s), ${doublons} ligne(s) en doublon`)
if (appareils.size < fichiers.length) {
  console.warn('Attention : plusieurs fichiers portent le même nom d\'appareil. Nommez chaque appareil dans son administration.')
}
