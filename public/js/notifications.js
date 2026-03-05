// Notifications module
const API_BASE = window.location.origin + '/api';

function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    };
}

async function loadNotifications() {
    try {
        const res = await fetch(`${API_BASE}/notifications`, {
            headers: getAuthHeaders()
        });
        const notifications = await res.json();

        const list = document.getElementById('notifList');
        const badge = document.getElementById('notifBadge');
        const unreadCount = notifications.filter(n => !n.read).length;

        if (unreadCount > 0) {
            badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }

        if (notifications.length === 0) {
            list.innerHTML = '<div class="no-notifications">No notifications yet</div>';
            return;
        }

        list.innerHTML = notifications.map(n => `
      <div class="notification-item ${n.read ? 'read' : 'unread'}" 
           onclick="handleNotificationClick('${n._id}', '${n.link || ''}', ${n.read})">
        <div class="notif-dot"></div>
        <div class="notif-content">
          <div class="notif-message">${escapeHtml(n.message)}</div>
          <div class="notif-time">${timeAgo(n.createdAt)}</div>
        </div>
      </div>
    `).join('');
    } catch (err) {
        console.error('Error loading notifications:', err);
    }
}

async function handleNotificationClick(id, link, isRead) {
    if (!isRead) {
        try {
            await fetch(`${API_BASE}/notifications/${id}/read`, {
                method: 'PUT',
                headers: getAuthHeaders()
            });
            loadNotifications();
        } catch (err) {
            console.error('Error marking notification as read:', err);
        }
    }

    if (link) {
        window.location.href = link;
    }
}

async function markAllRead() {
    try {
        await fetch(`${API_BASE}/notifications/read-all`, {
            method: 'PUT',
            headers: getAuthHeaders()
        });
        loadNotifications();
        showToast('All notifications marked as read', 'success');
    } catch (err) {
        console.error('Error marking all as read:', err);
    }
}

function toggleNotifications() {
    const panel = document.getElementById('notifPanel');
    panel.classList.toggle('show');
}

// Close notification panel when clicking outside
document.addEventListener('click', (e) => {
    const panel = document.getElementById('notifPanel');
    const btn = document.getElementById('notifBtn');
    if (panel && !panel.contains(e.target) && !btn.contains(e.target)) {
        panel.classList.remove('show');
    }
});

// Load on init
loadNotifications();

// Poll every 30 seconds
setInterval(loadNotifications, 30000);

// ===== Utility Functions =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function timeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const icons = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
        warning: '⚠️'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.info}</span>
    <span>${escapeHtml(message)}</span>
  `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
}

function requireAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/';
        return false;
    }
    return true;
}

function loadUserProfile() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const avatarEl = document.getElementById('userAvatar');
    const nameEl = document.getElementById('userName');
    const emailEl = document.getElementById('userEmail');

    if (avatarEl) avatarEl.textContent = getInitials(user.name);
    if (nameEl) nameEl.textContent = user.name || 'User';
    if (emailEl) emailEl.textContent = user.email || '';
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('open');
    overlay.classList.toggle('show');
}

function openModal(id) {
    document.getElementById(id).classList.add('show');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('show');
}

// Close modals on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('show');
        }
    });
});

// Init user profile
loadUserProfile();
