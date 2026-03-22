import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Flame, ChevronRight, Zap, Trophy, Target, Clock, TrendingUp } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProgressRing } from '@/components/ui/ProgressBar'
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition'
import type { Question } from '@/types'

interface DashboardProps { questions: Record<string, Question[]> }

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const item = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
}

// Study activity heatmap — last 35 days
function StudyHeatmap({ sessions }: { sessions: { date: string }[] }) {
  const cells = useMemo(() => {
    const counts: Record<string, number> = {}
    sessions.forEach(s => { const d = s.date.split('T')[0]; counts[d] = (counts[d] ?? 0) + 1 })
    const today = new Date()
    return Array.from({ length: 35 }, (_, i) => {
      const d = new Date(today)
      d.setDate(d.getDate() - (34 - i))
      const key = d.toISOString().split('T')[0]
      return { key, count: counts[key] ?? 0, isToday: key === today.toISOString().split('T')[0] }
    })
  }, [sessions])

  const intensity = (c: number) => {
    if (c === 0) return 'bg-violet-100'
    if (c === 1) return 'bg-violet-300'
    if (c === 2) return 'bg-violet-400'
    return 'bg-violet-600'
  }

  return (
    <div>
      <p className="text-xs font-medium text-slate-600 mb-2">Lernaktivität (letzte 35 Tage)</p>
      <div className="grid grid-cols-7 gap-1">
        {cells.map(c => (
          <div key={c.key} title={`${c.key}: ${c.count} Session(s)`}
            className={`h-4 rounded-sm ${intensity(c.count)} ${c.isToday ? 'ring-2 ring-primary-400 ring-offset-1' : ''}`} />
        ))}
      </div>
      <div className="flex items-center gap-1.5 mt-2 justify-end">
        <span className="text-xs text-slate-400">Weniger</span>
        {['bg-violet-100','bg-violet-300','bg-violet-400','bg-violet-600'].map(c => (
          <div key={c} className={`h-3 w-3 rounded-sm ${c}`} />
        ))}
        <span className="text-xs text-slate-400">Mehr</span>
      </div>
    </div>
  )
}

// Question-type donut chart
function TypeDonut({ questions }: { questions: Question[] }) {
  const data = useMemo(() => [
    { name: 'Multiple Choice', value: questions.filter(q => q.type === 'multiple_choice').length, color: '#6366f1' },
    { name: 'Wahr/Falsch',     value: questions.filter(q => q.type === 'true_false').length,      color: '#8b5cf6' },
    { name: 'Lückentext',      value: questions.filter(q => q.type === 'fill_in_blank').length,   color: '#a78bfa' },
  ], [questions])

  return (
    <div className="flex items-center gap-4">
      <ResponsiveContainer width={80} height={80}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={22} outerRadius={36} dataKey="value" strokeWidth={0}>
            {data.map(d => <Cell key={d.name} fill={d.color} />)}
          </Pie>
          <Tooltip formatter={(v: number) => [v, '']}
            contentStyle={{ background: '#fff', border: '1px solid #ede9fe', borderRadius: 10, fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-1">
        {data.map(d => (
          <div key={d.name} className="flex items-center gap-1.5 text-xs text-slate-600">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
            {d.name} <span className="font-semibold text-slate-900">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard({ questions }: DashboardProps) {
  const navigate = useNavigate()
  const { state, selectedTopics, dueCount, masteryPercent } = useSpacedRepetition('exam1')

  const exam1Qs = questions['exam1'] ?? []
  const due     = dueCount(exam1Qs, selectedTopics.length ? selectedTopics : undefined)
  const mastery = masteryPercent(exam1Qs)
  const accuracy = state.stats.totalAnswered > 0
    ? Math.round((state.stats.totalCorrect / state.stats.totalAnswered) * 100) : 0

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Guten Morgen' : hour < 18 ? 'Guten Tag' : 'Guten Abend'

  const todaySessions = useMemo(
    () => state.stats.sessions.filter(s => s.date.startsWith(new Date().toISOString().split('T')[0])).length,
    [state.stats.sessions]
  )

  return (
    <div className="min-h-screen bg-violet-50 p-4 md:p-8">
      <motion.div className="max-w-5xl mx-auto space-y-6" variants={container} initial="hidden" animate="show">

        {/* Header */}
        <motion.div variants={item} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">{greeting}! 👋</h1>
            <p className="text-slate-500 mt-1">
              {due > 0 ? `${due} Karten zur Wiederholung fällig` : 'Alles auf dem neuesten Stand'}
            </p>
          </div>
          {state.stats.streak > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-2xl">
              <Flame className="w-4 h-4 text-amber-500" />
              <span className="font-bold text-amber-700">{state.stats.streak}</span>
              <span className="text-amber-600 text-sm hidden sm:inline">Tage</span>
            </div>
          )}
        </motion.div>

        {/* Stat cards */}
        <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: <Target className="w-4 h-4" />, label: 'Fällig heute',   value: due,           bg: 'bg-primary-50', ic: 'text-primary-600', border: 'border-primary-100' },
            { icon: <Trophy className="w-4 h-4" />, label: 'Gemeistert',     value: `${mastery}%`, bg: 'bg-emerald-50', ic: 'text-emerald-600', border: 'border-emerald-100' },
            { icon: <Zap    className="w-4 h-4" />, label: 'Genauigkeit',    value: `${accuracy}%`,bg: 'bg-amber-50',   ic: 'text-amber-600',   border: 'border-amber-100'   },
            { icon: <Clock  className="w-4 h-4" />, label: 'Sessions heute', value: todaySessions, bg: 'bg-sky-50',     ic: 'text-sky-600',     border: 'border-sky-100'     },
          ].map(s => (
            <Card key={s.label} padding="md" className={`border ${s.border}`}>
              <div className={`inline-flex p-2 rounded-xl ${s.bg} mb-2`}>
                <span className={s.ic}>{s.icon}</span>
              </div>
              <div className="text-2xl font-bold text-slate-900">{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </Card>
          ))}
        </motion.div>

        {/* Main content grid */}
        <div className="grid md:grid-cols-3 gap-5">

          {/* Exam card (2 cols) */}
          <motion.div variants={item} className="md:col-span-2">
            <Card hover glow padding="lg" className="border-primary-100 relative overflow-hidden h-full"
              onClick={() => navigate('/exam/exam1')}>
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-gradient-to-br from-primary-100 to-violet-100 opacity-60 blur-2xl pointer-events-none" />
              <div className="relative flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="text-4xl">🎓</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-slate-900">Sexualpädagogik & Sexualwissenschaft</h3>
                    <p className="text-slate-500 text-sm mt-0.5">MA 8 — ISP Zürich</p>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {due > 0 && <Badge variant="primary" dot>{due} fällig</Badge>}
                      <Badge variant="default">{exam1Qs.length} Fragen</Badge>
                      {mastery >= 80 && <Badge variant="success">Prüfungsbereit</Badge>}
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 flex items-center gap-3">
                  <ProgressRing value={mastery} size={68} stroke={6} color="#6366f1">
                    <span className="text-sm font-bold text-slate-900">{mastery}%</span>
                  </ProgressRing>
                  <ChevronRight className="w-5 h-5 text-slate-300" />
                </div>
              </div>
              <div className="relative mt-5 flex gap-3">
                <Button size="md" onClick={e => { e.stopPropagation(); navigate('/session/exam1') }} className="flex-1 md:flex-none">
                  <BookOpen className="w-4 h-4" /> Session starten
                </Button>
                <Button variant="secondary" size="md" onClick={e => { e.stopPropagation(); navigate('/exam/exam1') }}>
                  Übersicht
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Right column */}
          <motion.div variants={item} className="space-y-4">
            <Card padding="md">
              <p className="text-sm font-semibold text-slate-700 mb-3">Fragentypen</p>
              <TypeDonut questions={exam1Qs} />
            </Card>
            <Card padding="md">
              <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-primary-500" /> Gesamtfortschritt
              </p>
              <div className="space-y-2.5">
                {[
                  { label: 'Beantwortet', value: state.stats.totalAnswered, max: Math.max(exam1Qs.length, 1), color: 'bg-primary-400' },
                  { label: 'Richtig',     value: state.stats.totalCorrect,  max: Math.max(state.stats.totalAnswered, 1), color: 'bg-emerald-400' },
                ].map(s => (
                  <div key={s.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">{s.label}</span>
                      <span className="font-medium text-slate-700">{s.value}</span>
                    </div>
                    <div className="h-1.5 bg-violet-100 rounded-full overflow-hidden">
                      <div className={`h-full ${s.color} rounded-full transition-all duration-700`}
                        style={{ width: `${Math.min(100, (s.value / s.max) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Heatmap */}
        <motion.div variants={item}>
          <Card padding="md"><StudyHeatmap sessions={state.stats.sessions} /></Card>
        </motion.div>

        {/* Recent sessions */}
        {state.stats.sessions.length > 0 && (
          <motion.div variants={item}>
            <p className="text-sm font-semibold text-slate-700 mb-3">Letzte Sessions</p>
            <div className="space-y-2">
              {state.stats.sessions.slice(0, 4).map(s => {
                const acc = s.totalQuestions > 0 ? Math.round((s.correct / s.totalQuestions) * 100) : 0
                return (
                  <Card key={s.id} padding="sm" className="flex items-center gap-3">
                    <div className={`w-1.5 h-9 rounded-full flex-shrink-0 ${acc >= 80 ? 'bg-emerald-400' : acc >= 60 ? 'bg-amber-400' : 'bg-red-400'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800">{s.correct}/{s.totalQuestions} korrekt</div>
                      <div className="text-xs text-slate-400">{new Date(s.date).toLocaleDateString('de-CH', { weekday: 'short', month: 'short', day: 'numeric' })} · {Math.round(s.duration / 60)} Min</div>
                    </div>
                    <Badge variant={acc >= 80 ? 'success' : acc >= 60 ? 'warning' : 'danger'}>{acc}%</Badge>
                  </Card>
                )
              })}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
