// Vuln 10: Insufficient logging of auditable events
const { createLogger, format, transports, addColors } = require('winston');
require('winston-daily-rotate-file');
const path = require('path');
const { combine, timestamp, printf, colorize } = format;

// Define custom log format with a prefix for audit and error logs
const auditLogFormat = printf(({ level, message, timestamp, meta }) => {
  return `${timestamp} [AUDIT] ${level}: ${message} ${meta ? `Method: ${meta.method}, URL: ${meta.url}` : ''}`;
});

const errorLogFormat = printf(({ level, message, timestamp, meta }) => {
  return `${timestamp} [ERROR] ${level}: ${message} ${meta ? `Method: ${meta.method}, URL: ${meta.url}` : ''}`;
});

// Define custom colors for log levels
const customColors = {
  info: 'green',
  error: 'red',
};

// Add custom colors to winston
addColors(customColors);

// Create a logger for auditable events
const auditLogger = createLogger({
  level: 'info', // Log level
  format: combine(
    timestamp(),
    auditLogFormat
  ),
  transports: [
    new transports.DailyRotateFile({
      filename: path.join(__dirname, '../log/audit-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      level: 'info',
    }),
    new transports.Console({
      format: combine(
        colorize({ all: true }), // Apply custom colors
        auditLogFormat
      )
    })
  ]
});

// Create a logger for errors
const errorLogger = createLogger({
  level: 'error', // Log level
  format: combine(
    timestamp(),
    errorLogFormat
  ),
  transports: [
    new transports.DailyRotateFile({
      filename: path.join(__dirname, '../log/audit-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxFiles: '14d',
      level: 'error',
    }),
    new transports.Console({
      format: combine(
        colorize({ all: true }), // Apply custom colors
        errorLogFormat
      )
    })
  ]
});

module.exports = { auditLogger, errorLogger };