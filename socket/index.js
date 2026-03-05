const jwt = require('jsonwebtoken');
const Project = require('../models/Project');

module.exports = function setupSocket(io) {
    // Authenticate socket connections
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', async (socket) => {
        console.log(`User connected: ${socket.userId}`);

        // Join user's personal room
        socket.join(`user:${socket.userId}`);

        // Join all project rooms the user is a member of
        try {
            const projects = await Project.find({ members: socket.userId });
            projects.forEach(project => {
                socket.join(`project:${project._id}`);
            });
        } catch (error) {
            console.error('Error joining project rooms:', error);
        }

        // Handle joining a specific project room
        socket.on('join:project', (projectId) => {
            socket.join(`project:${projectId}`);
        });

        // Handle leaving a project room
        socket.on('leave:project', (projectId) => {
            socket.leave(`project:${projectId}`);
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.userId}`);
        });
    });
};
