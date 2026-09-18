const fs = require('fs');
const path = require('path');
const { menuItems } = require('../data/menuData');
const slugify = require('../utils/slugify');

const imgDir = path.resolve('../frontend/src/assets/image');
const files = fs.readdirSync(imgDir);

console.log('--- Checking all 63 menu items against 63 images ---');

// Known aliases / spelling differences in Somali / English:
// Menu name -> likely file
const explicitMap = {
  // Main food
  'Isisaar bariis': 'isisaar-bariis.jpg.jpg',
  'Baroosto': 'baroosto.jpg.jpeg',
  'Feeto malaay': 'feeto-malaay.jpg.jpg',
  'Canjeeyo maraq': 'Canjeero maraq.jpg.jpeg', // Canjeeyo vs Canjeero
  'Haaf hilib': 'haaf-hilib.jpg.jpg',
  'Niic hilib': 'niic-hilib.jpg.jpg',
  'Muufo maraq iyo macsaro': 'muufo-maraq-macsaro.jpg.jpg',
  'Muufo maraq': 'muufo-maraq.jpg.jpg',
  'Soor iyo maraq': 'soor-maraq.jpg.jpeg',
  'Soor iyo caano geel': 'soor-caano-geel.jpg.jpeg',

  // Cunto fudud
  'Shuwaarmo large': 'shuwaarmo-large.jpg.jpg',
  'Shuwaarmo mediam': 'shuwaarmo-medium.jpg.jpg', // mediam vs medium
  'Shuwaarmo small': 'shuwaarmo-small.jpg.jpg',
  'Ham beegar large': 'hambeegar-large.jpg.jpeg',
  'Ham beegar mediam': 'hambeegar-medium.jpg.jpg',
  'Hambeegar small': 'hambeegar-small.jpg.jpg',
  'Denimed large': 'denimed-large.jpg.jpg',
  'Denimed mediam': 'denimed-medium.jpg.jpg',
  'Denimed small': 'denimed-small.jpg.jpg',
  'Checking cheps': 'Chicken Chips.jpg.jpg', // Checking cheps = Chicken Chips
  'Checking cheps chees': 'Chicken Chips Cheese.jpg.jpg',
  'Checking massala': 'Chicken Masala.jpg.jpg',
  'Chapati massala': 'Chapati Masala.jpg.jpg',
  'Cheps': 'Chips.jpg.jpeg',
  'Jabaati fuul': 'chapati full.jpg.jpeg', // Jabaati fuul = chapati full
  'Malabax odkac': 'Malabax odkac.jpg.jpeg',
  'Malabax xabadi': 'Malabax xabadi.jpg.jpeg',

  // Sheetaro
  'Sanbuus': 'Sanbuus.jpg.jpeg',
  'Bur': 'Bur.jpg.jpeg',
  '9Kackac': 'Kackac.jpg.jpeg', // 9Kackac vs Kackac
  'Nafaqo': 'Nafaqo.jpg.jpeg',
  'Bajiye': 'Bajiye.jpg.jpeg',
  'Macsharo': 'Macsharo.jpg.jpeg',

  // Cawitaano
  'Furulaato': 'Furulaato.jpg.jpeg',
  'Qaro': 'Qaro.jpg.jpeg',
  'Moos Iyo caano': 'Moos Iyo caano.jpg.jpeg',
  'Caano loos': 'Caano loos.jpg.jpg',
  'Babaay caano': 'Babaay caano.jpg.jpeg',
  'Isbarmuundo': 'Isbarmuundo.jpg.jpeg',
  'Afagaadho': 'Avacado-jpg.jpeg', // Afagaadho = Avocado
  'Maanga sheek': 'Mango shake.jpg.jpg', // Maanga sheek = Mango shake
  'Batiiq caano': 'Batiiq iyo caano.jpg.jpeg', // Batiiq caano vs Batiiq iyo caano
  'Isbaandhees': 'Isbaandhees.jpg.jpeg',
  'Liin macan': 'Liin macan.jpg.jpeg',

  // Espresso Machine
  'Espresso': 'Espresso.jpg.jpg',
  'Coffee latte geel': 'Coffee Latte Geel.jpg.jpg',
  'Coffee latte booro': 'Coffee Latte Booro.jpg.jpg',
  'Copicino geel': 'Cappuccino Geel.jpg.jpg', // Copicino vs Cappuccino
  'Copicino booro': 'Cappuccino Booro.jpg.jpg',
  'Shaah geel': 'Shaah Geel.jpg.jpg',
  'Shaah booro': 'Shaah Booro.jpg.jpg',
  'Qaxwo geel': 'Qaxwo Geel.jpg.jpg',
  'Qaxwo booro': 'Qaxwo Booro.jpg.jpg',
  'Flat white': 'Flat White.jpg.jpg',
  'Dodio': 'Dodio.jpg.jpg',
  'Lungo': 'Lungo.jpg.jpg',
  'Makayato esperro caano geel': 'Macchiato Espresso Caano Geel.jpg.jpg',
  'Makayato esperro caano buuro': 'Macchiato Espresso + Caano Buuro.jpg.jpg',
  'Cordado': 'Cortado.jpg.jpg', // Cordado vs Cortado
  'Dawa tea': 'Dawa Tea.jpg.jpg',
  'Dangues geel': 'dangues-geel.jpg.jpeg',
  'Dangues booro': 'dangues-booro.jpg.jpeg',
};

// Check matched vs unmatched
const matchedFiles = new Set();
let matchedCount = 0;
const results = [];

menuItems.forEach((item) => {
  const targetFile = explicitMap[item.name];
  if (targetFile && files.includes(targetFile)) {
    matchedFiles.add(targetFile);
    matchedCount++;
    results.push({ item: item.name, file: targetFile, status: 'Confidently matched' });
  } else {
    results.push({ item: item.name, file: null, status: 'Needs manual matching' });
  }
});

console.log(`Matched ${matchedCount} / ${menuItems.length} menu items.`);

// Find items without match:
const unmatchedItems = results.filter((r) => r.status === 'Needs manual matching');
console.log('Items without match:', unmatchedItems);

// Find files not matched:
const unmatchedFiles = files.filter((f) => !matchedFiles.has(f));
console.log('Files in directory not assigned to any item:', unmatchedFiles);
