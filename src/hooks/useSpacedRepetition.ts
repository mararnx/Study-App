import { useCallback, useMemo } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { createCard, calculateNextReview, isDue, isNew, isMastered } from '@/utils/sm2'
import type { CardProgress, Question, SessionQuestion, GlobalStats, AppState, SessionResult } from '@/types'

const STORAGE_KEY  = 'studyflow-state'
const SESSION_SIZE = 25   // max questions per session

const DEFAULT_STATE: AppState = {
  cards:          {},
  stats: {
    totalAnswered: 0,
    totalCorrect:  0,
    streak:        0,
    lastStudyDate: null,
    sessions:      [],
    topicStats:    {},
  },
  selectedTopics: {},
  theme:          'dark',
}

export function useSpacedRepetition(examId: string) {
  const [state, setState] = useLocalStorage<AppState>(STORAGE_KEY, DEFAULT_STATE)

  // ── Card helpers ────────────────────────────────────────────────────────────

  const getCard = useCallback(
    (questionId: string): CardProgress => {
      return state.cards[questionId] ?? createCard(questionId)
    },
    [state.cards]
  )

  // ── Topic selection ─────────────────────────────────────────────────────────

  const selectedTopics = useMemo(
    () => state.selectedTopics[examId] ?? [],
    [state.selectedTopics, examId]
  )

  const setSelectedTopics = useCallback(
    (topicIds: string[]) => {
      setState(prev => ({
        ...prev,
        selectedTopics: { ...prev.selectedTopics, [examId]: topicIds },
      }))
    },
    [setState, examId]
  )

  // ── Build session ───────────────────────────────────────────────────────────

  const buildSession = useCallback(
    (questions: Question[], topicFilter?: string[]): SessionQuestion[] => {
      const filtered = topicFilter?.length
        ? questions.filter(q => topicFilter.includes(q.topic))
        : questions

      const due: SessionQuestion[] = filtered
        .filter(q => {
          const card = getCard(q.id)
          return !isNew(card) && isDue(card)
        })
        .map(q => ({ question: q, isReview: true, showAgain: false }))

      const newCards: SessionQuestion[] = filtered
        .filter(q => isNew(getCard(q.id)))
        .slice(0, Math.max(0, SESSION_SIZE - due.length))
        .map(q => ({ question: q, isReview: false, showAgain: false }))

      return [...due, ...newCards].slice(0, SESSION_SIZE)
    },
    [getCard]
  )

  // ── Record answer ───────────────────────────────────────────────────────────

  const recordAnswer = useCallback(
    (questionId: string, correct: boolean, quality?: number) => {
      const q = quality ?? (correct ? 5 : 1)
      const card     = getCard(questionId)
      const updated  = calculateNextReview(card, q)

      setState(prev => {
        const today = new Date().toISOString().split('T')[0]

        // streak logic
        let { streak, lastStudyDate } = prev.stats
        if (lastStudyDate !== today) {
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          const yStr = yesterday.toISOString().split('T')[0]
          streak = lastStudyDate === yStr ? streak + 1 : 1
        }

        const topicId  = '?'   // resolved at call site if needed
        const tStats   = prev.stats.topicStats

        return {
          ...prev,
          cards: { ...prev.cards, [questionId]: updated },
          stats: {
            ...prev.stats,
            totalAnswered: prev.stats.totalAnswered + 1,
            totalCorrect:  prev.stats.totalCorrect + (correct ? 1 : 0),
            streak,
            lastStudyDate: today,
            topicStats:    tStats,
          },
        }
      })
    },
    [getCard, setState]
  )

  const recordAnswerWithTopic = useCallback(
    (questionId: string, topicId: string, correct: boolean, quality?: number) => {
      const q       = quality ?? (correct ? 5 : 1)
      const card    = getCard(questionId)
      const updated = calculateNextReview(card, q)

      setState(prev => {
        const today = new Date().toISOString().split('T')[0]

        let { streak, lastStudyDate } = prev.stats
        if (lastStudyDate !== today) {
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)
          const yStr = yesterday.toISOString().split('T')[0]
          streak = lastStudyDate === yStr ? streak + 1 : 1
        }

        const prevTopic = prev.stats.topicStats[topicId] ?? {
          topicId,
          answered: 0,
          correct:  0,
          mastered: 0,
        }

        const newMastered = isMastered(updated) && !isMastered(card) ? 1 : 0

        return {
          ...prev,
          cards: { ...prev.cards, [questionId]: updated },
          stats: {
            ...prev.stats,
            totalAnswered: prev.stats.totalAnswered + 1,
            totalCorrect:  prev.stats.totalCorrect + (correct ? 1 : 0),
            streak,
            lastStudyDate: today,
            topicStats: {
              ...prev.stats.topicStats,
              [topicId]: {
                ...prevTopic,
                answered: prevTopic.answered + 1,
                correct:  prevTopic.correct + (correct ? 1 : 0),
                mastered: prevTopic.mastered + newMastered,
              },
            },
          },
        }
      })
    },
    [getCard, setState]
  )

  // ── Save session ────────────────────────────────────────────────────────────

  const saveSession = useCallback(
    (result: Omit<SessionResult, 'id'>) => {
      const id = `session-${Date.now()}`
      setState(prev => ({
        ...prev,
        stats: {
          ...prev.stats,
          sessions: [{ id, ...result }, ...prev.stats.sessions].slice(0, 100),
        },
      }))
    },
    [setState]
  )

  // ── Theme ───────────────────────────────────────────────────────────────────

  const setTheme = useCallback(
    (theme: 'dark' | 'light') => {
      setState(prev => ({ ...prev, theme }))
    },
    [setState]
  )

  // ── Derived stats ───────────────────────────────────────────────────────────

  const dueCount = useCallback(
    (questions: Question[], topicFilter?: string[]) => {
      const filtered = topicFilter?.length
        ? questions.filter(q => topicFilter.includes(q.topic))
        : questions
      return filtered.filter(q => {
        const card = getCard(q.id)
        return !isNew(card) && isDue(card)
      }).length
    },
    [getCard]
  )

  const masteryPercent = useCallback(
    (questions: Question[], topicFilter?: string[]) => {
      const filtered = topicFilter?.length
        ? questions.filter(q => topicFilter.includes(q.topic))
        : questions
      if (!filtered.length) return 0
      const mastered = filtered.filter(q => isMastered(getCard(q.id))).length
      return Math.round((mastered / filtered.length) * 100)
    },
    [getCard]
  )

  const topicAccuracy = useCallback(
    (topicId: string): number => {
      const ts = state.stats.topicStats[topicId]
      if (!ts || ts.answered === 0) return -1
      return Math.round((ts.correct / ts.answered) * 100)
    },
    [state.stats.topicStats]
  )

  return {
    state,
    getCard,
    selectedTopics,
    setSelectedTopics,
    buildSession,
    recordAnswer,
    recordAnswerWithTopic,
    saveSession,
    setTheme,
    dueCount,
    masteryPercent,
    topicAccuracy,
  }
}
