import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Plus, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

// ── Add Member Modal ──────────────────────────────────────────────────────────
function AddMemberModal({ projectId, onClose, onAdded }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post(`/projects/${projectId}/members`, { email });
      toast.success('Member added!');
      onAdded(data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    } finally { setLoading(false); }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Invite a Member">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          placeholder="colleague@company.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoFocus
        />
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" className="flex-1" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="flex-1" loading={loading} icon={UserPlus}>Invite</Button>
        </div>
      </form>
    </Modal>
  );
}

// ── Board Page ─────────────────────────────────────────────────────────────────
export default function Board() {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [columns, setColumns] = useState(['To Do', 'In Progress', 'Done']);

  const [showAddMember, setShowAddMember] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask]     = useState(null);
  const [defaultColumn, setDefaultColumn] = useState('To Do');

  const tasksByCol = useCallback(() => {
    const map = {};
    columns.forEach(c => { map[c] = []; });
    tasks.forEach(t => {
      if (!map[t.column]) map[t.column] = [];
      map[t.column].push(t);
    });
    columns.forEach(c => { map[c].sort((a,b) => a.order - b.order); });
    return map;
  }, [tasks, columns]);

  useEffect(() => {
    const load = async () => {
      try {
        const [projRes, tasksRes] = await Promise.all([
          api.get(`/projects/${projectId}`),
          api.get(`/tasks?project=${projectId}`)
        ]);
        setProject(projRes.data);
        setTasks(tasksRes.data);
        const projCols = projRes.data.columns?.map(c => c.name);
        if (projCols?.length) setColumns(projCols);
      } catch {
        toast.error('Failed to load board');
        navigate('/');
      } finally { setLoading(false); }
    };
    load();
  }, [projectId, navigate]);

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const taskId = draggableId;
    const newColumn = destination.droppableId;

    setTasks(prev => prev.map(t =>
      t._id === taskId ? { ...t, column: newColumn, order: destination.index } : t
    ));

    try {
      await api.put(`/tasks/${taskId}/move`, { column: newColumn, order: destination.index });
    } catch {
      toast.error('Failed to move task');
      const { data } = await api.get(`/tasks?project=${projectId}`);
      setTasks(data);
    }
  };

  const handleTaskSaved = (saved, isNew) => {
    if (isNew) {
      setTasks(prev => [...prev, saved]);
    } else {
      setTasks(prev => prev.map(t => t._id === saved._id ? saved : t));
    }
  };

  const openCreate = (col) => {
    setEditingTask(null);
    setDefaultColumn(col);
    setShowTaskModal(true);
  };
  
  if (loading) return null;

  const grouped = tasksByCol();
  const isOwner = project?.owner?._id === user?._id;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col h-full bg-[var(--bg-base)]"
    >
      {/* Board Header */}
      <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-[var(--text-main)] truncate">{project?.name}</h1>
            <span className="text-xs bg-[var(--bg-elevated)] border border-[var(--border-strong)] text-[var(--text-muted)] px-2 py-0.5 rounded-full uppercase tracking-widest">
              Board
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center">
            {project?.members?.slice(0, 4).map((m, i) => (
              <div key={m._id} title={m.name}
                className="w-7 h-7 rounded-full border-2 border-[var(--bg-surface)] bg-[var(--bg-elevated)] text-[10px] font-bold text-[var(--text-main)] flex items-center justify-center -ml-2 first:ml-0 shadow-sm relative z-10"
              >
                {m.name?.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>

          {isOwner && (
            <Button variant="secondary" size="sm" onClick={() => setShowAddMember(true)} icon={UserPlus}>
              Invite
            </Button>
          )}
          <Button size="sm" onClick={() => openCreate(columns[0])} icon={Plus}>
            Task
          </Button>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="flex-1 overflow-x-auto custom-scrollbar p-6">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 h-full min-w-max pb-4 items-start">
            {columns.map(col => {
              const colTasks = grouped[col] || [];
              return (
                <div
                  key={col}
                  className="flex flex-col w-72 h-full max-h-full"
                >
                  <div className="flex items-center justify-between mb-3 px-1 hover:opacity-100 opacity-90 transition-opacity">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[13px] font-semibold text-[var(--text-main)] uppercase tracking-wide">{col}</h3>
                      <span className="text-[11px] font-medium text-[var(--text-muted)] bg-[var(--bg-elevated)] px-1.5 rounded">
                        {colTasks.length}
                      </span>
                    </div>
                    <button
                      onClick={() => openCreate(col)}
                      className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-0.5 rounded transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <Droppable droppableId={col}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`kanban-column flex-1 py-1 space-y-2.5 overflow-y-auto custom-scrollbar transition-all ${snapshot.isDraggingOver ? 'bg-[var(--border-subtle)]/30 rounded-lg p-2' : ''}`}
                        style={{ minHeight: 150 }}
                      >
                        {colTasks.map((task, idx) => (
                          <Draggable key={task._id} draggableId={task._id} index={idx}>
                            {(drag, snap) => (
                              <div
                                ref={drag.innerRef}
                                {...drag.draggableProps}
                                {...drag.dragHandleProps}
                                style={{
                                  ...drag.draggableProps.style,
                                  opacity: snap.isDragging ? 0.8 : 1,
                                  transform: snap.isDragging ? `${drag.draggableProps.style.transform} scale(1.05)` : drag.draggableProps.style.transform
                                }}
                              >
                                <TaskCard
                                  task={task}
                                  onEdit={(t) => { setEditingTask(t); setShowTaskModal(true); }}
                                  currentUser={user}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                  
                  <button
                    onClick={() => openCreate(col)}
                    className="mt-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center gap-1.5 py-1.5 px-2 hover:bg-[var(--bg-surface)] rounded-lg border border-transparent hover:border-[var(--border-subtle)] transition-colors"
                  >
                    <Plus size={12} /> New Task
                  </button>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>

      {showAddMember && (
        <AddMemberModal
          projectId={projectId}
          onClose={() => setShowAddMember(false)}
          onAdded={updated => setProject(updated)}
        />
      )}

      {showTaskModal && (
        <TaskModal
          projectId={projectId}
          task={editingTask}
          defaultColumn={defaultColumn}
          members={project?.members || []}
          currentUser={user}
          onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
          onSaved={handleTaskSaved}
        />
      )}
    </motion.div>
  );
}
