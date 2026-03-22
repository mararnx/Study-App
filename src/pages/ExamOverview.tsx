import { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, CheckSquare, Square, BookOpen, ChevronDown, ChevronUp, Target } from 'lucide-react'
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition'
import type { Question, ExamData } from '@/types'

interface ExamOverviewProps {
  examData:  Record<string, ExamData>
  questions: Record<string, Question[]>
}

function DifficultyBar({ questions }: { questions: Question[] }) {
  const easy   = questions.filter(q => q.difficulty === 'easy').length
  const medium = questions.filter(q => q.difficulty === 'medium').length
  const hard   = questions.filter(q => q.difficulty === 'hard').length
  const total  = questions.length || 1
  return (
    <div className="flex h-1.5 rounded-full overflow-hidden w-20 flex-shrink-0">
      <div className="bg-emerald-400" style={{ width: `${(easy/total)*100}%` }} />
      <div className="bg-amber-400"   style={{ width: `${(medium/total)*100}%` }} />
      <div className="bg-red-400"     style={{ width: `${(hard/total)*100}%` }} />
    </div>
  )
}

export default function ExamOverview({ examData, questions }: ExamOverviewProps) {
  const { examId = 'exam1' } = useParams<{ examId: string }>()
  const navigate = useNavigate()
  const { state, selectedTopics, setSelectedTopics, dueCount, masteryPercent, topicAccuracy } = useSpacedRepetition(examId)

  const [expandedTopic, setExpandedTopic] = useState<string | null>(null)
  const exam = examData[examId]
  const qs   = questions[examId] ?? []

  const questionsByTopic = useMemo(() =>
    Object.fromEntries((exam?.topics ?? []).map(t => [t.id, qs.filter(q => q.topic === t.id)])),
    [exam, qs]
  )

  const isSelected = (id: string) => !selectedTopics.length || selectedTopics.includes(id)

  const toggleTopic = (id: string) => {
    const all = exam?.topics.map(t => t.id) ?? []
    if (!selectedTopics.length) {
      setSelectedTopics(all.filter(x => x !== id))
    } else if (selectedTopics.includes(id)) {
      const next = selectedTopics.filter(x => x !== id)
      setSelectedTopics(next.length === all.length ? [] : next)
    } else {
      const next = [...selectedTopics, id]
      setSelectedTopics(next.length === all.length ? [] : next)
    }
  }

  const strength = (id: string): 'strong' | 'medium' | 'weak' | 'new' => {
    const a = topicAccuracy(id)
    if (a === -1) return 'new'
    if (a >= 80)  return 'strong'
    if (a >= 50)  return 'medium'
    return 'weak'
  }

  const sConf = {
    strong: { variant: 'success' as const, label: 'Stark'  },
    medium: { variant: 'warning' as const, label: 'Mittel' },
    weak:   { variant: 'danger'  as const, label: 'Schwach'},
    new:    { variant: 'default' as const, label: 'Neu'    },
  }

  const overallMastery = masteryPercent(qs)
  const totalDue       = dueCount(qs, selectedTopics.length ? selectedTopics : undefined)
  const selectedCount  = selectedTopics.length || (exam?.topics.length ?? 0)
  const acc            = state.stats.totalAnswered > 0
    ? Math.round((state.stats.totalCorrect / state.stats.totalAnswered) * 100) : 0

  if (!exam) return (
    <div className="min-h-screen bg-violet-50 flex items-center justify-center">
      <p className="text-slate-500">Prüfung nicht gefunden</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-violet-50">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-violet-100 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/')}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-violet-50 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-slate-900 truncate">{exam.examTitle}</h1>
            <p className="text-xs text-slate-400">{qs.length} Fragen · {exam.topics.length} Themen</p>
          </div>
          <Button size="md" onClick={() => navigate(`/session/${examId}`)}>
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Session starten</span>
            {totalDue > 0 && (
              <span className="ml-1 bg-white/25 text-white text-xs px-1.5 py-0.5 rounded-full">{totalDue}</span>
            )}
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Stats row */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3">

          {/* Radial mastery gauge */}
          <Card padding="md" className="flex flex-col items-center justify-center text-center">
            <div className="relative h-20 w-20">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%"
                  startAngle={225} endAngle={-45}
                  data={[{ value: overallMastery, fill: '#6366f1' }]} barSize={8}>
                  <RadialBar background={{ fill: '#ede9fe' }} dataKey="value" cornerRadius={8} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-slate-900">{overallMastery}%</span>
              </div>
            </div>
            <span className="text-xs text-slate-500 mt-1">Gemeistert</span>
          </Card>

          <Card padding="md" className="flex flex-col justify-center">
            <div className="text-2xl font-bold text-slate-900">{totalDue}</div>
            <div className="text-xs text-slate-500 mt-0.5">Fällig heute</div>
          </Card>
          <Card padding="md" className="flex flex-col justify-center">
            <div className="text-2xl font-bold text-slate-900">{state.stats.totalAnswered}</div>
            <div className="text-xs text-slate-500 mt-0.5">Beantwortet</div>
          </Card>
          <Card padding="md" className="flex flex-col justify-center">
            <div className="text-2xl font-bold text-slate-900">{acc}%</div>
            <div className="text-xs text-slate-500 mt-0.5">Genauigkeit</div>
          </Card>
        </motion.div>

        {/* Difficulty legend */}
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="font-medium text-slate-600">Schwierigkeit:</span>
          {[['bg-emerald-400','Leicht'],['bg-amber-400','Mittel'],['bg-red-400','Schwer']].map(([c,l]) => (
            <span key={l} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-sm ${c}`}/>{l}
            </span>
          ))}
        </div>

        {/* Topic list */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-800">
              Themen
              <span className="ml-2 text-xs text-slate-400 font-normal">
                {selectedCount} von {exam.topics.length} ausgewählt
              </span>
            </h2>
            <Button variant="ghost" size="sm" onClick={() => setSelectedTopics([])}>
              Alle auswählen
            </Button>
          </div>

          <div className="space-y-2">
            {exam.topics.map((topic, i) => {
              const topicQs  = questionsByTopic[topic.id] ?? []
              const str      = strength(topic.id)
              const topicDue = dueCount(topicQs)
              const topicMp  = masteryPercent(topicQs)
              const expanded = expandedTopic === topic.id
              const sel      = isSelected(topic.id)

              return (
                <motion.div key={topic.id}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.03 }}>
                  <Card padding="none"
                    className={`overflow-hidden transition-all duration-200 ${sel ? 'border-violet-200' : 'border-violet-100 opacity-60'}`}>

                    <div className="flex items-center gap-3 p-4">
                      <button onClick={() => toggleTopic(topic.id)}
                        className="flex-shrink-0 text-slate-300 hover:text-primary-500 transition-colors">
                        {sel
                          ? <CheckSquare className="w-5 h-5 text-primary-500" />
                          : <Square className="w-5 h-5" />}
                      </button>

                      <div className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => setExpandedTopic(expanded ? null : topic.id)}>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-slate-800 text-sm">{topic.title}</span>
                          <Badge variant={sConf[str].variant}>{sConf[str].label}</Badge>
                          {topicDue > 0 && <Badge variant="primary" dot>{topicDue} fällig</Badge>}
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex-1">
                            <ProgressBar value={topicMp} size="xs"
                              color={str === 'strong' ? 'success' : str === 'medium' ? 'warning' : str === 'weak' ? 'danger' : 'primary'} />
                          </div>
                          <DifficultyBar questions={topicQs} />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-slate-400 hidden sm:block">{topicQs.length}</span>
                        <button onClick={() => setExpandedTopic(expanded ? null : topic.id)}
                          className="text-slate-300 hover:text-slate-600 transition-colors">
                          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {expanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                          className="overflow-hidden">
                          <div className="px-4 pb-4 border-t border-violet-100 pt-3 space-y-3">
                            <p className="text-xs text-slate-500">{topic.description}</p>

                            {/* Difficulty breakdown */}
                            <div className="p-3 bg-violet-50 rounded-xl">
                              <p className="text-xs font-medium text-slate-600 mb-2">Schwierigkeitsverteilung</p>
                              {(['easy','medium','hard'] as const).map(d => {
                                const n   = topicQs.filter(q => q.difficulty === d).length
                                const pct = topicQs.length ? Math.round((n/topicQs.length)*100) : 0
                                const conf = {
                                  easy:   { label: 'Leicht', bar: 'bg-emerald-400' },
                                  medium: { label: 'Mittel', bar: 'bg-amber-400'   },
                                  hard:   { label: 'Schwer', bar: 'bg-red-400'     },
                                }[d]
                                return (
                                  <div key={d} className="flex items-center gap-2 mb-1.5">
                                    <span className="text-xs text-slate-500 w-12">{conf.label}</span>
                                    <div className="flex-1 h-1.5 bg-white rounded-full overflow-hidden">
                                      <div className={`h-full ${conf.bar} rounded-full`} style={{ width: `${pct}%` }} />
                                    </div>
                                    <span className="text-xs text-slate-500 w-4 text-right">{n}</span>
                                  </div>
                                )
                              })}
                            </div>

                            <div className="space-y-1.5">
                              {topic.learningGoals.map(g => (
                                <div key={g.id} className="flex items-start gap-2">
                                  <Target className="w-3.5 h-3.5 text-primary-400 flex-shrink-0 mt-0.5" />
                                  <span className="text-xs text-slate-600">{g.description}</span>
                                </div>
                              ))}
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                              {topic.sourceBlocks.map(b => (
                                <span key={b} className="text-xs px-2 py-0.5 bg-white border border-violet-200 rounded-lg text-slate-500">{b}</span>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="pb-8">
          <Button size="xl" fullWidth onClick={() => navigate(`/session/${examId}`)}>
            <BookOpen className="w-5 h-5" />
            Session mit {selectedCount} Themen starten
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
