import { createClient } from '@supabase/supabase-js'

// Un seul client pour l'application, créé à la première utilisation.
let client = null

export const useSupabase = () => {
  if (!client) {
    const { supabaseUrl, supabaseKey } = useRuntimeConfig().public
    client = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    })
  }

  // Questions actives, dans l'ordre du questionnaire.
  const fetchQuestions = async () => {
    const { data, error } = await client
      .from('ciprel_questions')
      .select('id, position, texte, image, categorie')
      .order('position')
    if (error) throw error
    return data
  }

  // Enregistre un questionnaire complet ; renvoie l'id du participant.
  // reponses : { [idQuestion]: true | false }
  const submitResults = async ({ userData, reponses, departement }) => {
    const { data, error } = await client.rpc('ciprel_submit', {
      p_nom: userData.nom,
      p_prenom: userData.prenom,
      p_email: userData.email,
      p_contact: userData.contact,
      p_reponses: reponses,
      p_departement: departement
    })
    if (error) throw error
    return data
  }

  return { fetchQuestions, submitResults }
}
