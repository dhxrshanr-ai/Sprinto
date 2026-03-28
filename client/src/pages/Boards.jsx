import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { 
  Plus, Search, Folders, ClipboardList, MoreHorizontal, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';

function BoardActionMenu({ project, onDelete }) {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  
  const isOwner = String(project.owner?._id || project.owner) === String(user?._id);
  if (!isOwner) return null;

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); setConfirmDelete(false); }}
        className="p-1 rounded-md text-[var(--text-muted)] hover:bg-[var(--bg-elevated)] transition"
      >
        <MoreHorizontal size={16} />
      </button>

      {menuOpen && (
        <div className={`absolute right-0 mt-1 ${confirmDelete ? 'w-48' : 'w-36'} bg-[var(--bg-elevated)] border border-[var(--border-strong)] rounded-md shadow-xl z-20 overflow-hidden`}>
          {!confirmDelete ? (
            <button
              onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
              className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-500/10 flex items-center gap-2"
            >
              <Trash2 size={12} /> Delete Board
            </button>
          ) : (
            <div className="p-2 flex flex-col gap-2">
              <p className="text-[10px] text-[var(--text-muted)] font-medium text-center">Are you sure?</p>
              <div className="flex gap-1.5">
                <button
                  onClick={(e) => { e.stopPropagation(); setConfirmDelete(false); setMenuOpen(false); onDelete(project._id); }}
                  className="flex-1 py-1 rounded-md bg-red-600 text-white text-[10px] font-bold hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setConfirmDelete(false); }}
                  className="flex-1 py-1 rounded-md bg-[var(--bg-surface)] border border-[var(--border-strong)] text-[var(--text-main)] text-[10px] font-bold hover:bg-[var(--bg-elevated)] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {menuOpen && (
        <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenuOpen(false); }} />
      )}
    </div>
  );
}

export default function Boards() {
  const navigate = useNavigate();
  const { user } = useAuth();
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

  const handleDelete = async (id) => {
    try {
      await api.delete(`/projects/${id}`);
      setProjects(prev => prev.filter(p => String(p._id) !== String(id)));
      toast.success('Board deleted. You can find it in the Trash Bin.');
    } catch {
      toast.error('Failed to delete board');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/projects', form);
      setProjects([data, ...projects]);
      setShowCreate(false);
      setForm({ name: '', description: '' });
      toast.success('Board created');
      navigate(`/board/${data._id}`);
    } catch (err) {
      toast.error('Failed to create board');
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto min-h-full flex flex-col pt-2 sm:pt-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-main)]">Boards</h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Browse and manage all your project boards.
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative flex-1 sm:flex-none sm:w-64 group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" />
            <input 
              type="text" 
              placeholder="Search boards..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)] transition-all"
            />
          </div>
          <Button onClick={() => setShowCreate(true)} icon={Plus}>New Board</Button>
        </div>
      </div>

      <div className="flex-1 pb-20 sm:pb-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="linear-card h-40 animate-pulse" />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center glass-panel rounded-3xl border border-[var(--border-subtle)]">
            <Folders size={48} className="text-[var(--text-muted)] mb-4 opacity-20" />
            <h3 className="text-lg font-bold text-[var(--text-main)] mb-1">No boards found</h3>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mb-6 max-w-xs mx-auto leading-relaxed">
              We couldn't find any boards. Let's start by creating a new one!
            </p>
            <Button onClick={() => setShowCreate(true)} variant="secondary" icon={Plus}>Create Board</Button>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map(project => (
                <motion.div
                  key={project._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -4 }}
                  onClick={() => navigate(`/board/${project._id}`)}
                  className="linear-card group cursor-pointer p-5 flex flex-col h-full border border-[var(--border-subtle)] hover:border-[var(--accent)]/30 transition-all duration-300 relative"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[var(--bg-elevated)] flex items-center justify-center text-[var(--accent)] shrink-0 border border-[var(--border-strong)] shadow-inner">
                      <Folders size={20} />
                    </div>
                    
                    <div className="flex items-center gap-2">
                       <div className="flex -space-x-2">
                        {project.members?.slice(0, 3).map((m, i) => (
                          <div key={m._id} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-[var(--bg-surface)] bg-[var(--bg-elevated)] flex items-center justify-center text-[9px] sm:text-[10px] font-bold shadow-sm" style={{ zIndex: 3 - i }}>
                            {m.name?.charAt(0).toUpperCase()}
                          </div>
                        ))}
                      </div>

                      <BoardActionMenu project={project} onDelete={handleDelete} />
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-[var(--text-main)] text-sm sm:text-base mb-1 group-hover:text-[var(--accent)] transition-colors">{project.name}</h3>
                  <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-6 leading-relaxed flex-1">
                    {project.description || 'No description provided for this board.'}
                  </p>
                  
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-[var(--text-muted)] font-bold pt-4 border-t border-[var(--border-subtle)]">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5"><ClipboardList size={14} /> {project.taskCount || 0} tasks</span>
                    </div>
                    <span className="opacity-70">{new Date(project.updatedAt).toLocaleDateString()}</span>
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
              className="input-field w-full rounded-xl px-4 py-3 text-sm bg-[var(--bg-elevated)] border border-[var(--border-subtle)] focus:border-[var(--accent)] transition-all min-h-[120px] outline-none"
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              placeholder="What is the goal of this board?"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" className="flex-1 rounded-xl" onClick={() => setShowCreate(false)} type="button">Cancel</Button>
            <Button type="submit" className="flex-1 rounded-xl shadow-lg shadow-indigo-500/10">Create Board</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
