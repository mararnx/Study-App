import type { CardProgress, ReviewRecord } from '@/types'

// ── SM-2 Algorithm (SuperMemo 2) ─────────────────────────────────────────────
// Based on: https://www.supermemo.com/en/blog/application-of-a-computer-to-improve-the-results-obtained-in-working-with-the-supermemo-method

const MIN_EASE_FACTOR   = 1.3
const DEFAULT_EASE      = 2.5
const INITIAL_INTERVALS = [1, 6]   // days for rep 0→1 and 1→2

export function createCard(questionId: string): CardProgress {
  return {
    questionId,
    easeFactor:     DEFAULT_EASE,
    interval:       0,
    repetitions:    0,
    nextReviewDate: new Date().toISOString().split('T')[0],
    lastReviewDate: null,
    history:        [],
  }
}

/**
 * quality: 5 = perfect recall, 4 = correct with hesitation,
 *          3 = correct with difficulty, 2 = incorrect, easy recall,
 *          1 = incorrect, 0 = complete blackout
 */
export function calculateNextReview(card: CardProgress, quality: number): CardProgress {
  const today = new Date().toISOString().split('T')[0]

  const record: ReviewRecord = {
    date:    today,
    quality,
    correct: quality >= 3,
  }

  let { easeFactor, interval, repetitions } = card

  if (quality >= 3) {
    // Correct answer
    if (repetitions === 0)      interval = INITIAL_INTERVALS[0]
    else if (repetitions === 1) interval = INITIAL_INTERVALS[1]
    else                        interval = Math.round(interval * easeFactor)

    repetitions += 1
  } else {
    // Incorrect — reset
    repetitions = 0
    interval    = 1
  }

  // Update ease factor (EF' = EF + (0.1 - (5-q)*(0.08 + (5-q)*0.02)))
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  if (easeFactor < MIN_EASE_FACTOR) easeFactor = MIN_EASE_FACTOR

  const nextDate = addDays(today, interval)

  return {
    ...card,
    easeFactor,
    interval,
    repetitions,
    nextReviewDate: nextDate,
    lastReviewDate: today,
    history:        [...card.history, record],
  }
}

export function isDue(card: CardProgress): boolean {
  const today = new Date().toISOString().split('T')[0]
  return card.nextReviewDate <= today
}

export function isNew(card: CardProgress): boolean {
  return card.repetitions === 0 && card.lastReviewDate === null
}

export function isMastered(card: CardProgress): boolean {
  return card.repetitions >= 3 && card.interval >= 21
}

export function getMasteryLevel(card: CardProgress): 'new' | 'learning' | 'review' | 'mastered' {
  if (card.lastReviewDate === null) return 'new'
  if (card.repetitions < 3)        return 'learning'
  if (card.interval < 21)          return 'review'
  return 'mastered'
}

export function getStrengthPercent(card: CardProgress): number {
  if (!card.lastReviewDate) return 0
  const history = card.history.slice(-5)
  if (history.length === 0) return 0
  const correct = history.filter(h => h.correct).length
  return Math.round((correct / history.length) * 100)
}

/** Forecast: how many cards are due in the next N days */
export function forecastDue(cards: CardProgress[], days: number): number[] {
  const result: number[] = []
  const today = new Date()

  for (let d = 0; d < days; d++) {
    const date = addDays(today.toISOString().split('T')[0], d)
    const count = cards.filter(c => c.nextReviewDate <= date && c.nextReviewDate > addDays(today.toISOString().split('T')[0], d - 1)).length
    result.push(count)
  }

  return result
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr)
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}
