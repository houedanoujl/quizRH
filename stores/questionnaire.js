import { defineStore } from 'pinia'

// Soft skills évaluées, dans l'ordre d'affichage par défaut.
export const SOFT_SKILLS = {
  forceCollective: 'Force collective',
  equite: 'Équité',
  engagement: 'Engagement',
  respect: 'Respect',
  innovation: 'Innovation',
  convivialite: 'Convivialité'
}

export const useQuestionnaireStore = defineStore('questionnaire', {
  state: () => ({
    userData: null,
    // Chargées depuis Supabase (table ciprel_questions) :
    // [{ id, position, texte, image, categorie }]
    questions: [],
    isLoading: false,
    loadError: null,
    departements: {
      'Ressources Humaines': {
        prioritaires: ['respect', 'equite'],
        secondaires: ['convivialite']
      },
      'Production': {
        prioritaires: ['engagement', 'innovation', 'respect'],
        secondaires: ['forceCollective']
      },
      'Maintenance': {
        prioritaires: ['engagement', 'forceCollective', 'respect'],
        secondaires: ['innovation']
      },
      'Qualité': {
        prioritaires: ['equite', 'respect', 'engagement'],
        secondaires: ['convivialite']
      },
      'Comptabilité': {
        prioritaires: ['equite', 'respect'],
        secondaires: ['engagement']
      }
    },
    // { [idQuestion]: true (oui) | false (non) }
    answers: {},
    results: null,
    participantId: null
  }),

  getters: {
    isComplete: (state) =>
      state.questions.length > 0 && state.questions.every(q => typeof state.answers[q.id] === 'boolean')
  },

  actions: {
    resetQuestionnaire() {
      this.userData = null
      this.answers = {}
      this.results = null
      this.participantId = null
    },

    async loadQuestions() {
      if (this.questions.length) return
      this.isLoading = true
      this.loadError = null
      try {
        this.questions = await useSupabase().fetchQuestions()
        this.preloadImages()
      } catch (error) {
        console.error('Erreur de chargement des questions :', error)
        this.loadError = 'Les questions n\'ont pas pu être chargées.'
      } finally {
        this.isLoading = false
      }
    },

    preloadImages() {
      if (!process.client) return
      this.questions.forEach(question => {
        const img = new Image()
        img.src = question.image
      })
    },

    setUserData(data) {
      this.userData = { ...data }
    },

    saveAnswer(questionId, answer) {
      this.answers[questionId] = answer
    },

    // Enregistre le questionnaire une seule fois, à la dernière réponse.
    async submit() {
      if (this.participantId) return this.participantId
      const results = this.calculateResults()
      this.participantId = await useSupabase().submitResults({
        userData: this.userData,
        reponses: this.answers,
        departement: results.departement
      })
      return this.participantId
    },

    calculateResults() {
      // Oui = 1 point, Non = 0 ; max = nombre de questions de la soft skill.
      const scores = Object.fromEntries(
        Object.keys(SOFT_SKILLS).map(skill => [skill, { points: 0, max: 0, pct: 0 }])
      )

      this.questions.forEach(question => {
        const score = scores[question.categorie]
        if (!score) return
        score.max++
        if (this.answers[question.id] === true) score.points++
      })
      Object.values(scores).forEach(score => {
        score.pct = score.max ? Math.round((score.points / score.max) * 100) : 0
      })

      const softSkillsTriees = this.getSoftSkillsTriees(scores)
      const departement = this.determinerDepartement(softSkillsTriees)

      this.results = {
        scores,
        departement,
        softSkillsTriees
      }

      return this.results
    },

    getSoftSkillsTriees(scores) {
      return Object.entries(scores)
        .filter(([, score]) => score.max > 0)
        .sort(([, a], [, b]) => b.pct - a.pct || b.points - a.points)
        .map(([skill, score]) => ({
          skill,
          label: SOFT_SKILLS[skill],
          ...score
        }))
    },

    // Compare les 2 soft skills aux meilleurs pourcentages aux profils des départements.
    determinerDepartement(softSkillsTriees) {
      const topSkills = softSkillsTriees
        .slice(0, 2)
        .map(({ skill }) => skill)

      let meilleurMatch = {
        departement: null,
        score: 0
      }

      Object.entries(this.departements).forEach(([departement, criteres]) => {
        let score = 0
        topSkills.forEach(skill => {
          if (criteres.prioritaires.includes(skill)) score += 2
          if (criteres.secondaires.includes(skill)) score += 1
        })

        if (score > meilleurMatch.score) {
          meilleurMatch = {
            departement,
            score
          }
        }
      })

      return meilleurMatch.departement || 'Non déterminé'
    }
  }
})
