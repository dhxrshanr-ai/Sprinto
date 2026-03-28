import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Button from './ui/Button';

export default function TaskModal({ projectId, task, defaultColumn, members, currentUser, onClose, onSaved }) {
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isEditing = !!task;

  const [form, setForm] = useState({
    title: '',
    description: '',
    column: defaultColumn || 'To Do',
    priority: 'medium',
    assignee: '',
    dueDate: '',
    labels: '',
  });

  useEffect(() => {
    if (isEditing) {
      setForm({
        title: task.title,
        description: task.description || '',
        column: task.column,
        priority: task.priority || 'medium',
        assignee: task.assignee?._id || task.assignee || '',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        labels: task.labels?.join(', ') || '',
      });
    }
  }, [task, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    setLoading(true);
    const payload = {
      ...form,
      project: projectId,
      labels: form.labels.split(',').map(l => l.trim()).filter(Boolean),
    };
    if (!payload.assignee) payload.assignee = null;
    if (!payload.dueDate) payload.dueDate = null;

    try {
      let data;
      if (isEditing) {
        const res = await api.put(`/tasks/${task._id}`, payload);
        data = res.data;
      } else {
        const res = await api.post('/tasks', payload);
        data = res.data;
      }
      onSaved(data, !isEditing);
      onClose();
    } catch {
      toast.error('Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${task._id}`);
      toast.success('Task deleted');
      onSaved({ _id: task._id, _deleted: true }, false);
      onClose();
    } catch {
      toast.error('Failed to delete task');
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={isEditing ? 'Edit Task' : 'New Task'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          placeholder="What needs to be done?"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
          autoFocus={!isEditing}
          required
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-[var(--text-main)] tracking-wide mb-0.5">Description</label>
          <textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="input-field w-full rounded-lg px-3 py-2.5 text-[13px] shadow-sm resize-none custom-scrollbar focus:ring-4 focus:ring-[var(--accent)]/10"
            rows={4}
            placeholder="Add some details..."
          />
        </div>

        <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 sm:gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[var(--text-main)] tracking-wide mb-0.5">Priority</label>
            <select
              value={form.priority}
              onChange={e => setForm({ ...form, priority: e.target.value })}
              className="input-field w-full rounded-lg px-3 py-2.5 text-[13px] shadow-sm focus:ring-4 focus:ring-[var(--accent)]/10"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[var(--text-main)] tracking-wide mb-0.5">Assignee</label>
            <select
              value={form.assignee}
              onChange={e => setForm({ ...form, assignee: e.target.value })}
              className="input-field w-full rounded-lg px-3 py-2.5 text-[13px] shadow-sm focus:ring-4 focus:ring-[var(--accent)]/10"
            >
              <option value="">Unassigned</option>
              {members.map(m => (
                <option key={m._id} value={m._id}>{m.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[var(--text-main)] tracking-wide mb-0.5">Status</label>
            <select
              value={form.column}
              onChange={e => setForm({ ...form, column: e.target.value })}
              className="input-field w-full rounded-lg px-3 py-2.5 text-[13px] shadow-sm focus:ring-4 focus:ring-[var(--accent)]/10"
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>

          <Input
            label="Due Date"
            type="date"
            value={form.dueDate}
            onChange={e => setForm({ ...form, dueDate: e.target.value })}
          />
        </div>

        <Input
          label="Labels"
          placeholder="bug, feature, design (comma separated)"
          value={form.labels}
          onChange={e => setForm({ ...form, labels: e.target.value })}
        />

        <div className="flex items-center justify-between pt-4 mt-2 border-t border-[var(--border-subtle)]">
          {isEditing ? (
            <div className="flex items-center gap-2">
              {!confirmDelete ? (
                <Button 
                  variant="danger" 
                  size="sm" 
                  type="button" 
                  onClick={() => setConfirmDelete(true)}
                  icon={Trash2}
                >
                  Delete
                </Button>
              ) : (
                <div className="flex items-center gap-2 bg-red-500/10 p-1 rounded-lg border border-red-500/20 animate-in fade-in slide-in-from-right-2">
                   <Button 
                    variant="danger" 
                    size="sm" 
                    type="button" 
                    onClick={handleDelete}
                    className="h-8 px-3"
                  >
                    Confirm Delete
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    type="button" 
                    onClick={() => setConfirmDelete(false)}
                    className="h-8 px-3"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          ) : <div />}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onClose} type="button">Cancel</Button>
            <Button type="submit" size="sm" loading={loading}>{isEditing ? 'Save Changes' : 'Create Task'}</Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
