import { Calendar, Tag, AlertCircle, Clock } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { motion } from 'framer-motion';

const PRIORITY_META = {
  low:    { color: '#888888', label: 'Low' },
  medium: { color: '#5e6ad2', label: 'Medium' },
  high:   { color: '#f59e0b', label: 'High' },
  urgent: { color: '#ef4444', label: 'Urgent' },
};

export default function TaskCard({ task, onEdit, currentUser }) {
  const pm = PRIORITY_META[task.priority] || PRIORITY_META.medium;

  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && isPast(dueDate) && !isToday(dueDate);
  const isDueToday = dueDate && isToday(dueDate);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      whileTap={{ scale: 0.97 }}
      className="linear-card p-4 group cursor-pointer bg-[var(--bg-surface)] flex flex-col gap-2 relative"
      onClick={() => onEdit(task)}
      id={`task-card-${task._id}`}
      style={{ borderLeft: `3px solid ${pm.color}` }}
    >
      {/* Title */}
      <h4 className="text-[13px] sm:text-[14px] font-semibold text-[var(--text-main)] leading-tight">{task.title}</h4>

      {/* Description preview */}
      {task.description && (
        <p className="text-[11px] sm:text-[13px] text-[var(--text-muted)] line-clamp-2 leading-relaxed">{task.description}</p>
      )}

      {/* Labels */}
      {task.labels?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {task.labels.slice(0,3).map(lbl => (
            <span key={lbl} className="text-[10px] sm:text-[11px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-main)] px-1.5 py-0.5 rounded-md flex items-center gap-1 font-medium shadow-sm">
              {lbl}
            </span>
          ))}
        </div>
      )}

      {/* Bottom row */}
      <div className="flex items-center justify-between mt-1 pt-2 sm:mt-2 sm:pt-3 border-t border-[var(--border-subtle)] text-[10px] sm:text-[12px]">
        {/* Priority & Date */}
        <div className="flex items-center gap-2">
          {dueDate && (
            <span className={`flex items-center gap-1.5 font-medium ${
              isOverdue ? 'text-[var(--error)]' :
              isDueToday ? 'text-[var(--warning)]' :
              'text-[var(--text-muted)]'
            }`}>
              {isOverdue ? <AlertCircle size={13}/> : <Clock size={13}/>}
              {format(dueDate, 'MMM d')}
            </span>
          )}
        </div>

        {/* Assignee avatar */}
        {task.assignee && (
          <div
            className="w-6 h-6 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[10px] font-bold text-[var(--text-main)] flex items-center justify-center shrink-0 shadow-sm"
            title={task.assignee.name}
          >
            {task.assignee.name?.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </motion.div>
  );
}
