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

const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;

// Define custom levels to ensure 'http' is present
const customLevels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
};

const transportsList = [
    new transports.Console({
        format: format.combine(
            format.colorize(),
            logFormat
        )
    })
];

// Only add file transports if not in production/Vercel
if (!isProduction) {
    transportsList.push(
        new transports.File({
            filename: path.join('logs', 'error.log'),
            level: 'error',
            maxsize: 5 * 1024 * 1024,
            maxFiles: 5,
        }),
        new transports.File({
            filename: path.join('logs', 'combined.log'),
            maxsize: 10 * 1024 * 1024,
            maxFiles: 5,
        })
    );
}

const logger = createLogger({
    levels: customLevels,
    level: isProduction ? 'info' : 'debug',
    format: logFormat,
    transports: transportsList,
    // Handle uncaught exceptions / unhandled rejections
    exceptionHandlers: isProduction ? [] : [
        new transports.File({ filename: path.join('logs', 'exceptions.log') })
    ],
    rejectionHandlers: isProduction ? [] : [
        new transports.File({ filename: path.join('logs', 'rejections.log') })
    ],
});

module.exports = logger;
