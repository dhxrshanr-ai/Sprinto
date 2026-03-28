import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { 
  Plus, Search, Folders, Calendar, ClipboardList, Filter, MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';

export default function Boards() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });

  const fetchProjects = useCallback(async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch {
      toast.error('Failed to load boards');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/projects', form);
      setProjects([data, ...projects]);
      setShowCreate(false);
      setForm({ name: '', description: '' });
      toast.success('Board created');
      navigate(`/board/${data._id}`);
    } catch {
      toast.error('Failed to create board');
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-full flex flex-col pt-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[var(--text-main)]">Boards</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Browse and manage all your project boards.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-64 group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" />
            <input 
              type="text" 
              placeholder="Search boards..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-md pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:border-[var(--accent)] transition-all"
            />
          </div>
          <Button onClick={() => setShowCreate(true)} icon={Plus}>New Board</Button>
        </div>
      </div>

      <div className="flex-1">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="linear-card h-40 animate-pulse bg-[var(--bg-elevated)]/50 rounded-xl border border-[var(--border-subtle)]" />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center glass-panel rounded-2xl border border-[var(--border-subtle)]">
            <Folders size={48} className="text-[var(--text-muted)] mb-4 opacity-20" />
            <h3 className="text-lg font-medium text-[var(--text-main)] mb-1">No boards found</h3>
            <p className="text-sm text-[var(--text-muted)] mb-6 max-w-xs mx-auto">
              We couldn't find any boards matching your search or linked to your account.
            </p>
            <Button onClick={() => setShowCreate(true)} variant="secondary" icon={Plus}>Create your first board</Button>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map(project => (
                <motion.div
                  key={project._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -4 }}
                  onClick={() => navigate(`/board/${project._id}`)}
                  className="linear-card group cursor-pointer p-6 flex flex-col h-full border border-[var(--border-subtle)] hover:border-[var(--accent)]/30 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--accent)] shrink-0 border border-[var(--border-strong)] shadow-inner">
                      <Folders size={20} />
                    </div>
                    <div className="flex -space-x-2">
                       {project.members?.slice(0, 3).map((m, i) => (
                        <div key={m._id} className="w-7 h-7 rounded-full border-2 border-[var(--bg-surface)] bg-[var(--bg-elevated)] flex items-center justify-center text-[10px] font-bold shadow-sm" style={{ zIndex: 3 - i }}>
                          {m.name?.charAt(0).toUpperCase()}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-[var(--text-main)] mb-2 group-hover:text-[var(--accent)] transition-colors">{project.name}</h3>
                  <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-6 leading-relaxed flex-1">
                    {project.description || 'No description provided for this board.'}
                  </p>
                  
                  <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] font-medium pt-4 border-t border-[var(--border-subtle)]">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5"><ClipboardList size={14} /> {project.taskCount || 0} tasks</span>
                    </div>
                    <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create New Board">
        <form onSubmit={handleCreate} className="space-y-4 pt-2">
          <Input 
            label="Board Name" 
            value={form.name} 
            onChange={e => setForm({...form, name: e.target.value})} 
            placeholder="e.g. Q1 Product Roadmap" 
            required
            autoFocus 
          />
          <div>
            <label className="text-sm font-medium text-[var(--text-main)] block mb-1.5 ml-0.5">Description</label>
            <textarea 
              className="input-field w-full rounded-md px-3 py-2 text-sm bg-[var(--bg-elevated)] border border-[var(--border-subtle)] focus:border-[var(--accent)] transition-all min-h-[100px] outline-none"
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              placeholder="What is the goal of this board?"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" className="flex-1 font-medium" onClick={() => setShowCreate(false)} type="button">Cancel</Button>
            <Button type="submit" className="flex-1 font-medium shadow-lg shadow-[var(--accent)]/20">Create Board</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
