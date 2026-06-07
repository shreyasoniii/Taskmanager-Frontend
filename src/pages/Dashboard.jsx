import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useBlockchain } from '../context/BlockchainContext'
import api from '../api/axios'
import toast from 'react-hot-toast'
import TaskCard from '../components/TaskCard'
import TaskModal from '../components/TaskModal'
import WalletConnect from '../components/WalletConnect'
import {
  Plus, LogOut, Zap, Search, ListFilter,
  CheckCircle2, Clock, Circle, LayoutGrid
} from 'lucide-react'

const FILTERS = [
  { label: 'All', value: null, icon: LayoutGrid },
  { label: 'Todo', value: 'TODO', icon: Circle },
  { label: 'In Progress', value: 'IN_PROGRESS', icon: Clock },
  { label: 'Done', value: 'DONE', icon: CheckCircle2 },
]

export default function Dashboard() {
  const { user, logout } = useAuth()
  const { logTaskEvent } = useBlockchain()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState(null)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)

  const fetchTasks = useCallback(async () => {
    try {
      const url = filter ? `/tasks?status=${filter}` : '/tasks'
      const res = await api.get(url)
      setTasks(res.data.data || [])
    } catch {
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return
    try {
      const task = tasks.find(t => t.id === id)
      await api.delete(`/tasks/${id}`)
      toast.success('Task deleted')
      if (task) logTaskEvent(task, 'DELETED', `Task "${task.title}" deleted`)
      fetchTasks()
    } catch {
      toast.error('Failed to delete')
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await api.patch(`/tasks/${id}/status?status=${status}`)
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t))
      const task = tasks.find(t => t.id === id)
      if (task) {
        const eventType = status === 'DONE' ? 'COMPLETED' : 'UPDATED'
        logTaskEvent({ ...task, status }, eventType, `Status changed to ${status}`)
      }
    } catch {
      toast.error('Failed to update status')
    }
  }

  const handleEdit = (task) => {
    setEditingTask(task)
    setModalOpen(true)
  }

  const handleModalClose = () => {
    setModalOpen(false)
    setEditingTask(null)
  }

  const filteredTasks = tasks.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    (t.description || '').toLowerCase().includes(search.toLowerCase())
  )

  // Stats
  const stats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'TODO').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    done: tasks.filter(t => t.status === 'DONE').length,
  }

  return (
    <div className="min-h-screen bg-ink-950">
      {/* Background grid */}
      <div className="fixed inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(#b8ff57 1px, transparent 1px), linear-gradient(90deg, #b8ff57 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-ink-800/60 glass">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-acid rounded-lg flex items-center justify-center">
              <Zap size={14} className="text-ink-950" strokeWidth={2.5} />
            </div>
            <span className="font-display font-700 text-base text-ink-100 tracking-tight">TaskFlow</span>
          </div>

          <div className="flex items-center gap-3">
            <WalletConnect />
            <span className="text-ink-400 text-sm hidden sm:block">
              <span className="text-ink-200 font-500">{user?.name}</span>
            </span>
            <button onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ink-700 text-ink-400 text-xs font-500 hover:bg-ink-800 hover:text-ink-200 transition-all">
              <LogOut size={12} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Total', value: stats.total, color: 'text-ink-100' },
            { label: 'Todo', value: stats.todo, color: 'text-sky' },
            { label: 'In Progress', value: stats.inProgress, color: 'text-amber' },
            { label: 'Done', value: stats.done, color: 'text-acid-dim' },
          ].map((s, i) => (
            <div key={s.label} className="glass rounded-xl p-4 animate-fadeUp" style={{ animationDelay: `${i * 60}ms` }}>
              <p className="text-ink-400 text-xs font-mono uppercase tracking-widest mb-1">{s.label}</p>
              <p className={`font-display text-2xl font-700 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="w-full bg-ink-800 border border-ink-700 rounded-xl pl-9 pr-4 py-2.5 text-ink-100 text-sm placeholder-ink-600 outline-none focus:border-acid focus:ring-2 focus:ring-acid/10 transition-all"
            />
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-1.5 bg-ink-900 rounded-xl p-1 border border-ink-800">
            <ListFilter size={13} className="text-ink-500 ml-1.5" />
            {FILTERS.map(f => {
              const Icon = f.icon
              return (
                <button key={f.label} onClick={() => setFilter(f.value)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-500 transition-all ${filter === f.value ? 'bg-acid text-ink-950' : 'text-ink-400 hover:text-ink-200'}`}>
                  <Icon size={11} strokeWidth={2} />
                  <span className="hidden sm:inline">{f.label}</span>
                </button>
              )
            })}
          </div>

          {/* New task button */}
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-acid text-ink-950 text-sm font-display font-600 rounded-xl hover:bg-acid-dim transition-all active:scale-[0.98] acid-glow whitespace-nowrap">
            <Plus size={15} strokeWidth={2.5} />
            New task
          </button>
        </div>

        {/* Task grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl h-32 shimmer-bg" />
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-20 animate-fadeIn">
            <div className="w-12 h-12 rounded-2xl bg-ink-800 flex items-center justify-center mx-auto mb-4">
              <Zap size={20} className="text-ink-500" />
            </div>
            <p className="text-ink-300 font-display font-500 mb-1">
              {search ? 'No tasks match your search' : 'No tasks yet'}
            </p>
            <p className="text-ink-500 text-sm mb-6">
              {search ? 'Try a different keyword' : 'Create your first task to get started'}
            </p>
            {!search && (
              <button onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-acid text-ink-950 text-sm font-display font-600 rounded-xl hover:bg-acid-dim transition-all">
                <Plus size={14} />
                Create task
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredTasks.map((task, i) => (
              <div key={task.id} style={{ animationDelay: `${i * 40}ms` }}>
                <TaskCard
                  task={task}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {modalOpen && (
        <TaskModal
          task={editingTask}
          onClose={handleModalClose}
          onSaved={fetchTasks}
          onBlockchainLog={logTaskEvent}
        />
      )}
    </div>
  )
}