'use strict';

function jsonFormat(level, msg, meta) {
  return JSON.stringify({ time: new Date().toISOString(), level, msg, ...meta });
}

function prettyFormat(level, msg, meta) {
  const COLORS = { trace: '\x1b[90m', debug: '\x1b[36m', info: '\x1b[32m',
    warn: '\x1b[33m', error: '\x1b[31m', fatal: '\x1b[35m' };
  const RESET = '\x1b[0m';
  const color = COLORS[level] || '';
  const ts = new Date().toISOString();
  const metaStr = meta && Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
  return color + ts + ' [' + level.toUpperCase() + '] ' + msg + metaStr + RESET;
}

function createFormatter(format) {
  const fn = format === 'json' ? jsonFormat : prettyFormat;
  return { log: (level, msg, meta) => fn(level, msg, meta || {}) };
}

module.exports = { jsonFormat, prettyFormat, createFormatter };
