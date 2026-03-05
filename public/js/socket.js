// Socket.IO client connection
let socket = null;

function initSocket() {
    const token = localStorage.getItem('token');
    if (!token) return;

    socket = io(window.location.origin, {
        auth: { token }
    });

    socket.on('connect', () => {
        console.log('WebSocket connected');
    });

    socket.on('connect_error', (err) => {
        console.error('WebSocket connection error:', err.message);
    });

    socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
    });

    // Notification event
    socket.on('notification:new', (data) => {
        showToast(data.message, 'info');
        if (typeof loadNotifications === 'function') {
            loadNotifications();
        }
    });

    return socket;
}

function joinProjectRoom(projectId) {
    if (socket) {
        socket.emit('join:project', projectId);
    }
}

function leaveProjectRoom(projectId) {
    if (socket) {
        socket.emit('leave:project', projectId);
    }
}

// Initialize on load
initSocket();
