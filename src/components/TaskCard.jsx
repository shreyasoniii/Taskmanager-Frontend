import { Pencil, Trash2, Calendar, ChevronDown } from 'lucide-react'
import BlockchainAudit from './BlockchainAudit'

const priorityColors = {
  LOW: 'text-sky bg-sky/10 border-sky/20',
  MEDIUM: 'text-amber bg-amber/10 border-amber/20',
  HIGH: 'text-rose bg-rose/10 border-rose/20',
}

const statusColors = {
  TODO: 'text-ink-300 bg-ink-700/50 border-ink-600',
  IN_PROGRESS: 'text-amber bg-amber/10 border-amber/20',
  DONE: 'text-acid-dim bg-acid/10 border-acid/20',
}

const statusOptions = ['TODO', 'IN_PROGRESS', 'DONE']

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : null
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE'

  return (
    <div className="glass rounded-xl p-4 group hover:border-ink-600 transition-all duration-200 animate-fadeUp">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-display font-500 text-ink-100 text-sm leading-snug flex-1 line-clamp-2">
          {task.title}
        </h3>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={() => onEdit(task)}
            className="w-7 h-7 rounded-lg bg-ink-800 hover:bg-ink-700 flex items-center justify-center transition-colors">
            <Pencil size={12} className="text-ink-300" />
          </button>
          <button onClick={() => onDelete(task.id)}
            className="w-7 h-7 rounded-lg bg-ink-800 hover:bg-rose/20 flex items-center justify-center transition-colors">
            <Trash2 size={12} className="text-ink-300 hover:text-rose" />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-ink-400 text-xs leading-relaxed mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        {/* Priority badge */}
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-xs font-mono font-500 ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>

        {/* Status dropdown */}
        <div className="relative">
          <select
            value={task.status}
            onChange={e => onStatusChange(task.id, e.target.value)}
            className={`appearance-none inline-flex items-center pl-2 pr-6 py-0.5 rounded-md border text-xs font-500 cursor-pointer outline-none transition-all ${statusColors[task.status]}`}
            style={{ background: 'transparent' }}>
            {statusOptions.map(s => (
              <option key={s} value={s} className="bg-ink-800 text-ink-100">{s.replace('_', ' ')}</option>
            ))}
          </select>
          <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-current opacity-60" />
        </div>

        {/* Due date */}
        {task.dueDate && (
          <span className={`inline-flex items-center gap-1 text-xs font-mono ${isOverdue ? 'text-rose' : 'text-ink-400'}`}>
            <Calendar size={10} />
            {formatDate(task.dueDate)}
            {isOverdue && ' · overdue'}
          </span>
        )}
      </div>

      <BlockchainAudit task={task} />
    </div>
  )
}