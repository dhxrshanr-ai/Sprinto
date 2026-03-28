require('dotenv').config();
const express = require('express');
const http    = require('http');
const cors    = require('cors');
const morgan  = require('morgan');
const { Server } = require('socket.io');
const connectDB    = require('./config/db');
const { connectRedis } = require('./config/redis');
const setupSocket  = require('./socket/index');
const logger       = require('./config/logger');
const compression  = require('compression');

// ── Bootstrap ─────────────────────────────────────────────────────────────────
connectDB();
connectRedis();

const app    = express();
const server = http.createServer(app);

// ── Socket.IO ─────────────────────────────────────────────────────────────────
let io;
if (process.env.VERCEL) {
    // Mock IO for serverless environment to prevent crashes
    io = {
        to: () => ({ emit: () => {} }),
        emit: () => {},
        on: () => {},
    };
    logger.info('Running in Vercel: Socket.IO initialized in mock mode');
} else {
    const io_server = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            credentials: true,
        }
    });
    io = io_server;
    setupSocket(io);
}
app.set('io', io);

// ── Middleware ────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.CLIENT_URL || '*').split(',');
app.use(cors({
    origin: allowedOrigins.includes('*') ? '*' : (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin)) cb(null, true);
        else cb(new Error('CORS policy violation'));
    },
    credentials: true,
}));

// Use compression for better performance
app.use(compression());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// HTTP request logging (Morgan → Winston)
app.use(morgan(':method :url :status :res[content-length] - :response-time ms', {
    stream: { write: (msg) => logger.http(msg.trim()) }
}));

// Serve static files (public folder)
app.use(express.static('public'));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/projects',      require('./routes/projects'));
app.use('/api/tasks',         require('./routes/tasks'));
app.use('/api/comments',      require('./routes/comments'));
app.use('/api/notifications', require('./routes/notifications'));

// Health check endpoint
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV || 'development',
    });
});

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
    logger.error(err.message, { stack: err.stack });
    res.status(err.status || 500).json({
        message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

// Export the app/server for Vercel
module.exports = app;

if (require.main === module || (process.env.NODE_ENV !== 'production' && !process.env.VERCEL)) {
    server.listen(PORT, () => {
        logger.info(`Sprinto backend running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    });
}
