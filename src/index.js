'use strict';
// Parse and analyze structured or plain-text application logs

const LEVELS = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];

function parseLine(line) {
  const jsonMatch = line.match(/^\{.+\}$/);
  if (jsonMatch) {
    try { return JSON.parse(line); } catch (_) {}
  }
  const textMatch = line.match(/(\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}[^\s]*)\s+(\w+)\s+(.*)/);
  if (textMatch) return { time: textMatch[1], level: textMatch[2].toLowerCase(), msg: textMatch[3] };
  return { level: 'info', msg: line };
}

function analyze(logText) {
  const lines = logText.split('
').filter(Boolean);
  const counts = Object.fromEntries(LEVELS.map((l) => [l, 0]));
  const errors = [];
  const parsed = lines.map(parseLine);
  parsed.forEach((entry) => {
    const lvl = (entry.level || 'info').toLowerCase();
    if (counts[lvl] !== undefined) counts[lvl]++;
    if (lvl === 'error' || lvl === 'fatal') errors.push(entry);
  });
  return { total: lines.length, counts, errors };
}

function filter(logText, level) {
  const idx = LEVELS.indexOf(level.toLowerCase());
  if (idx === -1) throw new Error('Unknown log level: ' + level);
  return logText.split('
').filter((line) => {
    const entry = parseLine(line);
    return LEVELS.indexOf((entry.level || '').toLowerCase()) >= idx;
  }).join('
');
}

function summarize(logText) {
  const { total, counts, errors } = analyze(logText);
  return {
    total,
    counts,
    errorRate: total > 0 ? ((counts.error + counts.fatal) / total * 100).toFixed(2) + '%' : '0%',
    topErrors: errors.slice(0, 5).map((e) => e.msg),
  };
}

module.exports = { parseLine, analyze, filter, summarize };
