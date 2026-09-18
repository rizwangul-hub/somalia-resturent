/**
 * Safely escapes characters with special meaning in Regular Expressions
 * Prevents regex injection and syntax errors when searching with characters like +, (, ), [, ], *
 */
function escapeRegex(text) {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = escapeRegex;
