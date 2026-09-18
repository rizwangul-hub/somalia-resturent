/**
 * Generates a URL-friendly slug supporting alphanumeric, Somali and Unicode text
 * @param {string} text
 * @returns {string}
 */
function slugify(text) {
  if (!text) return '';

  return text
    .toString()
    .toLowerCase()
    .trim()
    // Replace accented/diacritic characters if any
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Replace non-alphanumeric characters with hyphens
    .replace(/[^a-z0-9]+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, '');
}

module.exports = slugify;
