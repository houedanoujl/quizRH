// Métiers proposés et matrice « 2 soft skills dominantes → métier ».
// Chaque métier reçoit 3 des 15 paires possibles : les 5 métiers peuvent sortir.
// `texte` : présentation du métier affichée avec le résultat (à fournir par CIPREL).
export const METIERS = {
  rh: { label: 'Ressources Humaines', texte: '' },
  production: { label: 'Production', texte: '' },
  maintenance: { label: 'Maintenance', texte: '' },
  qualite: { label: 'Qualité', texte: '' },
  comptabilite: { label: 'Comptabilité', texte: '' },
}

export const PAIRES = {
  rh: [['forceCollective', 'convivialite'], ['equite', 'convivialite'], ['respect', 'convivialite']],
  production: [['forceCollective', 'innovation'], ['engagement', 'innovation'], ['innovation', 'convivialite']],
  maintenance: [['forceCollective', 'engagement'], ['forceCollective', 'respect'], ['engagement', 'convivialite']],
  qualite: [['engagement', 'respect'], ['respect', 'innovation'], ['equite', 'innovation']],
  comptabilite: [['equite', 'respect'], ['equite', 'engagement'], ['forceCollective', 'equite']],
}

const cle = (a, b) => [a, b].sort().join('+')

const MATRICE = Object.fromEntries(
  Object.entries(PAIRES).flatMap(([metier, paires]) => paires.map(([a, b]) => [cle(a, b), metier]))
)

// Renvoie la clé du métier correspondant aux deux soft skills dominantes.
export const metierPour = (a, b) => MATRICE[cle(a, b)] ?? null
