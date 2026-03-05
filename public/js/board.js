// Board page logic - Kanban board with drag-and-drop
const API_URL = window.location.origin + '/api';

if (!requireAuth()) throw new Error('Not authenticated');

const urlParams = new URLSearchParams(window.location.search);
const projectId = urlParams.get('id');

if (!projectId) {
    window.location.href = '/dashboard.html';
}

let project = null;
let tasks = [];
let currentTaskId = null;

// Join project room for real-time updates
joinProjectRoom(projectId);

// ===== Load Project =====
async function loadProject() {
    try {
        const res = await fetch(`${API_URL}/projects/${projectId}`, {
            headers: getAuthHeaders()
        });

        if (!res.ok) {
            if (res.status === 401) { logout(); return; }
            if (res.status === 403 || res.status === 404) {
                showToast('Project not found or access denied', 'error');
                setTimeout(() => window.location.href = '/dashboard.html', 1500);
                return;
            }
            throw new Error('Failed to load project');
        }

        project = await res.json();
        document.getElementById('projectTitle').textContent = project.name;
        document.getElementById('projectNameBreadcrumb').textContent = project.name;
        document.title = `TaskFlow - ${project.name}`;

        // Sidebar project info
        document.getElementById('sidebarProjectInfo').innerHTML = `
      <div class="nav-item active">
        <span class="nav-icon">📋</span> ${escapeHtml(project.name)}
      </div>
    `;

        // Populate assignee dropdowns
        populateAssigneeDropdowns();

        // Load tasks after project is loaded
        await loadTasks();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

function populateAssigneeDropdowns() {
    const selectors = ['taskAssignee', 'detailAssignee'];
    selectors.forEach(id => {
        const select = document.getElementById(id);
        if (!select) return;
        const currentVal = select.value;
        select.innerHTML = '<option value="">Unassigned</option>';
        if (project && project.members) {
            project.members.forEach(m => {
                const opt = document.createElement('option');
                opt.value = m._id;
                opt.textContent = m.name;
                select.appendChild(opt);
            });
        }
        select.value = currentVal;
    });
}

// ===== Load Tasks =====
async function loadTasks() {
    try {
        const res = await fetch(`${API_URL}/tasks?project=${projectId}`, {
            headers: getAuthHeaders()
        });

        if (!res.ok) throw new Error('Failed to load tasks');
        tasks = await res.json();
        renderBoard();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// ===== Render Kanban Board =====
function renderBoard() {
    const container = document.getElementById('boardContainer');

    if (!project || !project.columns) {
        container.innerHTML = '<div class="loading-center"><div class="spinner lg"></div></div>';
        return;
    }

    const columns = project.columns.sort((a, b) => a.order - b.order);

    container.innerHTML = columns.map(col => {
        const colTasks = tasks.filter(t => t.column === col.name).sort((a, b) => a.order - b.order);
        const dotClass = col.name === 'To Do' ? 'todo' :
            col.name === 'In Progress' ? 'in-progress' : 'done';

        return `
      <div class="kanban-column" data-column="${escapeHtml(col.name)}">
        <div class="column-header">
          <div class="column-title">
            <div class="column-dot ${dotClass}"></div>
            <h3>${escapeHtml(col.name)}</h3>
            <span class="column-count">${colTasks.length}</span>
          </div>
          <button class="btn-icon" onclick="openCreateTaskModal('${escapeHtml(col.name)}')" title="Add task">＋</button>
        </div>
        <div class="column-body" 
             data-column="${escapeHtml(col.name)}"
             ondragover="handleDragOver(event)"
             ondragleave="handleDragLeave(event)"
             ondrop="handleDrop(event)">
          ${colTasks.map(task => renderTaskCard(task)).join('')}
          ${colTasks.length === 0 ? '<div class="empty-state" style="padding:24px"><p style="font-size:0.8rem">No tasks yet</p></div>' : ''}
        </div>
        <div style="padding:0 8px 8px">
          <button class="add-task-btn" onclick="openCreateTaskModal('${escapeHtml(col.name)}')">
            ＋ Add Task
          </button>
        </div>
      </div>
    `;
    }).join('');
}

function renderTaskCard(task) {
    const assigneeAvatar = task.assignee
        ? `<div class="user-avatar xs" title="${escapeHtml(task.assignee.name)}">${getInitials(task.assignee.name)}</div>`
        : '';

    let dueDateHtml = '';
    if (task.dueDate) {
        const due = new Date(task.dueDate);
        const now = new Date();
        const isOverdue = due < now && task.column !== 'Done';
        dueDateHtml = `<div class="task-due-date ${isOverdue ? 'overdue' : ''}">📅 ${due.toLocaleDateString()}</div>`;
    }

    const labelsHtml = task.labels && task.labels.length > 0
        ? `<div class="task-labels">${task.labels.map(l => `<span class="task-label">${escapeHtml(l)}</span>`).join('')}</div>`
        : '';

    return `
    <div class="task-card" 
         draggable="true"
         data-task-id="${task._id}"
         ondragstart="handleDragStart(event, '${task._id}')"
         ondragend="handleDragEnd(event)"
         onclick="openTaskDetail('${task._id}')">
      <div class="task-card-header">
        <h4>${escapeHtml(task.title)}</h4>
        <span class="priority-badge ${task.priority}">${task.priority}</span>
      </div>
      ${labelsHtml}
      <div class="task-card-meta">
        ${dueDateHtml}
        ${assigneeAvatar}
      </div>
    </div>
  `;
}

// ===== Drag and Drop =====
let draggedTaskId = null;

function handleDragStart(e, taskId) {
    draggedTaskId = taskId;
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId);
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    document.querySelectorAll('.column-body').forEach(col => {
        col.classList.remove('drag-over');
    });
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

async function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    const column = e.currentTarget.dataset.column;
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;

    if (!taskId || !column) return;

    try {
        const res = await fetch(`${API_URL}/tasks/${taskId}/move`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ column })
        });

        if (!res.ok) throw new Error('Failed to move task');

        // Update local state
        const task = tasks.find(t => t._id === taskId);
        if (task) task.column = column;
        renderBoard();
        showToast(`Task moved to ${column}`, 'success');
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// ===== Create Task =====
function openCreateTaskModal(column) {
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDescription').value = '';
    document.getElementById('taskPriority').value = 'medium';
    document.getElementById('taskAssignee').value = '';
    document.getElementById('taskDueDate').value = '';
    document.getElementById('taskColumn').value = column || 'To Do';
    document.getElementById('createTaskError').classList.remove('show');
    populateAssigneeDropdowns();
    openModal('createTaskModal');
}

async function createTask(e) {
    e.preventDefault();
    const title = document.getElementById('taskTitle').value.trim();
    const description = document.getElementById('taskDescription').value.trim();
    const priority = document.getElementById('taskPriority').value;
    const assignee = document.getElementById('taskAssignee').value || null;
    const dueDate = document.getElementById('taskDueDate').value || null;
    const column = document.getElementById('taskColumn').value;
    const errorEl = document.getElementById('createTaskError');

    try {
        const res = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ title, description, project: projectId, column, assignee, priority, dueDate })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        closeModal('createTaskModal');
        showToast('Task created!', 'success');
        await loadTasks();
    } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.add('show');
    }
}

// ===== Task Detail =====
async function openTaskDetail(taskId) {
    currentTaskId = taskId;
    const task = tasks.find(t => t._id === taskId);
    if (!task) return;

    document.getElementById('taskDetailTitle').textContent = task.title;
    document.getElementById('detailDescription').value = task.description || '';

    // Populate column dropdown
    const colSelect = document.getElementById('detailColumn');
    colSelect.innerHTML = project.columns.map(c =>
        `<option value="${escapeHtml(c.name)}" ${c.name === task.column ? 'selected' : ''}>${escapeHtml(c.name)}</option>`
    ).join('');

    populateAssigneeDropdowns();
    document.getElementById('detailAssignee').value = task.assignee ? task.assignee._id : '';
    document.getElementById('detailPriority').value = task.priority;
    document.getElementById('detailDueDate').value = task.dueDate ? task.dueDate.split('T')[0] : '';
    document.getElementById('detailCreatedBy').textContent = task.createdBy ? task.createdBy.name : 'Unknown';

    // Load comments
    await loadComments(taskId);

    openModal('taskDetailModal');
}

async function updateTaskField(field, value) {
    if (!currentTaskId) return;

    try {
        const body = {};
        body[field] = value || null;

        const res = await fetch(`${API_URL}/tasks/${currentTaskId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(body)
        });

        if (!res.ok) throw new Error('Failed to update task');

        showToast('Task updated', 'success');
        await loadTasks();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function deleteTask() {
    if (!currentTaskId) return;

    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
        const res = await fetch(`${API_URL}/tasks/${currentTaskId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (!res.ok) throw new Error('Failed to delete task');

        closeModal('taskDetailModal');
        showToast('Task deleted', 'success');
        await loadTasks();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// ===== Comments =====
async function loadComments(taskId) {
    try {
        const res = await fetch(`${API_URL}/comments?task=${taskId}`, {
            headers: getAuthHeaders()
        });

        if (!res.ok) throw new Error('Failed to load comments');
        const comments = await res.json();
        renderComments(comments);
    } catch (err) {
        console.error('Error loading comments:', err);
    }
}

function renderComments(comments) {
    const list = document.getElementById('commentsList');

    if (comments.length === 0) {
        list.innerHTML = '<div class="empty-state" style="padding:12px"><p style="font-size:0.8rem;color:var(--text-muted)">No comments yet. Be the first!</p></div>';
        return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    list.innerHTML = comments.map(c => `
    <div class="comment-item">
      <div class="user-avatar xs">${getInitials(c.author.name)}</div>
      <div class="comment-body">
        <div class="comment-header">
          <span class="comment-author">${escapeHtml(c.author.name)}</span>
          <span class="comment-time">${timeAgo(c.createdAt)}</span>
        </div>
        <p class="comment-text">${escapeHtml(c.text)}</p>
      </div>
      ${c.author._id === user._id ? `<button class="btn-icon" onclick="deleteComment('${c._id}')" title="Delete" style="flex-shrink:0">✕</button>` : ''}
    </div>
  `).join('');

    // Scroll to bottom
    list.scrollTop = list.scrollHeight;
}

async function addComment() {
    const input = document.getElementById('commentInput');
    const text = input.value.trim();
    if (!text || !currentTaskId) return;

    try {
        const res = await fetch(`${API_URL}/comments`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ text, task: currentTaskId })
        });

        if (!res.ok) throw new Error('Failed to add comment');

        input.value = '';
        await loadComments(currentTaskId);
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function deleteComment(commentId) {
    try {
        const res = await fetch(`${API_URL}/comments/${commentId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (!res.ok) throw new Error('Failed to delete comment');
        await loadComments(currentTaskId);
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// ===== Add Members =====
function openAddMembersModal() {
    if (!project) return;

    const list = document.getElementById('membersList');
    list.innerHTML = project.members.map(m => `
    <div class="member-row">
      <div class="user-avatar sm">${getInitials(m.name)}</div>
      <div class="member-info">
        <div class="member-name">${escapeHtml(m.name)}</div>
        <div class="member-email">${escapeHtml(m.email)}</div>
      </div>
      ${m._id === project.owner._id ? '<span class="owner-badge">Owner</span>' : ''}
    </div>
  `).join('');

    document.getElementById('memberEmail').value = '';
    document.getElementById('addMemberError').classList.remove('show');
    openModal('addMembersModal');
}

async function addMemberToProject() {
    const email = document.getElementById('memberEmail').value.trim();
    const errorEl = document.getElementById('addMemberError');

    if (!email) {
        errorEl.textContent = 'Please enter an email address';
        errorEl.classList.add('show');
        return;
    }

    try {
        const res = await fetch(`${API_URL}/projects/${projectId}/members`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ email })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        document.getElementById('memberEmail').value = '';
        errorEl.classList.remove('show');
        showToast('Member added!', 'success');
        await loadProject();
        openAddMembersModal();
    } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.add('show');
    }
}

// ===== Socket Events =====
if (socket) {
    socket.on('task:created', (task) => {
        if (task.project === projectId || (task.project && task.project._id === projectId)) {
            loadTasks();
        }
    });

    socket.on('task:updated', (task) => {
        if (task.project === projectId || (task.project && task.project._id === projectId)) {
            loadTasks();
        }
    });

    socket.on('task:moved', (task) => {
        if (task.project === projectId || (task.project && task.project._id === projectId)) {
            loadTasks();
        }
    });

    socket.on('task:deleted', (data) => {
        if (data.project === projectId || (data.project && data.project.toString() === projectId)) {
            loadTasks();
        }
    });

    socket.on('comment:added', (data) => {
        if (data.taskId === currentTaskId) {
            loadComments(currentTaskId);
        }
    });

    socket.on('project:updated', (updatedProject) => {
        if (updatedProject._id === projectId) {
            project = updatedProject;
            document.getElementById('projectTitle').textContent = project.name;
            populateAssigneeDropdowns();
        }
    });
}

// ===== Init =====
loadProject();
