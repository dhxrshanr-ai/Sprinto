import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, Trash2, CheckCircle, Clock, Search, 
  RotateCcw, Trash, AlertCircle, ChevronRight
} from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';

export default function Archive() {
  const [activeTab, setActiveTab] = useState('trash');
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState({ projects: [], tasks: [] });
  const [search, setSearch] = useState('');

  const loadArchive = async () => {
    setLoading(true);
    try {
      if (activeTab === 'trash') {
        const [projRes, tasksRes] = await Promise.all([
          api.get('/projects?status=deleted'),
          api.get('/tasks/me?status=deleted')
        ]);
        setItems({ projects: projRes.data, tasks: tasksRes.data });
      } else if (activeTab === 'completed') {
        const [projRes, tasksRes] = await Promise.all([
          api.get('/projects?status=completed'),
          api.get('/tasks/me?status=active')
        ]);
        const completedTasks = tasksRes.data.filter(t => t.column === 'Done');
        setItems({ projects: projRes.data, tasks: completedTasks });
      } else {
        const [projRes, tasksRes] = await Promise.all([
          api.get('/projects?status=active'),
          api.get('/tasks/me?status=active')
        ]);
        const inProgressTasks = tasksRes.data.filter(t => t.column !== 'Done');
        setItems({ projects: projRes.data, tasks: inProgressTasks });
      }
    } catch {
      toast.error('Failed to load archives');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArchive();
  }, [activeTab]);

  const handleRestoreProject = async (id) => {
    try {
      await api.post(`/projects/${id}/restore`);
      toast.success('Project restored');
      loadArchive();
    } catch { toast.error('Restore failed'); }
  };

  const handlePermanentDeleteProject = async (id) => {
    if (!confirm('Permanently delete this project? Action is IRREVERSIBLE.')) return;
    try {
      await api.delete(`/projects/${id}/permanent`);
      toast.success('Project deleted permanently');
      loadArchive();
    } catch { toast.error('Delete failed'); }
  };

  const handleRestoreTask = async (id) => {
    try {
      await api.post(`/tasks/${id}/restore`);
      toast.success('Task restored');
      loadArchive();
    } catch { toast.error('Restore failed'); }
  };

  const filteredProjects = items.projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const filteredTasks = items.tasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));

  const tabs = [
    { id: 'trash', name: 'Trash Bin', icon: Trash2 },
    { id: 'completed', name: 'Completed', icon: CheckCircle },
    { id: 'progress', name: 'In Progress', icon: Clock },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto h-full flex flex-col pt-2 sm:pt-4">
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-main)] flex items-center gap-3">
            <History className="text-[var(--accent)]" size={24} />
            History & Archive
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">Review and manage your past activity.</p>
        </div>

        <div className="relative w-full md:w-64 group">
           <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors" />
           <input 
             type="text" 
             placeholder="Filter archives..." 
             className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[var(--text-main)] outline-none focus:border-[var(--accent)] transition-all"
             value={search}
             onChange={e => setSearch(e.target.value)}
           />
        </div>
      </div>

      <div className="flex items-center gap-1.5 mb-8 bg-[var(--bg-surface)] p-1.5 rounded-2xl border border-[var(--border-subtle)] w-fit self-center md:self-start shadow-sm">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
              activeTab === tab.id 
                ? 'bg-[var(--bg-elevated)] text-[var(--text-main)] shadow-md border border-[var(--border-strong)]' 
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-elevated)]/50'
            }`}
          >
            <tab.icon size={16} />
            {tab.name}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-12"
          >
            <section>
              <div className="flex items-center justify-between mb-5 px-3">
                <h2 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">Projects</h2>
                <div className="h-px bg-[var(--border-subtle)] flex-1 mx-6 opacity-50" />
                <span className="text-[10px] font-bold bg-[var(--bg-elevated)] px-2.5 py-1 rounded-full text-[var(--text-muted)] border border-[var(--border-subtle)]">
                  {filteredProjects.length}
                </span>
              </div>
              
              {filteredProjects.length === 0 ? (
                <div className="linear-card py-16 flex flex-col items-center justify-center border-dashed border-2 border-[var(--border-subtle)] opacity-40 rounded-3xl">
                  <AlertCircle size={40} className="mb-3" />
                  <p className="text-sm font-medium">Empty section</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredProjects.map(proj => (
                    <div key={proj._id} className="linear-card p-5 flex flex-col border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all group rounded-2xl">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-[15px] sm:text-[16px] text-[var(--text-main)]">{proj.name}</h3>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {activeTab === 'trash' && (
                            <>
                              <button 
                                onClick={() => handleRestoreProject(proj._id)}
                                className="p-2 rounded-lg hover:bg-green-500/10 text-green-500 transition-colors" title="Restore"
                              >
                                <RotateCcw size={16} />
                              </button>
                              <button 
                                onClick={() => handlePermanentDeleteProject(proj._id)}
                                className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors" title="Delete Permanently"
                              >
                                <Trash size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-6 leading-relaxed flex-1 opacity-80">{proj.description || 'No description provided'}</p>
                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-[var(--border-subtle)]">
                        <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Sync: {new Date(proj.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="flex items-center justify-between mb-5 px-3">
                <h2 className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">Tasks</h2>
                <div className="h-px bg-[var(--border-subtle)] flex-1 mx-6 opacity-50" />
                <span className="text-[10px] font-bold bg-[var(--bg-elevated)] px-2.5 py-1 rounded-full text-[var(--text-muted)] border border-[var(--border-subtle)]">
                  {filteredTasks.length}
                </span>
              </div>

              {filteredTasks.length === 0 ? (
                <div className="linear-card py-16 flex flex-col items-center justify-center border-dashed border-2 border-[var(--border-subtle)] opacity-40 rounded-3xl">
                  <AlertCircle size={40} className="mb-3" />
                  <p className="text-sm font-medium">Empty section</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTasks.map(task => (
                    <div key={task._id} className="linear-card px-5 py-4 flex items-center border border-[var(--border-subtle)] hover:border-[var(--border-strong)] transition-all group rounded-2xl shadow-sm">
                       <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                             <h4 className="text-sm font-bold text-[var(--text-main)] truncate">{task.title}</h4>
                             <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-subtle)] uppercase tracking-tight">
                                {task.project?.name || 'Sprinto'}
                             </span>
                          </div>
                          <p className="text-[11px] text-[var(--text-muted)] truncate max-w-sm opacity-70">{task.description || 'No additional details.'}</p>
                       </div>
                       
                       <div className="flex items-center gap-2 ml-4">
                          {activeTab === 'trash' && (
                             <button 
                                onClick={() => handleRestoreTask(task._id)}
                                className="p-2.5 rounded-xl hover:bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--accent)] transition-all border border-transparent hover:border-[var(--border-subtle)]"
                             >
                                <RotateCcw size={18} />
                             </button>
                          )}
                          <div className="p-2 text-[var(--text-muted)] opacity-20 group-hover:opacity-100 transition-opacity">
                             <ChevronRight size={18} />
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
