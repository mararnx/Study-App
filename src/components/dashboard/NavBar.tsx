import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, BookOpen, BarChart2, GraduationCap } from 'lucide-react'
import { cn } from '@/utils/cn'

const navItems = [
  { path: '/',           label: 'Home',        icon: Home },
  { path: '/exam/exam1', label: 'Übersicht',   icon: BookOpen },
  { path: '/stats',      label: 'Statistiken', icon: BarChart2 },
]

export function NavBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const isSession = location.pathname.startsWith('/session')
  if (isSession) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:top-0 md:bottom-auto">
      {/* Mobile */}
      <div className="md:hidden bg-white/90 backdrop-blur-xl border-t border-violet-100 px-2 pb-safe shadow-sm">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map(item => {
            const active = location.pathname === item.path
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'relative flex flex-col items-center gap-1 py-3 px-4 rounded-2xl transition-colors',
                  active ? 'text-primary-600' : 'text-slate-400 hover:text-slate-700',
                )}
              >
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -top-0.5 w-8 h-0.5 bg-primary-500 rounded-full"
                  />
                )}
                <item.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden md:block bg-white/90 backdrop-blur-xl border-b border-violet-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary-500" />
            <span className="font-bold text-slate-900 text-lg">StudyFlow</span>
            <span className="text-primary-600 text-xs font-medium bg-primary-50 border border-primary-100 px-2 py-0.5 rounded-full">MA 8</span>
          </div>
          <div className="flex items-center gap-1">
            {navItems.map(item => {
              const active = location.pathname === item.path
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary-50 text-primary-700 border border-primary-100'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-violet-50',
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
