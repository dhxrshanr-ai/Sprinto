import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  Plus, Folders, Trash2, Calendar, ClipboardList, PackageOpen, MoreVertical
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

// ── Skeleton Loader ────────────────────────────────────────────────────────
const ProjectSkeleton = () => (
  <div className="linear-card p-5 animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="w-3/4">
        <div className="h-5 bg-[var(--border-strong)] rounded mb-2 w-full" />
        <div className="h-3 bg-[var(--border-subtle)] rounded w-2/3" />
      </div>
    </div>
    <div className="flex items-center gap-4 mt-8">
      <div className="h-3 bg-[var(--border-strong)] rounded w-16" />
      <div className="h-3 bg-[var(--border-strong)] rounded w-16" />
    </div>
  </div>
);

// ── Project Card ──────────────────────────────────────────────────────────────
function ProjectCard({ project, onOpen, onDelete, isOwner }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="linear-card group cursor-pointer relative"
      onClick={() => onOpen(project._id)}
    >
      <div className="p-5 flex flex-col h-full">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-4">
            <h3 className="font-semibold text-[var(--text-main)] text-sm truncate">{project.name}</h3>
            <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2 leading-relaxed">
              {project.description || 'No description provided.'}
            </p>
          </div>

          <div className="relative">
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); setConfirmDelete(false); }}
              className="p-1 rounded-md text-[var(--text-muted)] opacity-0 group-hover:opacity-100 hover:bg-[var(--bg-elevated)] transition focus:opacity-100"
            >
              <MoreVertical size={16} />
            </button>

            {menuOpen && isOwner && (
              <div className={`absolute right-0 mt-1 ${confirmDelete ? 'w-44' : 'w-36'} bg-[var(--bg-elevated)] border border-[var(--border-strong)] rounded-lg shadow-2xl z-20 overflow-hidden`}>
                {!confirmDelete ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDelete(true);
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-xs text-red-500 hover:bg-red-500/10 flex items-center gap-2 transition-colors font-medium"
                  >
                    <Trash2 size={12} /> Delete Project
                  </button>
                ) : (
                  <div className="p-2.5 flex flex-col gap-2">
                    <p className="text-[10px] text-[var(--text-muted)] font-bold text-center uppercase tracking-wider">Are you sure?</p>
                    <div className="flex gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDelete(false);
                          setMenuOpen(false);
                          onDelete(project._id);
                        }}
                        className="flex-1 py-1.5 rounded-md bg-red-600 text-white text-[10px] font-bold hover:bg-red-700 transition-colors shadow-sm"
                      >
                        Delete
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDelete(false);
                        }}
                        className="flex-1 py-1.5 rounded-md bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-main)] text-[10px] font-bold hover:bg-[var(--bg-elevated)] transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {menuOpen && (
              <div 
                className="fixed inset-0 z-10" 
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); setConfirmDelete(false); }} 
              />
            )}
          </div>
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between text-[11px] text-[var(--text-muted)] font-medium">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5" title="Tasks">
              <ClipboardList size={12} className="opacity-50" /> 
              {project.taskCount || 0}
            </span>
            <div className="flex -space-x-1.5">
              {project.members?.slice(0, 3).map((m, i) => (
                <div key={m._id} 
                  className="w-5 h-5 rounded-full border-2 border-[var(--bg-surface)] bg-[var(--bg-elevated)] flex items-center justify-center text-[8px] font-bold text-[var(--text-main)] shadow-sm"
                  style={{ zIndex: 3 - i }}>
                  {m.name?.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>
          </div>
          <span className="opacity-70">{formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Dashboard Page ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [createLoading, setCreateLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleDelete = async (id) => {
    try {
      await api.delete(`/projects/${id}`);
      setProjects(p => p.filter(x => String(x._id) !== String(id)));
      toast.success('Project deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete project');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setCreateLoading(true);
    try {
      const { data } = await api.post('/projects', form);
      toast.success('Project created');
      setProjects([data, ...projects]);
      setShowCreate(false);
      setForm({ name: '', description: '' });
      navigate(`/board/${data._id}`);
    } catch {
      toast.error('Failed to create project');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-main)]">Projects</h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">Manage your team's workflows at the speed of focus.</p>
        </div>
        <Button onClick={() => setShowCreate(true)} icon={Plus}>
          New Project
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pb-16 sm:pb-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <ProjectSkeleton key={i} />)}
          </div>
        ) : projects.length === 0 ? (
          <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center px-4 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 rounded-3xl bg-[var(--bg-elevated)] flex items-center justify-center mb-6 text-[var(--text-muted)] border border-[var(--border-subtle)] shadow-xl rotate-3">
              <PackageOpen size={36} />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-main)] mb-2">No projects yet</h3>
            <p className="text-sm text-[var(--text-muted)] mb-8 max-w-xs mx-auto leading-relaxed">
              Create your first project to start organizing tasks and sprinting toward goals.
            </p>
            <Button onClick={() => setShowCreate(true)} icon={Plus} size="lg" className="rounded-2xl shadow-xl shadow-indigo-500/10">Create First Project</Button>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            <AnimatePresence mode="popLayout">
              {projects.map(p => (
                <ProjectCard
                  key={p._id}
                  project={p}
                  onOpen={id => navigate(`/board/${id}`)}
                  onDelete={handleDelete}
                  isOwner={String(p.owner?._id || p.owner) === String(user?._id)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create a new project">
        <form onSubmit={handleCreate} className="space-y-4 pt-1">
          <Input
            label="Project Name"
            placeholder="e.g. Website Redesign"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            autoFocus
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest ml-1 mb-1">Description <span className="font-normal normal-case">(optional)</span></label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="input-field w-full rounded-xl px-4 py-3 text-sm resize-none focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none"
              rows={4}
              placeholder="What is this project about?"
            />
          </div>
          <div className="flex gap-3 pt-6">
            <Button variant="secondary" className="flex-1 rounded-xl py-3" onClick={() => setShowCreate(false)} type="button">Cancel</Button>
            <Button type="submit" className="flex-1 rounded-xl py-3 shadow-lg shadow-indigo-500/10" loading={createLoading}>Create Project</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
