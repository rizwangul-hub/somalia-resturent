/**
 * AFLAX Restaurant Static / Offline Fallback Menu Data
 * Ensures all 63 items and 5 categories are ALWAYS displayed even if backend is temporarily starting up
 */

export const fallbackCategories = [
  {
    _id: 'cat-main-food',
    name: 'Main Food',
    slug: 'main-food',
    description: 'Cuntooyinka waaweyn ee Soomaaliyeed oo dhaqameed ah.',
    sortOrder: 1,
  },
  {
    _id: 'cat-cunto-fudud',
    name: 'Cunto fudud',
    slug: 'cunto-fudud',
    description: 'Fast food iyo cuntooyinka fudud ee degdegga ah.',
    sortOrder: 2,
  },
  {
    _id: 'cat-sheetaro',
    name: 'Sheetaro',
    slug: 'sheetaro',
    description: 'Sheetaro iyo cuntooyinka fudud ee galabkii.',
    sortOrder: 3,
  },
  {
    _id: 'cat-cawitaano',
    name: 'Cawitaano',
    slug: 'cawitaano',
    description: 'Casiirro dabiici ah iyo cabitaanno cusub oo qabow.',
    sortOrder: 4,
  },
  {
    _id: 'cat-espresso-machine',
    name: 'Espresso Machine',
    slug: 'espresso-machine',
    description: 'Qaxwo, shaah, cappuccino iyo cabitaannada kulul.',
    sortOrder: 5,
  },
];

const rawItems = [
  // MAIN FOOD
  { name: 'Isisaar bariis', price: 1.25, categorySlug: 'main-food' },
  { name: 'Baroosto', price: 1.0, categorySlug: 'main-food' },
  { name: 'Feeto malaay', price: 1.0, categorySlug: 'main-food' },
  { name: 'Canjeeyo maraq', price: 0.5, categorySlug: 'main-food' },
  { name: 'Haaf hilib', price: 3.0, categorySlug: 'main-food' },
  { name: 'Niic hilib', price: 1.5, categorySlug: 'main-food' },
  { name: 'Muufo maraq iyo macsaro', price: 0.75, categorySlug: 'main-food' },
  { name: 'Muufo maraq', price: 0.5, categorySlug: 'main-food' },
  { name: 'Soor iyo maraq', price: 0.5, categorySlug: 'main-food' },
  { name: 'Soor iyo caano geel', price: 1.25, categorySlug: 'main-food' },

  // CUNTO FUDUD
  { name: 'Shuwaarmo large', price: 3.0, categorySlug: 'cunto-fudud' },
  { name: 'Shuwaarmo mediam', price: 2.5, categorySlug: 'cunto-fudud' },
  { name: 'Shuwaarmo small', price: 2.0, categorySlug: 'cunto-fudud' },
  { name: 'Ham beegar large', price: 3.0, categorySlug: 'cunto-fudud' },
  { name: 'Ham beegar mediam', price: 2.0, categorySlug: 'cunto-fudud' },
  { name: 'Hambeegar small', price: 1.5, categorySlug: 'cunto-fudud' },
  { name: 'Denimed large', price: 7.0, categorySlug: 'cunto-fudud' },
  { name: 'Denimed mediam', price: 5.0, categorySlug: 'cunto-fudud' },
  { name: 'Denimed small', price: 3.5, categorySlug: 'cunto-fudud' },
  { name: 'Checking cheps', price: 2.0, categorySlug: 'cunto-fudud' },
  { name: 'Checking cheps chees', price: 2.75, categorySlug: 'cunto-fudud' },
  { name: 'Checking massala', price: 3.0, categorySlug: 'cunto-fudud' },
  { name: 'Chapati massala', price: 1.5, categorySlug: 'cunto-fudud' },
  { name: 'Cheps', price: 1.0, categorySlug: 'cunto-fudud' },
  { name: 'Jabaati fuul', price: 1.5, categorySlug: 'cunto-fudud' },
  { name: 'Malabax odkac', price: 2.0, categorySlug: 'cunto-fudud' },
  { name: '1Jabaati xabadi', price: 0.25, categorySlug: 'cunto-fudud' },
  { name: 'Malabax xabadi', price: 0.25, categorySlug: 'cunto-fudud' },

  // SHEETARO
  { name: 'Sanbuus', price: 0.25, categorySlug: 'sheetaro' },
  { name: 'Bur', price: 0.15, categorySlug: 'sheetaro' },
  { name: '9Kackac', price: 0.15, categorySlug: 'sheetaro' },
  { name: 'Nafaqo', price: 0.15, categorySlug: 'sheetaro' },
  { name: 'Bajiye', price: 0.15, categorySlug: 'sheetaro' },
  { name: 'Macsharo', price: 0.15, categorySlug: 'sheetaro' },

  // CAWITAANO
  { name: 'Furulaato', price: 0.5, categorySlug: 'cawitaano' },
  { name: 'Qaro', price: 0.5, categorySlug: 'cawitaano' },
  { name: 'Moos Iyo caano', price: 0.5, categorySlug: 'cawitaano' },
  { name: 'Caano loos', price: 0.5, categorySlug: 'cawitaano' },
  { name: 'Babaay caano', price: 0.75, categorySlug: 'cawitaano' },
  { name: 'Isbarmuundo', price: 0.5, categorySlug: 'cawitaano' },
  { name: 'Afagaadho', price: 1.0, categorySlug: 'cawitaano' },
  { name: 'Maanga sheek', price: 1.0, categorySlug: 'cawitaano' },
  { name: 'Batiiq caano', price: 0.5, categorySlug: 'cawitaano' },
  { name: 'Isbaandhees', price: 0.5, categorySlug: 'cawitaano' },
  { name: 'Liin macan', price: 0.5, categorySlug: 'cawitaano' },

  // ESPRESSO MACHINE
  { name: 'Espresso', price: 0.5, categorySlug: 'espresso-machine' },
  { name: 'Coffee latte geel', price: 0.75, categorySlug: 'espresso-machine' },
  { name: 'Coffee latte booro', price: 0.5, categorySlug: 'espresso-machine' },
  { name: 'Copicino geel', price: 0.75, categorySlug: 'espresso-machine' },
  { name: 'Copicino booro', price: 0.5, categorySlug: 'espresso-machine' },
  { name: 'Shaah geel', price: 0.5, categorySlug: 'espresso-machine' },
  { name: 'Shaah booro', price: 0.25, categorySlug: 'espresso-machine' },
  { name: 'Qaxwo geel', price: 0.5, categorySlug: 'espresso-machine' },
  { name: 'Qaxwo booro', price: 0.25, categorySlug: 'espresso-machine' },
  { name: 'Flat white', price: 1.0, categorySlug: 'espresso-machine' },
  { name: 'Dodio', price: 0.75, categorySlug: 'espresso-machine' },
  { name: 'Lungo', price: 0.5, categorySlug: 'espresso-machine' },
  { name: 'Makayato esperro caano geel', price: 0.75, categorySlug: 'espresso-machine' },
  { name: 'Makayato esperro caano buuro', price: 0.5, categorySlug: 'espresso-machine' },
  { name: 'Cordado', price: 0.5, categorySlug: 'espresso-machine' },
  { name: 'Dawa tea', price: 1.0, categorySlug: 'espresso-machine' },
  { name: 'Dangues geel', price: 0.5, categorySlug: 'espresso-machine' },
  { name: 'Dangues booro', price: 0.25, categorySlug: 'espresso-machine' },
];

export const fallbackMenuItems = rawItems.map((item, idx) => ({
  _id: `fallback-${item.categorySlug}-${idx + 1}`,
  name: item.name,
  slug: item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  price: item.price,
  category: fallbackCategories.find((c) => c.slug === item.categorySlug) || {
    name: item.categorySlug,
    slug: item.categorySlug,
  },
  isAvailable: true,
  description: `Cunto macaan oo tayo sare leh oo lagu diyaariyey AFLAX Restaurant, Yaqshiid.`,
}));
