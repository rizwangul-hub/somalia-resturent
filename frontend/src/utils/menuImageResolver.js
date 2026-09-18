/**
 * Menu Item Image Resolver
 * Resolves Cloudinary URLs, static URLs, or maps menu item names/slugs
 * to real photographic culinary assets in frontend/src/assets/image/
 */

const localImages = import.meta.glob('../assets/image/*.*', {
  eager: true,
  import: 'default',
});

// Explicit aliases matching MongoDB menu item names to exact asset filenames
const imageAliases = {
  'isisaar bariis': 'isisaar-bariis.jpg.jpg',
  'baroosto': 'baroosto.jpg.jpeg',
  'feeto malaay': 'feeto-malaay.jpg.jpg',
  'canjeeyo maraq': 'Canjeero maraq.jpg.jpeg',
  'haaf hilib': 'haaf-hilib.jpg.jpg',
  'niic hilib': 'niic-hilib.jpg.jpg',
  'muufo maraq iyo macsaro': 'muufo-maraq-macsaro.jpg.jpg',
  'muufo maraq': 'muufo-maraq.jpg.jpg',
  'soor iyo maraq': 'soor-maraq.jpg.jpeg',
  'soor iyo caano geel': 'soor-caano-geel.jpg.jpeg',
  'shuwaarmo large': 'shuwaarmo-large.jpg.jpg',
  'shuwaarmo mediam': 'shuwaarmo-medium.jpg.jpg',
  'shuwaarmo small': 'shuwaarmo-small.jpg.jpg',
  'ham beegar large': 'hambeegar-large.jpg.jpeg',
  'ham beegar mediam': 'hambeegar-medium.jpg.jpg',
  'hambeegar small': 'hambeegar-small.jpg.jpg',
  'denimed large': 'denimed-large.jpg.jpg',
  'denimed mediam': 'denimed-medium.jpg.jpg',
  'denimed small': 'denimed-small.jpg.jpg',
  'checking cheps': 'Chicken Chips.jpg.jpg',
  'checking cheps chees': 'Chicken Chips Cheese.jpg.jpg',
  'checking massala': 'Chicken Masala.jpg.jpg',
  'chapati massala': 'Chapati Masala.jpg.jpg',
  'cheps': 'Chips.jpg.jpeg',
  'jabaati fuul': 'chapati full.jpg.jpeg',
  '1jabaati xabadi': 'chapati full.jpg.jpeg',
  'malabax odkac': 'Malabax odkac.jpg.jpeg',
  'malabax xabadi': 'Malabax xabadi.jpg.jpeg',
  'sanbuus': 'Sanbuus.jpg.jpeg',
  'bur': 'Bur.jpg.jpeg',
  '9kackac': 'Kackac.jpg.jpeg',
  'nafaqo': 'Nafaqo.jpg.jpeg',
  'bajiye': 'Bajiye.jpg.jpeg',
  'macsharo': 'Macsharo.jpg.jpeg',
  'furulaato': 'Furulaato.jpg.jpeg',
  'qaro': 'Qaro.jpg.jpeg',
  'moos iyo caano': 'Moos Iyo caano.jpg.jpeg',
  'caano loos': 'Caano loos.jpg.jpg',
  'babaay caano': 'Babaay caano.jpg.jpeg',
  'isbarmuundo': 'Isbarmuundo.jpg.jpeg',
  'afagaadho': 'Avacado-jpg.jpeg',
  'maanga sheek': 'Mango shake.jpg.jpg',
  'batiiq caano': 'Batiiq iyo caano.jpg.jpeg',
  'isbaandhees': 'Isbaandhees.jpg.jpeg',
  'liin macan': 'Liin macan.jpg.jpeg',
  'espresso': 'Espresso.jpg.jpg',
  'coffee latte geel': 'Coffee Latte Geel.jpg.jpg',
  'coffee latte booro': 'Coffee Latte Booro.jpg.jpg',
  'copicino geel': 'Cappuccino Geel.jpg.jpg',
  'copicino booro': 'Cappuccino Booro.jpg.jpg',
  'shaah geel': 'Shaah Geel.jpg.jpg',
  'shaah booro': 'Shaah Booro.jpg.jpg',
  'qaxwo geel': 'Qaxwo Geel.jpg.jpg',
  'qaxwo booro': 'Qaxwo Booro.jpg.jpg',
  'flat white': 'Flat White.jpg.jpg',
  'dodio': 'Dodio.jpg.jpg',
  'lungo': 'Lungo.jpg.jpg',
  'makayato esperro caano geel': 'Macchiato Espresso Caano Geel.jpg.jpg',
  'makayato esperro caano buuro': 'Macchiato Espresso + Caano Buuro.jpg.jpg',
  'cordado': 'Cortado.jpg.jpg',
  'dawa tea': 'Dawa Tea.jpg.jpg',
  'dangues geel': 'dangues-geel.jpg.jpeg',
  'dangues booro': 'dangues-booro.jpg.jpeg',
};

// Build index mapping filename -> resolved module URL
const fileToUrl = {};
for (const [key, value] of Object.entries(localImages)) {
  const filename = key.split('/').pop();
  if (filename) {
    fileToUrl[filename.toLowerCase()] = value;
  }
}

/**
 * Get resolved image URL for a menu item
 * @param {Object} item - MenuItem object
 * @returns {string|null} Resolved image URL or null
 */
export function getMenuItemImageUrl(item) {
  if (!item) return null;

  // 1. If explicit Cloudinary/HTTP image exists
  if (item.image && typeof item.image === 'string' && item.image.trim() !== '') {
    return item.image;
  }

  // 2. Lookup alias
  const normName = (item.name || '').toLowerCase().trim();
  const targetFile = imageAliases[normName];

  if (targetFile && fileToUrl[targetFile.toLowerCase()]) {
    return fileToUrl[targetFile.toLowerCase()];
  }

  // 3. Try matching normalized slug/filename directly
  const simpleNorm = normName.replace(/[^a-z0-9]/g, '');
  for (const [fn, url] of Object.entries(fileToUrl)) {
    const fnNorm = fn.split('.')[0].replace(/[^a-z0-9]/g, '');
    if (fnNorm === simpleNorm) {
      return url;
    }
  }

  return null;
}
