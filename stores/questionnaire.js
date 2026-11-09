import { defineStore } from 'pinia'
import { QUESTIONS, SOFT_SKILLS } from '~/data/questions'
import { METIERS, metierPour } from '~/data/metiers'

export { SOFT_SKILLS }

export const useQuestionnaireStore = defineStore('questionnaire', {
  state: () => ({
    userData: null,
    questions: QUESTIONS,
    // { [idQuestion]: true (oui) | false (non) } ; une question sans réponse compte « Non ».
    answers: {},
    results: null,
    participantId: null,
    // Chrono : horodatage de la première question, fin du quiz.
    startedAt: null,
    endedAt: null,
    tempsEcoule: false
  }),

  actions: {
    resetQuestionnaire() {
      this.userData = null
      this.answers = {}
      this.results = null
      this.participantId = null
      this.startedAt = null
      this.endedAt = null
      this.tempsEcoule = false
    },

    preloadImages() {
      if (!import.meta.client) return
      this.questions.forEach(question => {
        const img = new Image()
        img.src = question.image
      })
    },

    setUserData(data) {
      this.userData = { ...data }
    },

    startTimer() {
      if (!this.startedAt) this.startedAt = Date.now()
    },

    saveAnswer(questionId, answer) {
      this.answers[questionId] = answer
    },

    // Enregistre le questionnaire une seule fois, à la dernière réponse ou à la fin du chrono.
    async submit({ tempsEcoule = false } = {}) {
      if (this.participantId) return this.participantId
      if (!this.userData || !this.startedAt) throw new Error('QUIZ_NON_DEMARRE')
      if (!this.endedAt) {
        this.endedAt = Date.now()
        this.tempsEcoule = tempsEcoule
      }
      const results = this.calculateResults()
      const { quizDuration } = useRuntimeConfig().public
      const record = {
        id: crypto.randomUUID(),
        createdAt: new Date(this.endedAt).toISOString(),
        ...this.userData,
        reponses: this.answers,
        scores: Object.fromEntries(
          Object.entries(results.scores).map(([skill, s]) => [skill, { points: s.points, max: s.max }])
        ),
        metier: results.metier.label,
        dureeSec: Math.min(Number(quizDuration), Math.round((this.endedAt - this.startedAt) / 1000)),
        tempsEcoule: this.tempsEcoule
      }
      const res = await useBorne().saveParticipant(record)
      if (!res?.ok) {
        const error = new Error(res?.code || 'ENREGISTREMENT_IMPOSSIBLE')
        error.code = res?.code
        throw error
      }
      this.participantId = record.id
      return this.participantId
    },

    calculateResults() {
      // Oui = 1 point, Non ou sans réponse = 0 ; max = nombre de questions de la soft skill.
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
      const [first, second] = softSkillsTriees
      const key = metierPour(first.skill, second.skill)

      this.results = {
        scores,
        metier: { key, ...METIERS[key] },
        softSkillsTriees,
        sansReponse: this.questions.filter(q => typeof this.answers[q.id] !== 'boolean').length
      }

      return this.results
    },

    // Pourcentage décroissant, puis nombre de « oui », puis ordre de SOFT_SKILLS (tri stable).
    getSoftSkillsTriees(scores) {
      return Object.entries(scores)
        .filter(([, score]) => score.max > 0)
        .sort(([, a], [, b]) => b.pct - a.pct || b.points - a.points)
        .map(([skill, score]) => ({
          skill,
          label: SOFT_SKILLS[skill],
          ...score
        }))
    }
  }
})
