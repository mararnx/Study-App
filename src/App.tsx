import { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { NavBar } from '@/components/dashboard/NavBar'
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition'

// Lazy-load pages
const Dashboard    = lazy(() => import('@/pages/Dashboard'))
const ExamOverview = lazy(() => import('@/pages/ExamOverview'))
const StudySession = lazy(() => import('@/pages/StudySession'))
const Statistics   = lazy(() => import('@/pages/Statistics'))

// Static data
import examData  from '@/data/exam1/learning-goals.json'
import questions from '@/data/exam1/questions.json'
import type { ExamData, Question } from '@/types'

const examDataMap:  Record<string, ExamData>    = { exam1: examData as ExamData }
const questionsMap: Record<string, Question[]>  = { exam1: questions as Question[] }

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { state } = useSpacedRepetition('exam1')

  useEffect(() => {
    const root = document.documentElement
    if (state.theme === 'light') {
      root.classList.remove('dark')
      root.classList.add('light')
    } else {
      root.classList.remove('light')
      root.classList.add('dark')
    }
  }, [state.theme])

  return <>{children}</>
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <div className="min-h-screen bg-surface-950">
          <NavBar />
          {/* Desktop: pad top for navbar, mobile: pad bottom */}
          <div className="md:pt-14 pb-20 md:pb-0">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route
                  path="/"
                  element={<Dashboard questions={questionsMap} />}
                />
                <Route
                  path="/exam/:examId"
                  element={<ExamOverview examData={examDataMap} questions={questionsMap} />}
                />
                <Route
                  path="/session/:examId"
                  element={<StudySession questions={questionsMap} />}
                />
                <Route
                  path="/stats"
                  element={<Statistics examData={examDataMap} questions={questionsMap} />}
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </div>
        </div>
      </ThemeProvider>
    </BrowserRouter>
  )
}
