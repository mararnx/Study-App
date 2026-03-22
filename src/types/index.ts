// ── Question Types ────────────────────────────────────────────────────────────

export type QuestionType = 'multiple_choice' | 'true_false' | 'fill_in_blank'
export type Difficulty    = 'easy' | 'medium' | 'hard'

export interface Question {
  id:            string
  type:          QuestionType
  topic:         string
  topicTitle:    string
  difficulty:    Difficulty
  question:      string
  options:       string[]
  correctAnswer: string
  explanation:   string
  theory:        string
  relatedGoals:  string[]
}

// ── Learning Goals ────────────────────────────────────────────────────────────

export interface LearningGoal {
  id:          string
  description: string
  keywords:    string[]
}

export interface Topic {
  id:            string
  title:         string
  description:   string
  sourceBlocks:  string[]
  learningGoals: LearningGoal[]
}

export interface ExamData {
  examId:    string
  examTitle: string
  topics:    Topic[]
}

// ── Spaced Repetition (SM-2) ──────────────────────────────────────────────────

export interface CardProgress {
  questionId:     string
  easeFactor:     number   // starts at 2.5
  interval:       number   // days until next review
  repetitions:    number
  nextReviewDate: string   // ISO date string
  lastReviewDate: string | null
  history:        ReviewRecord[]
}

export interface ReviewRecord {
  date:    string
  quality: number   // 0-5
  correct: boolean
}

// ── Session ───────────────────────────────────────────────────────────────────

export interface SessionQuestion {
  question:      Question
  isReview:      boolean   // true = due card, false = new card
  showAgain:     boolean   // re-queued after wrong answer
}

export interface SessionResult {
  id:             string
  date:           string
  duration:       number   // seconds
  totalQuestions: number
  correct:        number
  incorrect:      number
  topics:         string[]
}

// ── Global Stats ──────────────────────────────────────────────────────────────

export interface GlobalStats {
  totalAnswered:  number
  totalCorrect:   number
  streak:         number
  lastStudyDate:  string | null
  sessions:       SessionResult[]
  topicStats:     Record<string, TopicStats>
}

export interface TopicStats {
  topicId:       string
  answered:      number
  correct:       number
  mastered:      number   // repetitions >= 3 && interval >= 21
}

// ── App State ─────────────────────────────────────────────────────────────────

export interface AppState {
  cards:           Record<string, CardProgress>
  stats:           GlobalStats
  selectedTopics:  Record<string, string[]>   // examId → topicId[]
  theme:           'dark' | 'light'
}
