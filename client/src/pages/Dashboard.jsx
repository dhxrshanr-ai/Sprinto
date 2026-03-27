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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
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
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              className="p-1 rounded-md text-[var(--text-muted)] opacity-0 group-hover:opacity-100 hover:bg-[var(--bg-elevated)] transition focus:opacity-100"
            >
              <MoreVertical size={16} />
            </button>

            {menuOpen && isOwner && (
              <div className="absolute right-0 mt-1 w-32 bg-[var(--bg-elevated)] border border-[var(--border-strong)] rounded-md shadow-xl z-20 overflow-hidden">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onDelete(project._id, project.name);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-500/10 flex items-center gap-2"
                >
                  <Trash2 size={12} /> Delete Project
                </button>
              </div>
            )}
            
            {/* Click outside overlay */}
            {menuOpen && (
              <div 
                className="fixed inset-0 z-10" 
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} 
              />
            )}
          </div>
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between text-xs text-[var(--text-muted)]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5" title="Tasks">
              <ClipboardList size={12} className="text-[var(--text-muted)]" /> 
              {project.taskCount || 0}
            </span>
            <span className="flex items-center mb-0" title="Members">
              {project.members?.slice(0, 3).map((m, i) => (
                <div key={m._id} title={m.name}
                  className="w-5 h-5 rounded-full border-2 border-[var(--bg-surface)] bg-[var(--bg-elevated)] flex items-center justify-center text-[9px] font-semibold text-[var(--text-main)]"
                  style={{ marginLeft: i > 0 ? '-6px' : 0 }}>
                  {m.name?.charAt(0).toUpperCase()}
                </div>
              ))}
            </span>
          </div>
          <span className="flex items-center gap-1.5">
            <Calendar size={12} /> 
            {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true }).replace('about ', '')}
          </span>
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

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete project "${name}" and all tasks?`)) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(p => p.filter(x => x._id !== id));
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
    } catch {
      toast.error('Failed to create project');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-main)]">Projects</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Manage your team's workflows and tasks.</p>
        </div>
        <Button onClick={() => setShowCreate(true)} icon={Plus}>
          New Project
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <ProjectSkeleton key={i} />)}
          </div>
        ) : projects.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 fade-in">
            <div className="w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center mb-4 text-[var(--text-muted)]">
              <PackageOpen size={32} />
            </div>
            <h3 className="text-lg font-medium text-[var(--text-main)] mb-1">No projects found.</h3>
            <p className="text-sm text-[var(--text-muted)] mb-6 max-w-sm">
              Get started by creating a new project to organize your tasks.
            </p>
            <Button onClick={() => setShowCreate(true)} icon={Plus}>Create Project</Button>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {projects.map(p => (
                <ProjectCard
                  key={p._id}
                  project={p}
                  onOpen={id => navigate(`/board/${id}`)}
                  onDelete={handleDelete}
                  isOwner={p.owner?._id === user?._id}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create a new project">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Project Name"
            placeholder="e.g. Website Redesign"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            autoFocus
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--text-main)]">Description <span className="text-[var(--text-muted)] font-normal">(optional)</span></label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="input-field w-full rounded-md px-3 py-2 text-sm resize-none"
              rows={3}
              placeholder="What is this project about?"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowCreate(false)} type="button">Cancel</Button>
            <Button type="submit" className="flex-1" loading={createLoading}>Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
