// Dashboard page logic
const API_URL = window.location.origin + '/api';

if (!requireAuth()) throw new Error('Not authenticated');

let projects = [];
let currentProjectId = null;

// ===== Fetch & Render Projects =====
async function loadProjects() {
    try {
        const res = await fetch(`${API_URL}/projects`, {
            headers: getAuthHeaders()
        });

        if (!res.ok) {
            if (res.status === 401) {
                logout();
                return;
            }
            throw new Error('Failed to load projects');
        }

        projects = await res.json();
        renderProjects();
        renderSidebarProjects();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

function renderProjects() {
    const grid = document.getElementById('projectsGrid');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (projects.length === 0) {
        grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon">📋</div>
        <h3>No projects yet</h3>
        <p>Create your first project to get started!</p>
        <button class="btn btn-primary" onclick="openCreateProjectModal()">
          ➕ Create Project
        </button>
      </div>
    `;
        return;
    }

    grid.innerHTML = projects.map(p => {
        const isOwner = p.owner._id === user._id;
        const memberAvatars = p.members.slice(0, 3).map(m =>
            `<div class="user-avatar sm" title="${escapeHtml(m.name)}">${getInitials(m.name)}</div>`
        ).join('');
        const overflow = p.members.length > 3 ? `<div class="member-count-overflow">+${p.members.length - 3}</div>` : '';

        return `
      <div class="project-card" onclick="window.location.href='/board.html?id=${p._id}'">
        <div class="project-card-header">
          <h3>${escapeHtml(p.name)}</h3>
          <div class="project-actions" onclick="event.stopPropagation()">
            <button class="btn-icon" onclick="openAddMembersForProject('${p._id}')" title="Members">👥</button>
            ${isOwner ? `<button class="btn-icon" onclick="openDeleteProject('${p._id}')" title="Delete">🗑️</button>` : ''}
          </div>
        </div>
        <p class="description">${escapeHtml(p.description || 'No description')}</p>
        <div class="project-card-footer">
          <div class="member-avatars">${memberAvatars}${overflow}</div>
          <div class="task-count">📝 ${p.taskCount || 0} tasks</div>
        </div>
      </div>
    `;
    }).join('');
}

function renderSidebarProjects() {
    const container = document.getElementById('sidebarProjects');
    container.innerHTML = projects.map(p => `
    <a href="/board.html?id=${p._id}" class="nav-item">
      <span class="nav-icon">📁</span> ${escapeHtml(p.name)}
    </a>
  `).join('');
}

// ===== Create Project =====
function openCreateProjectModal() {
    document.getElementById('projectName').value = '';
    document.getElementById('projectDesc').value = '';
    document.getElementById('createProjectError').classList.remove('show');
    openModal('createProjectModal');
}

async function createProject(e) {
    e.preventDefault();
    const name = document.getElementById('projectName').value.trim();
    const description = document.getElementById('projectDesc').value.trim();
    const errorEl = document.getElementById('createProjectError');

    try {
        const res = await fetch(`${API_URL}/projects`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ name, description })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        closeModal('createProjectModal');
        showToast('Project created successfully!', 'success');
        loadProjects();
    } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.add('show');
    }
}

// ===== Add Members =====
function openAddMembersForProject(projectId) {
    currentProjectId = projectId;
    const project = projects.find(p => p._id === projectId);
    if (!project) return;

    renderMembersList(project);
    document.getElementById('memberEmail').value = '';
    document.getElementById('addMemberError').classList.remove('show');
    openModal('addMembersModal');
}

function renderMembersList(project) {
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
}

async function addMember() {
    const email = document.getElementById('memberEmail').value.trim();
    const errorEl = document.getElementById('addMemberError');

    if (!email) {
        errorEl.textContent = 'Please enter an email address';
        errorEl.classList.add('show');
        return;
    }

    try {
        const res = await fetch(`${API_URL}/projects/${currentProjectId}/members`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ email })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        document.getElementById('memberEmail').value = '';
        errorEl.classList.remove('show');
        showToast('Member added successfully!', 'success');

        // Refresh project data
        await loadProjects();
        const updated = projects.find(p => p._id === currentProjectId);
        if (updated) renderMembersList(updated);
    } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.add('show');
    }
}

// ===== Delete Project =====
function openDeleteProject(projectId) {
    currentProjectId = projectId;
    openModal('deleteProjectModal');
}

async function confirmDeleteProject() {
    try {
        const res = await fetch(`${API_URL}/projects/${currentProjectId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.message);
        }

        closeModal('deleteProjectModal');
        showToast('Project deleted', 'success');
        loadProjects();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

// ===== Socket Events =====
if (socket) {
    socket.on('project:created', () => loadProjects());
    socket.on('project:updated', () => loadProjects());
    socket.on('project:deleted', () => loadProjects());
}

// ===== Init =====
loadProjects();
