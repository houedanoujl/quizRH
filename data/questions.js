// Les 18 questions oui/non du quiz (reprises de supabase/migrations/0001_ciprel_quiz.sql).
// « Oui » rapporte 1 point à la soft skill de la question, « Non » 0 point.
export const QUESTIONS = [
  { id: 1, texte: 'Face à un défi complexe, préférez-vous chercher la solution avec d\'autres ?', image: '/images/questions/1a.webp', categorie: 'forceCollective' },
  { id: 2, texte: 'En cas de conflit, cherchez-vous une solution juste pour toutes les parties, même si elle prend plus de temps ?', image: '/images/questions/2a.webp', categorie: 'equite' },
  { id: 3, texte: 'Un objectif ambitieux vous donne-t-il envie de vous dépasser ?', image: '/images/questions/3a.webp', categorie: 'engagement' },
  { id: 4, texte: 'Quand une nouvelle procédure est mise en place, la suivez-vous scrupuleusement ?', image: '/images/questions/4a.webp', categorie: 'respect' },
  { id: 5, texte: 'Pour résoudre un problème, aimez-vous essayer de nouvelles approches ?', image: '/images/questions/5a.webp', categorie: 'innovation' },
  { id: 6, texte: 'En réunion, partagez-vous volontiers vos idées ?', image: '/images/questions/6a.webp', categorie: 'convivialite' },
  { id: 7, texte: 'Êtes-vous plus motivé·e par un objectif commun que par une contribution individuelle ?', image: '/images/questions/7a.webp', categorie: 'forceCollective' },
  { id: 8, texte: 'Pour attribuer des ressources, privilégiez-vous un partage équitable entre tous ?', image: '/images/questions/8a.webp', categorie: 'equite' },
  { id: 9, texte: 'Après une réussite, avez-vous envie de relever un défi encore plus grand ?', image: '/images/questions/9a.webp', categorie: 'engagement' },
  { id: 10, texte: 'Face à une nouvelle technologie, aimez-vous en explorer toutes les fonctionnalités ?', image: '/images/questions/10a.webp', categorie: 'innovation' },
  { id: 11, texte: 'Quand votre idée est rejetée, cherchez-vous un compromis avec les autres ?', image: '/images/questions/11b.webp', categorie: 'convivialite' },
  { id: 12, texte: 'Préférez-vous présenter un travail en équipe plutôt que seul·e ?', image: '/images/questions/12a.webp', categorie: 'forceCollective' },
  { id: 13, texte: 'Dans une équipe, veillez-vous à ce que chacun ait les mêmes opportunités ?', image: '/images/questions/13a.webp', categorie: 'equite' },
  { id: 14, texte: 'Quand vous commencez un projet, le menez-vous à bien malgré les obstacles ?', image: '/images/questions/14a.webp', categorie: 'engagement' },
  { id: 15, texte: 'Respectez-vous une règle même quand elle semble ralentir le travail ?', image: '/images/questions/15a.webp', categorie: 'respect' },
  { id: 16, texte: 'Dans un projet créatif, osez-vous des idées originales, même risquées ?', image: '/images/questions/16a.webp', categorie: 'innovation' },
  { id: 17, texte: 'Pendant une pause, aimez-vous discuter avec vos collègues ?', image: '/images/questions/17a.webp', categorie: 'convivialite' },
  { id: 18, texte: 'En situation d\'urgence, misez-vous d\'abord sur la coordination avec l\'équipe ?', image: '/images/questions/18a.webp', categorie: 'forceCollective' },
]

// Soft skills évaluées, dans l'ordre d'affichage (et de départage à égalité).
export const SOFT_SKILLS = {
  forceCollective: 'Force collective',
  equite: 'Équité',
  engagement: 'Engagement',
  respect: 'Respect',
  innovation: 'Innovation',
  convivialite: 'Convivialité',
}
