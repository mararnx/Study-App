import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, X, ChevronDown, ChevronUp, CheckCircle, XCircle, Lightbulb, BookOpen, Clock, Check } from 'lucide-react'
import confetti from 'canvas-confetti'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar, ProgressRing } from '@/components/ui/ProgressBar'
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition'
import type { Question, SessionQuestion } from '@/types'

interface StudySessionProps {
  questions: Record<string, Question[]>
}

type SessionState = 'idle' | 'question' | 'feedback' | 'complete'

export default function StudySession({ questions }: StudySessionProps) {
  const { examId = 'exam1' } = useParams<{ examId: string }>()
  const navigate              = useNavigate()
  const {
    selectedTopics,
    buildSession,
    recordAnswerWithTopic,
    saveSession,
  } = useSpacedRepetition(examId)

  // ── Session setup ───────────────────────────────────────────────────────────
  const allQs = questions[examId] ?? []
  const queue = useMemo(
    () => buildSession(allQs, selectedTopics.length ? selectedTopics : undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const [sessionState,    setSessionState]    = useState<SessionState>('question')
  const [currentIndex,    setCurrentIndex]    = useState(0)
  const [answered,        setAnswered]        = useState<string | null>(null)
  const [isCorrect,       setIsCorrect]       = useState<boolean | null>(null)
  const [showTheory,      setShowTheory]      = useState(false)
  const [correct,         setCorrect]         = useState(0)
  const [incorrect,       setIncorrect]       = useState(0)
  const [fillInput,       setFillInput]       = useState('')
  const [startTime]                           = useState(Date.now())
  const [sessionQueue,    setSessionQueue]    = useState<SessionQuestion[]>(queue)
  const [wrongQueue,      setWrongQueue]      = useState<SessionQuestion[]>([])
  const [wrongInsertAt,   setWrongInsertAt]   = useState<number | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)

  const current  = sessionQueue[currentIndex]
  const progress = Math.round((currentIndex / Math.max(sessionQueue.length, 1)) * 100)

  // Focus fill-in input
  useEffect(() => {
    if (current?.question.type === 'fill_in_blank' && sessionState === 'question') {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [current, sessionState])

  const handleAnswer = useCallback((answer: string) => {
    if (answered !== null || !current) return

    const q         = current.question
    const correct_  = answer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()

    setAnswered(answer)
    setIsCorrect(correct_)
    setSessionState('feedback')
    if (!correct_) setShowTheory(true)

    recordAnswerWithTopic(q.id, q.topic, correct_, correct_ ? 5 : 1)

    if (correct_) {
      setCorrect(c => c + 1)
    } else {
      setIncorrect(c => c + 1)
      // Re-queue wrong answer 3-5 questions later
      const insertAt = Math.min(currentIndex + 3 + Math.floor(Math.random() * 3), sessionQueue.length)
      setWrongInsertAt(insertAt)
      setWrongQueue(wq => [...wq, { ...current, showAgain: true }])
    }
  }, [answered, current, currentIndex, recordAnswerWithTopic, sessionQueue.length])

  const handleNext = useCallback(() => {
    setAnswered(null)
    setIsCorrect(null)
    setShowTheory(false)
    setFillInput('')
    setSessionState('question')

    // Insert wrong-answer card if needed
    setSessionQueue(prev => {
      if (wrongInsertAt !== null && wrongInsertAt <= currentIndex + 1 && wrongQueue.length > 0) {
        const [next, ...rest] = wrongQueue
        setWrongQueue(rest)
        setWrongInsertAt(null)
        const updated = [...prev]
        updated.splice(currentIndex + 1, 0, next)
        return updated
      }
      return prev
    })

    const nextIndex = currentIndex + 1
    if (nextIndex >= sessionQueue.length && wrongQueue.length === 0) {
      // Session complete
      const duration = Math.round((Date.now() - startTime) / 1000)
      const acc      = Math.round((correct / Math.max(correct + incorrect, 1)) * 100)

      if (acc >= 80) {
        confetti({
          particleCount: 120,
          spread:        70,
          origin:        { y: 0.6 },
          colors:        ['#4052f5', '#10b981', '#f59e0b', '#ec4899'],
        })
      }

      saveSession({
        date:           new Date().toISOString(),
        duration,
        totalQuestions: correct + incorrect,
        correct,
        incorrect,
        topics:         [...new Set(sessionQueue.map(s => s.question.topic))],
      })

      setSessionState('complete')
    } else {
      setCurrentIndex(nextIndex)
    }
  }, [currentIndex, sessionQueue, wrongQueue, wrongInsertAt, startTime, correct, incorrect, saveSession])

  // Keyboard: Enter to confirm fill-in-blank, Space/Enter for next
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (sessionState === 'feedback' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault()
        handleNext()
      }
      if (sessionState === 'question' && current?.question.type === 'true_false') {
        if (e.key === '1') handleAnswer('Wahr')
        if (e.key === '2') handleAnswer('Falsch')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [sessionState, handleNext, handleAnswer, current])

  if (!current || sessionQueue.length === 0) {
    return <EmptySession onBack={() => navigate(`/exam/${examId}`)} />
  }

  if (sessionState === 'complete') {
    return (
      <SessionComplete
        correct={correct}
        incorrect={incorrect}
        duration={Math.round((Date.now() - startTime) / 1000)}
        onReview={() => navigate(`/exam/${examId}`)}
        onHome={() => navigate('/')}
      />
    )
  }

  const q = current.question

  return (
    <div className="min-h-screen bg-violet-50 flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl border-b border-violet-100 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => navigate(`/exam/${examId}`)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-violet-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <ProgressBar value={currentIndex} max={sessionQueue.length} size="sm" animated />
            </div>
            <span className="text-xs text-slate-500 whitespace-nowrap">
              {currentIndex + 1} / {sessionQueue.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={correct > incorrect ? 'success' : 'default'}>
              ✓ {correct}
            </Badge>
            <Badge variant={incorrect > 0 ? 'danger' : 'default'}>
              ✗ {incorrect}
            </Badge>
            {current.isReview && <Badge variant="info">Wiederholung</Badge>}
            <Badge variant="default" className="ml-auto">{diffLabel(q.difficulty)}</Badge>
          </div>
        </div>
      </div>

      {/* Question card */}
      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="flex-1 flex flex-col gap-5"
          >
            {/* Topic chip */}
            <div>
              <Badge variant="default" className="text-xs">
                <BookOpen className="w-3 h-3" />
                {q.topicTitle}
              </Badge>
            </div>

            {/* Question */}
            <Card padding="lg" className="flex-shrink-0">
              <p className="text-lg md:text-xl font-medium text-slate-900 leading-relaxed">
                {q.question}
              </p>
            </Card>

            {/* Answer options */}
            <div className="space-y-3">
              {q.type === 'multiple_choice' && q.options.map(option => (
                <OptionButton
                  key={option}
                  option={option}
                  answered={answered}
                  correct={q.correctAnswer}
                  sessionState={sessionState}
                  onClick={() => handleAnswer(option)}
                />
              ))}

              {q.type === 'true_false' && (
                <div className="grid grid-cols-2 gap-3">
                  {['Wahr', 'Falsch'].map(option => (
                    <OptionButton
                      key={option}
                      option={option}
                      answered={answered}
                      correct={q.correctAnswer}
                      sessionState={sessionState}
                      onClick={() => handleAnswer(option)}
                      large
                    />
                  ))}
                </div>
              )}

              {q.type === 'fill_in_blank' && (
                <div>
                  {q.options && q.options.length > 0 ? (
                    // Options-style fill in blank
                    q.options.map(option => (
                      <OptionButton
                        key={option}
                        option={option}
                        answered={answered}
                        correct={q.correctAnswer}
                        sessionState={sessionState}
                        onClick={() => handleAnswer(option)}
                        className="mb-3"
                      />
                    ))
                  ) : (
                    // Free text
                    <div className="flex gap-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={fillInput}
                        onChange={e => setFillInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && fillInput.trim()) {
                            handleAnswer(fillInput.trim())
                          }
                        }}
                        placeholder="Antwort eingeben…"
                        disabled={sessionState === 'feedback'}
                        className={`
                          flex-1 bg-white border rounded-2xl px-4 py-3 text-slate-900 placeholder-slate-400
                          focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
                          transition-colors disabled:opacity-60
                          ${sessionState === 'feedback'
                            ? isCorrect
                              ? 'border-emerald-400 bg-emerald-50'
                              : 'border-red-400 bg-red-50'
                            : 'border-violet-200 hover:border-violet-300'
                          }
                        `}
                      />
                      {sessionState === 'question' && (
                        <Button
                          onClick={() => fillInput.trim() && handleAnswer(fillInput.trim())}
                          disabled={!fillInput.trim()}
                        >
                          OK
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Feedback section */}
            <AnimatePresence>
              {sessionState === 'feedback' && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {/* Result banner */}
                  <Card
                    padding="md"
                    className={isCorrect
                      ? 'border-emerald-300 bg-emerald-50'
                      : 'border-red-300 bg-red-50'
                    }
                  >
                    <div className="flex items-start gap-3">
                      {isCorrect
                        ? <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        : <XCircle    className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      }
                      <div>
                        <p className={`font-semibold ${isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
                          {isCorrect ? 'Richtig!' : `Falsch — Richtig wäre: ${q.correctAnswer}`}
                        </p>
                        <p className="text-sm text-slate-600 mt-1">{q.explanation}</p>
                      </div>
                    </div>
                  </Card>

                  {/* Theory (expandable) */}
                  <Card padding="none" className="overflow-hidden">
                    <button
                      onClick={() => setShowTheory(v => !v)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-violet-50 transition-colors"
                    >
                      <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span className="text-sm font-medium text-slate-700 flex-1">Hintergrund verstehen</span>
                      {showTheory
                        ? <ChevronUp className="w-4 h-4 text-slate-500" />
                        : <ChevronDown className="w-4 h-4 text-slate-500" />
                      }
                    </button>
                    <AnimatePresence>
                      {showTheory && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="px-4 pb-4 border-t border-violet-100 pt-3">
                            <p className="text-sm text-slate-600 leading-relaxed">{q.theory}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>

                  {/* Next button */}
                  <Button size="lg" fullWidth onClick={handleNext} className="mt-2">
                    Weiter
                    <span className="ml-2 hidden sm:inline text-xs opacity-60 font-normal border border-violet-200 rounded px-1.5 py-0.5">↵</span>
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── Option Button ─────────────────────────────────────────────────────────────

function OptionButton({
  option,
  answered,
  correct,
  sessionState,
  onClick,
  large = false,
  className = '',
}: {
  option:       string
  answered:     string | null
  correct:      string
  sessionState: SessionState
  onClick:      () => void
  large?:       boolean
  className?:   string
}) {
  const isAnswered    = sessionState === 'feedback'
  const isSelected    = answered === option
  const isCorrectOpt  = option.trim().toLowerCase() === correct.trim().toLowerCase()

  let colorClass = 'border-violet-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50'

  if (isAnswered) {
    if (isCorrectOpt)           colorClass = 'border-emerald-400 bg-emerald-50 text-emerald-800'
    else if (isSelected)        colorClass = 'border-red-400 bg-red-50 text-red-700'
    else                        colorClass = 'border-slate-100 bg-slate-50 text-slate-400 opacity-60'
  }

  return (
    <button
      onClick={isAnswered ? undefined : onClick}
      disabled={isAnswered}
      className={`
        w-full text-left px-4 py-3.5 rounded-2xl border font-medium text-sm
        transition-all duration-150 active:scale-[0.99]
        disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
        ${large ? 'py-5 text-base text-center justify-center' : ''}
        ${colorClass}
        ${className}
      `}
    >
      <span className={`flex items-center gap-2 ${large ? 'justify-center' : ''}`}>
        <span className="flex-1">{option}</span>
        {isAnswered && isCorrectOpt && (
          <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        )}
        {isAnswered && isSelected && !isCorrectOpt && (
          <X className="w-4 h-4 text-red-400 flex-shrink-0" />
        )}
      </span>
    </button>
  )
}

// ── Empty / Complete screens ──────────────────────────────────────────────────

function EmptySession({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-violet-50 flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Alles erledigt!</h2>
        <p className="text-slate-500 mb-6">Keine fälligen Karten für die ausgewählten Themen. Gut gemacht!</p>
        <Button size="lg" onClick={onBack}>Zurück zur Übersicht</Button>
      </div>
    </div>
  )
}

function SessionComplete({
  correct, incorrect, duration, onReview, onHome,
}: {
  correct: number; incorrect: number; duration: number
  onReview: () => void; onHome: () => void
}) {
  const total = correct + incorrect
  const acc   = total > 0 ? Math.round((correct / total) * 100) : 0
  const mins  = Math.floor(duration / 60)
  const secs  = duration % 60

  const ringColor = acc >= 80 ? '#10b981' : acc >= 60 ? '#f59e0b' : '#ef4444'

  return (
    <div className="min-h-screen bg-violet-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="max-w-sm w-full text-center"
      >
        <div className="text-6xl mb-4">{acc >= 80 ? '🏆' : acc >= 60 ? '💪' : '📚'}</div>
        <h2 className="text-3xl font-bold text-slate-900 mb-1">Session abgeschlossen!</h2>
        <p className="text-slate-500 mb-6">{mins}:{secs.toString().padStart(2, '0')} Min · {total} Fragen</p>

        <div className="flex justify-center mb-6">
          <ProgressRing value={acc} size={100} stroke={8} color={ringColor}>
            <div>
              <div className="text-2xl font-bold text-slate-900">{acc}%</div>
              <div className="text-xs text-slate-500">Genauigkeit</div>
            </div>
          </ProgressRing>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card padding="md" className="text-center border-emerald-200">
            <div className="text-2xl font-bold text-emerald-500">{correct}</div>
            <div className="text-xs text-slate-500">Richtig</div>
          </Card>
          <Card padding="md" className="text-center border-red-200">
            <div className="text-2xl font-bold text-red-500">{incorrect}</div>
            <div className="text-xs text-slate-500">Falsch</div>
          </Card>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" size="lg" fullWidth onClick={onHome}>
            Home
          </Button>
          <Button size="lg" fullWidth onClick={onReview}>
            Übersicht
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

function diffLabel(d: string) {
  if (d === 'easy')   return 'Leicht'
  if (d === 'medium') return 'Mittel'
  return 'Schwer'
}
