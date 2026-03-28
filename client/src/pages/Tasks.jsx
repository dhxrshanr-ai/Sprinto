import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { 
  CheckSquare, Filter, Clock, AlertTriangle, ArrowRight, ClipboardList, 
  CircleDot, Timer, Flame, CheckCircle2, MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PRIORITY_STYLES = {
  high: 'bg-red-500/10 text-red-500 border-red-500/10',
  medium: 'bg-amber-500/10 text-amber-500 border-amber-500/10',
  low: 'bg-blue-500/10 text-blue-500 border-blue-500/10'
};

const COLUMN_ICONS = {
  'To Do': <CircleDot size={14} />,
  'In Progress': <Timer size={14} className="animate-spin-slow" />,
  'Done': <CheckCircle2 size={14} />
};

export default function Tasks() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchTasks = useCallback(async () => {
    try {
      const { data } = await api.get('/tasks/me');
      setTasks(data);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const filteredTasks = tasks.filter(t => {
    if (filter === 'todo') return t.column === 'To Do';
    if (filter === 'progress') return t.column === 'In Progress';
    if (filter === 'done') return t.column === 'Done';
    return true;
  });

  const getPriorityIcon = (p) => {
    if (p === 'high') return <Flame size={12} />;
    if (p === 'medium') return <AlertTriangle size={12} />;
    return <Clock size={12} />;
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-full flex flex-col pt-4 overflow-x-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-main)]">My Tasks</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Focus on what matters. All your assigned tasks in one place.
          </p>
        </div>
        <div className="flex items-center gap-2 p-1 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg">
          {['all', 'todo', 'progress', 'done'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-all duration-200 ${
                filter === f 
                  ? 'bg-[var(--bg-surface)] text-[var(--text-main)] shadow-sm border border-[var(--border-subtle)]' 
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-elevated)]'
              }`}
            >
              {f === 'progress' ? 'In Progress' : f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1">
        {loading ? (
          <div className="space-y-3">
             {[1, 2, 3, 4].map(i => (
              <div key={i} className="linear-card h-16 animate-pulse bg-[var(--bg-elevated)]/50 rounded-lg border border-[var(--border-subtle)]" />
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center glass-panel rounded-2xl border border-[var(--border-subtle)] fade-in">
            <div className="w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center mb-5 text-[var(--text-muted)] opacity-50 shadow-inner">
              <CheckSquare size={32} />
            </div>
            <h3 className="text-lg font-medium text-[var(--text-main)] mb-1">Clear skies today</h3>
            <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto">
              No tasks currently {filter !== 'all' ? `in the ${filter} list.` : 'assigned to you.'} Keep up the great work!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredTasks.map((task) => (
                <motion.div
                  key={task._id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="linear-card group hover:bg-[var(--bg-elevated)]/50 transition-all duration-300 p-4 border border-[var(--border-subtle)] hover:border-[var(--accent)]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={`mt-0.5 shrink-0 ${task.column === 'Done' ? 'text-green-500' : 'text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors'}`}>
                      {COLUMN_ICONS[task.column] || <CircleDot size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm font-medium text-[var(--text-main)] truncate ${task.column === 'Done' ? 'line-through opacity-50' : ''}`}>
                        {task.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5">
                        <span className="text-[10px] inline-flex items-center gap-1 font-semibold text-[var(--text-muted)] transition-colors px-1 py-0.5 rounded uppercase tracking-wider bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
                          <ClipboardList size={10} /> {task.project?.name || 'Private Task'}
                        </span>
                        {task.dueDate && (
                          <span className={`text-[10px] inline-flex items-center gap-1 font-semibold transition-colors ${new Date(task.dueDate) < new Date() && task.column !== 'Done' ? 'text-red-400' : 'text-[var(--text-muted)]'}`}>
                            <Clock size={10} /> {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-widest flex items-center gap-1.5 ${PRIORITY_STYLES[task.priority]}`}>
                      {getPriorityIcon(task.priority)} {task.priority}
                    </span>
                    <button 
                      onClick={() => navigate(`/board/${task.project?._id}`)}
                      className="p-2 rounded-md bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-all shadow-sm border border-[var(--border-subtle)] group-hover:scale-110 active:scale-95"
                      title="View on Board"
                    >
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
