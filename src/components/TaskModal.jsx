import { useState, useEffect } from 'react'
import { X, Sparkles, Loader2 } from 'lucide-react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH']
const STATUSES = ['TODO', 'IN_PROGRESS', 'DONE']

const priorityColors = {
  LOW: 'bg-sky/10 text-sky border-sky/20',
  MEDIUM: 'bg-amber/10 text-amber border-amber/20',
  HIGH: 'bg-rose/10 text-rose border-rose/20',
}

const statusColors = {
  TODO: 'bg-ink-700/50 text-ink-300 border-ink-600',
  IN_PROGRESS: 'bg-amber/10 text-amber border-amber/20',
  DONE: 'bg-acid/10 text-acid-dim border-acid/20',
}

const empty = { title: '', description: '', priority: 'MEDIUM', dueDate: '', status: 'TODO' }

export default function TaskModal({ task, onClose, onSaved, onBlockchainLog }) {
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const isEdit = !!task

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'MEDIUM',
        dueDate: task.dueDate || '',
        status: task.status || 'TODO',
      })
    }
  }, [task])

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.priority) e.priority = 'Priority is required'
    if (!form.status) e.status = 'Status is required'
    return e
  }

  const handleAIGenerate = async () => {
    if (!form.title.trim()) { toast.error('Enter a title first'); return }
    setAiLoading(true)
    try {
      const res = await api.post('/ai/generate', { title: form.title })
      const { description, priority, estimatedTime } = res.data.data
      setForm(p => ({
        ...p,
        description: description,
        priority: PRIORITIES.includes(priority) ? priority : 'MEDIUM',
      }))
      toast.success(`AI generated! Est. time: ${estimatedTime}`)
    } catch {
      toast.error('AI generation failed')
    } finally {
      setAiLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const payload = {
        title: form.title,
        description: form.description,
        priority: form.priority,
        status: form.status,
        dueDate: form.dueDate || null,
      }
      if (isEdit) {
        await api.put(`/tasks/${task.id}`, payload)
        toast.success('Task updated')
        onBlockchainLog?.({ ...task, ...payload }, 'UPDATED', `Task "${payload.title}" updated`)
      } else {
        const res = await api.post('/tasks', payload)
        toast.success('Task created')
        const created = res.data?.data ?? { ...payload, id: Date.now() }
        onBlockchainLog?.(created, 'CREATED', `Task "${payload.title}" created`)
      }
      onSaved()
      onClose()
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="fixed inset-0 bg-ink-950/80 backdrop-blur-sm animate-fadeIn" />

      <div className="relative w-full max-w-lg glass rounded-2xl p-6 animate-scaleIn max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-lg font-600 text-ink-100">
            {isEdit ? 'Edit task' : 'New task'}
          </h2>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg bg-ink-800 hover:bg-ink-700 flex items-center justify-center transition-colors">
            <X size={15} className="text-ink-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Title + AI button */}
          <div>
            <label className="block text-xs font-500 text-ink-300 mb-2 font-mono uppercase tracking-widest">Task title *</label>
            <div className="flex gap-2">
              <input
                value={form.title}
                onChange={e => { setForm(p => ({ ...p, title: e.target.value })); setErrors(p => ({ ...p, title: '' })) }}
                placeholder="e.g. Prepare client presentation"
                className={`flex-1 bg-ink-800 border rounded-xl px-4 py-3 text-ink-100 text-sm placeholder-ink-600 outline-none transition-all focus:border-acid focus:ring-2 focus:ring-acid/10 ${errors.title ? 'border-rose' : 'border-ink-700'}`}
              />
              <button type="button" onClick={handleAIGenerate} disabled={aiLoading}
                title="Generate description with AI"
                className="flex items-center gap-1.5 px-3 py-2 bg-acid/10 border border-acid/20 text-acid text-xs font-500 rounded-xl hover:bg-acid/20 transition-all disabled:opacity-50 whitespace-nowrap">
                {aiLoading
                  ? <Loader2 size={13} className="animate-spin" />
                  : <Sparkles size={13} />}
                AI
              </button>
            </div>
            {errors.title && <p className="text-rose text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-500 text-ink-300 mb-2 font-mono uppercase tracking-widest">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="What needs to be done?"
              rows={3}
              className="w-full bg-ink-800 border border-ink-700 rounded-xl px-4 py-3 text-ink-100 text-sm placeholder-ink-600 outline-none transition-all focus:border-acid focus:ring-2 focus:ring-acid/10 resize-none"
            />
          </div>

          {/* Priority + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-500 text-ink-300 mb-2 font-mono uppercase tracking-widest">Priority *</label>
              <div className="flex flex-col gap-1.5">
                {PRIORITIES.map(p => (
                  <button key={p} type="button"
                    onClick={() => { setForm(f => ({ ...f, priority: p })); setErrors(f => ({ ...f, priority: '' })) }}
                    className={`px-3 py-2 rounded-lg border text-xs font-500 transition-all text-left ${form.priority === p ? priorityColors[p] : 'bg-ink-800 border-ink-700 text-ink-400 hover:border-ink-600'}`}>
                    {p}
                  </button>
                ))}
              </div>
              {errors.priority && <p className="text-rose text-xs mt-1">{errors.priority}</p>}
            </div>

            <div>
              <label className="block text-xs font-500 text-ink-300 mb-2 font-mono uppercase tracking-widest">Status *</label>
              <div className="flex flex-col gap-1.5">
                {STATUSES.map(s => (
                  <button key={s} type="button"
                    onClick={() => { setForm(f => ({ ...f, status: s })); setErrors(f => ({ ...f, status: '' })) }}
                    className={`px-3 py-2 rounded-lg border text-xs font-500 transition-all text-left ${form.status === s ? statusColors[s] : 'bg-ink-800 border-ink-700 text-ink-400 hover:border-ink-600'}`}>
                    {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Due date */}
          <div>
            <label className="block text-xs font-500 text-ink-300 mb-2 font-mono uppercase tracking-widest">Due date</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
              className="w-full bg-ink-800 border border-ink-700 rounded-xl px-4 py-3 text-ink-100 text-sm outline-none transition-all focus:border-acid focus:ring-2 focus:ring-acid/10"
              style={{ colorScheme: 'dark' }}
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl border border-ink-700 text-ink-300 text-sm font-500 hover:bg-ink-800 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl bg-acid text-ink-950 text-sm font-display font-600 hover:bg-acid-dim transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <span className="w-3.5 h-3.5 border-2 border-ink-950/30 border-t-ink-950 rounded-full animate-spin" />}
              {isEdit ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}