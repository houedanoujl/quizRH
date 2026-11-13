// Métiers proposés et matrice « 2 soft skills dominantes → métier ».
// Chaque métier reçoit 3 des 15 paires possibles : les 5 métiers peuvent sortir.
// Matrice validée par CIPREL le 13/11/2026.
export const METIERS = {
  rh: { label: 'Ressources Humaines' },
  production: { label: 'Production' },
  maintenance: { label: 'Maintenance' },
  qualite: { label: 'Qualité' },
  comptabilite: { label: 'Comptabilité' },
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
