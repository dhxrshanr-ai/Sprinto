const { createLogger, format, transports } = require('winston');
const path = require('path');

// ── Custom log format ─────────────────────────────────────────────────────────
const logFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.printf(({ level, message, timestamp, stack }) => {
        return stack
            ? `[${timestamp}] ${level.toUpperCase()}: ${message}\n${stack}`
            : `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
);

const logger = createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: logFormat,
    transports: [
        // Console output (colorized in dev)
        new transports.Console({
            format: format.combine(
                format.colorize(),
                logFormat
            )
        }),
        // Error log file
        new transports.File({
            filename: path.join('logs', 'error.log'),
            level: 'error',
            maxsize: 5 * 1024 * 1024, // 5MB
            maxFiles: 5,
        }),
        // Combined log file
        new transports.File({
            filename: path.join('logs', 'combined.log'),
            maxsize: 10 * 1024 * 1024, // 10MB
            maxFiles: 5,
        }),
    ],
    // Handle uncaught exceptions / unhandled rejections
    exceptionHandlers: [
        new transports.File({ filename: path.join('logs', 'exceptions.log') })
    ],
    rejectionHandlers: [
        new transports.File({ filename: path.join('logs', 'rejections.log') })
    ],
});

module.exports = logger;
