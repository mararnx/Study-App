import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, TrendingUp, Calendar, Target, Zap } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PieChart, Pie, Cell,
} from 'recharts'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition'
import { forecastDue, createCard } from '@/utils/sm2'
import type { Question, ExamData } from '@/types'

interface StatisticsProps {
  examData:  Record<string, ExamData>
  questions: Record<string, Question[]>
}

const CHART_STYLE = {
  tooltip: { background: '#fff', border: '1px solid #ede9fe', borderRadius: 12, color: '#1e293b', fontSize: 12 },
  grid: 'rgba(139,92,246,0.08)',
  tick: '#94a3b8',
}

export default function Statistics({ examData, questions }: StatisticsProps) {
  const navigate = useNavigate()
  const { state, getCard, topicAccuracy } = useSpacedRepetition('exam1')

  const allQs    = questions['exam1'] ?? []
  const allCards = useMemo(
    () => allQs.map(q => state.cards[q.id] ?? createCard(q.id)),
    [allQs, state.cards]
  )

  // Learning curve
  const sessionChartData = useMemo(() => state.stats.sessions.slice(0, 14).reverse().map((s, i) => ({
    name: `S${i + 1}`,
    Genauigkeit: s.totalQuestions > 0 ? Math.round((s.correct / s.totalQuestions) * 100) : 0,
    Fragen: s.totalQuestions,
  })), [state.stats.sessions])

  // Due forecast
  const forecastData = useMemo(() => {
    const fc   = forecastDue(allCards, 7)
    const days = ['So','Mo','Di','Mi','Do','Fr','Sa']
    const today = new Date().getDay()
    return fc.map((count, i) => ({
      name: i === 0 ? 'Heute' : days[(today + i) % 7],
      Fällig: count,
    }))
  }, [allCards])

  // Topic radar data
  const exam = examData['exam1']
  const radarData = useMemo(() => {
    if (!exam) return []
    return exam.topics.map(t => ({
      topic: t.title.length > 18 ? t.title.slice(0, 18) + '…' : t.title,
      Genauigkeit: Math.max(0, topicAccuracy(t.id)),
    })).filter(d => d.Genauigkeit > 0)
  }, [exam, topicAccuracy])

  // Weakest topics
  const topicStats = useMemo(() => {
    if (!exam) return []
    return exam.topics.map(t => ({
      id: t.id, title: t.title,
      accuracy: topicAccuracy(t.id),
      answered: state.stats.topicStats[t.id]?.answered ?? 0,
    })).filter(t => t.answered > 0).sort((a, b) => a.accuracy - b.accuracy)
  }, [exam, topicAccuracy, state.stats.topicStats])

  // Question type distribution
  const typeData = useMemo(() => [
    { name: 'Multiple Choice', value: allQs.filter(q => q.type === 'multiple_choice').length, color: '#6366f1' },
    { name: 'Wahr/Falsch',     value: allQs.filter(q => q.type === 'true_false').length,      color: '#8b5cf6' },
    { name: 'Lückentext',      value: allQs.filter(q => q.type === 'fill_in_blank').length,   color: '#a78bfa' },
  ], [allQs])

  const globalAcc = state.stats.totalAnswered > 0
    ? Math.round((state.stats.totalCorrect / state.stats.totalAnswered) * 100) : 0

  return (
    <div className="min-h-screen bg-violet-50">
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-violet-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/')}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-violet-50 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-slate-900">Statistiken & Fortschritt</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">

        {/* Summary cards */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: <Target className="w-4 h-4"/>,     label: 'Beantwortet', value: state.stats.totalAnswered, bg: 'bg-primary-50', ic: 'text-primary-600', border: 'border-primary-100' },
            { icon: <Zap className="w-4 h-4"/>,        label: 'Genauigkeit', value: `${globalAcc}%`,           bg: 'bg-amber-50',   ic: 'text-amber-600',   border: 'border-amber-100'   },
            { icon: <TrendingUp className="w-4 h-4"/>, label: 'Richtig',     value: state.stats.totalCorrect,  bg: 'bg-emerald-50', ic: 'text-emerald-600', border: 'border-emerald-100' },
            { icon: <Calendar className="w-4 h-4"/>,   label: 'Streak',      value: `${state.stats.streak} 🔥`,bg: 'bg-sky-50',     ic: 'text-sky-600',     border: 'border-sky-100'     },
          ].map(s => (
            <Card key={s.label} padding="md" className={`border ${s.border}`}>
              <div className={`inline-flex p-2 rounded-xl ${s.bg} mb-2`}>
                <span className={s.ic}>{s.icon}</span>
              </div>
              <div className="text-xl font-bold text-slate-900">{s.value}</div>
              <div className="text-xs text-slate-500">{s.label}</div>
            </Card>
          ))}
        </motion.div>

        {/* Charts row: Lernkurve + Fragentypen */}
        <div className="grid md:grid-cols-3 gap-5">
          {/* Learning curve */}
          {sessionChartData.length > 0 ? (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="md:col-span-2">
              <Card padding="lg">
                <h2 className="font-semibold text-slate-700 mb-4">Lernkurve — Genauigkeit pro Session</h2>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={sessionChartData}>
                    <defs>
                      <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid} />
                    <XAxis dataKey="name" tick={{ fill: CHART_STYLE.tick, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0,100]} tick={{ fill: CHART_STYLE.tick, fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                    <Tooltip contentStyle={CHART_STYLE.tooltip} formatter={(v: number) => [`${v}%`, 'Genauigkeit']} />
                    <Area type="monotone" dataKey="Genauigkeit" stroke="#6366f1" strokeWidth={2.5}
                      fill="url(#accGrad)" dot={{ fill: '#6366f1', r: 3 }} activeDot={{ r: 5 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="md:col-span-2">
              <Card padding="lg" className="flex items-center justify-center h-full text-center">
                <div>
                  <div className="text-4xl mb-3">📈</div>
                  <p className="text-slate-500 text-sm">Lernkurve erscheint nach deiner ersten Session</p>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Question type pie */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
            <Card padding="lg" className="h-full">
              <h2 className="font-semibold text-slate-700 mb-4">Fragentypen</h2>
              <ResponsiveContainer width="100%" height={130}>
                <PieChart>
                  <Pie data={typeData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" strokeWidth={0}>
                    {typeData.map(d => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={CHART_STYLE.tooltip} formatter={(v: number, n: string) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {typeData.map(d => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-600">
                      <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                      {d.name}
                    </span>
                    <span className="font-medium text-slate-800">{d.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Forecast */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card padding="lg">
            <h2 className="font-semibold text-slate-700 mb-4">Wiederholungs-Forecast (nächste 7 Tage)</h2>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={forecastData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid} vertical={false} />
                <XAxis dataKey="name" tick={{ fill: CHART_STYLE.tick, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: CHART_STYLE.tick, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={CHART_STYLE.tooltip} formatter={(v: number) => [v, 'Fällig']} />
                <Bar dataKey="Fällig" fill="#6366f1" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Radar chart — topic mastery */}
        {radarData.length >= 3 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card padding="lg">
              <h2 className="font-semibold text-slate-700 mb-4">Themen-Stärken (Radar)</h2>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke={CHART_STYLE.grid} />
                  <PolarAngleAxis dataKey="topic" tick={{ fill: '#64748b', fontSize: 10 }} />
                  <Radar name="Genauigkeit" dataKey="Genauigkeit" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} />
                  <Tooltip contentStyle={CHART_STYLE.tooltip} formatter={(v: number) => [`${v}%`, 'Genauigkeit']} />
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        )}

        {/* Weakest topics */}
        {topicStats.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <Card padding="lg">
              <h2 className="font-semibold text-slate-700 mb-4">Schwächste Themen</h2>
              <div className="space-y-4">
                {topicStats.slice(0, 8).map(t => (
                  <div key={t.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-slate-700 truncate flex-1">{t.title}</span>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span className="text-xs text-slate-400">{t.answered} Antworten</span>
                        <Badge variant={t.accuracy >= 80 ? 'success' : t.accuracy >= 50 ? 'warning' : 'danger'}>
                          {t.accuracy}%
                        </Badge>
                      </div>
                    </div>
                    <ProgressBar value={t.accuracy} size="sm"
                      color={t.accuracy >= 80 ? 'success' : t.accuracy >= 50 ? 'warning' : 'danger'} />
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {state.stats.totalAnswered === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <div className="text-5xl mb-4">📊</div>
            <p className="text-slate-500">Starte deine erste Lernsession, um Statistiken zu sehen.</p>
            <Button className="mt-4" onClick={() => navigate('/session/exam1')}>Jetzt starten</Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
