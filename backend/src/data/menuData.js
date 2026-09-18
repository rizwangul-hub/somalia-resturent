/**
 * AFLAX Restaurant Initial Menu Data provided by the restaurant
 */

const categories = [
  {
    name: 'Main Food',
    slug: 'main-food',
    description: 'Cuntooyinka waaweyn ee Soomaaliyeed oo dhaqameed ah.',
    sortOrder: 1,
  },
  {
    name: 'Cunto fudud',
    slug: 'cunto-fudud',
    description: 'Fast food iyo cuntooyinka fudud ee degdegga ah.',
    sortOrder: 2,
  },
  {
    name: 'Sheetaro',
    slug: 'sheetaro',
    description: 'Sheetaro iyo cuntooyinka fudud ee galabkii.',
    sortOrder: 3,
  },
  {
    name: 'Cawitaano',
    slug: 'cawitaano',
    description: 'Casiirro dabiici ah iyo cabitaanno cusub oo qabow.',
    sortOrder: 4,
  },
  {
    name: 'Espresso Machine',
    slug: 'espresso-machine',
    description: 'Qaxwo, shaah, cappuccino iyo cabitaannada kulul.',
    sortOrder: 5,
  },
];

const menuItems = [
  // ================= MAIN FOOD (10 items) =================
  { name: 'Isisaar bariis', price: 1.25, categorySlug: 'main-food', sortOrder: 1 },
  { name: 'Baroosto', price: 1.0, categorySlug: 'main-food', sortOrder: 2 },
  { name: 'Feeto malaay', price: 1.0, categorySlug: 'main-food', sortOrder: 3 },
  { name: 'Canjeeyo maraq', price: 0.5, categorySlug: 'main-food', sortOrder: 4 },
  { name: 'Haaf hilib', price: 3.0, categorySlug: 'main-food', sortOrder: 5 },
  { name: 'Niic hilib', price: 1.5, categorySlug: 'main-food', sortOrder: 6 },
  { name: 'Muufo maraq iyo macsaro', price: 0.75, categorySlug: 'main-food', sortOrder: 7 },
  { name: 'Muufo maraq', price: 0.5, categorySlug: 'main-food', sortOrder: 8 },
  { name: 'Soor iyo maraq', price: 0.5, categorySlug: 'main-food', sortOrder: 9 },
  { name: 'Soor iyo caano geel', price: 1.25, categorySlug: 'main-food', sortOrder: 10 },

  // ================= CUNTO FUDUD (17 items) =================
  { name: 'Shuwaarmo large', price: 3.0, categorySlug: 'cunto-fudud', sortOrder: 1 },
  { name: 'Shuwaarmo mediam', price: 2.5, categorySlug: 'cunto-fudud', sortOrder: 2 },
  { name: 'Shuwaarmo small', price: 2.0, categorySlug: 'cunto-fudud', sortOrder: 3 },
  { name: 'Ham beegar large', price: 3.0, categorySlug: 'cunto-fudud', sortOrder: 4 },
  { name: 'Ham beegar mediam', price: 2.0, categorySlug: 'cunto-fudud', sortOrder: 5 },
  { name: 'Hambeegar small', price: 1.5, categorySlug: 'cunto-fudud', sortOrder: 6 },
  { name: 'Denimed large', price: 7.0, categorySlug: 'cunto-fudud', sortOrder: 7 },
  { name: 'Denimed mediam', price: 5.0, categorySlug: 'cunto-fudud', sortOrder: 8 },
  { name: 'Denimed small', price: 3.5, categorySlug: 'cunto-fudud', sortOrder: 9 },
  { name: 'Checking cheps', price: 2.0, categorySlug: 'cunto-fudud', sortOrder: 10 },
  { name: 'Checking cheps chees', price: 2.75, categorySlug: 'cunto-fudud', sortOrder: 11 },
  { name: 'Checking massala', price: 3.0, categorySlug: 'cunto-fudud', sortOrder: 12 },
  { name: 'Chapati massala', price: 1.5, categorySlug: 'cunto-fudud', sortOrder: 13 },
  { name: 'Cheps', price: 1.0, categorySlug: 'cunto-fudud', sortOrder: 14 },
  { name: 'Jabaati fuul', price: 1.5, categorySlug: 'cunto-fudud', sortOrder: 15 },
  { name: 'Malabax odkac', price: 2.0, categorySlug: 'cunto-fudud', sortOrder: 16 },
  { name: '1Jabaati xabadi', price: 0.25, categorySlug: 'cunto-fudud', sortOrder: 17 },
  { name: 'Malabax xabadi', price: 0.25, categorySlug: 'cunto-fudud', sortOrder: 18 },

  // ================= SHEETARO (6 items) =================
  { name: 'Sanbuus', price: 0.25, categorySlug: 'sheetaro', sortOrder: 1 },
  { name: 'Bur', price: 0.15, categorySlug: 'sheetaro', sortOrder: 2 },
  { name: '9Kackac', price: 0.15, categorySlug: 'sheetaro', sortOrder: 3 },
  { name: 'Nafaqo', price: 0.15, categorySlug: 'sheetaro', sortOrder: 4 },
  { name: 'Bajiye', price: 0.15, categorySlug: 'sheetaro', sortOrder: 5 },
  { name: 'Macsharo', price: 0.15, categorySlug: 'sheetaro', sortOrder: 6 },

  // ================= CAWITAANO (11 items) =================
  { name: 'Furulaato', price: 0.5, categorySlug: 'cawitaano', sortOrder: 1 },
  { name: 'Qaro', price: 0.5, categorySlug: 'cawitaano', sortOrder: 2 },
  { name: 'Moos Iyo caano', price: 0.5, categorySlug: 'cawitaano', sortOrder: 3 },
  { name: 'Caano loos', price: 0.5, categorySlug: 'cawitaano', sortOrder: 4 },
  { name: 'Babaay caano', price: 0.75, categorySlug: 'cawitaano', sortOrder: 5 },
  { name: 'Isbarmuundo', price: 0.5, categorySlug: 'cawitaano', sortOrder: 6 },
  { name: 'Afagaadho', price: 1.0, categorySlug: 'cawitaano', sortOrder: 7 },
  { name: 'Maanga sheek', price: 1.0, categorySlug: 'cawitaano', sortOrder: 8 },
  { name: 'Batiiq caano', price: 0.5, categorySlug: 'cawitaano', sortOrder: 9 },
  { name: 'Isbaandhees', price: 0.5, categorySlug: 'cawitaano', sortOrder: 10 },
  { name: 'Liin macan', price: 0.5, categorySlug: 'cawitaano', sortOrder: 11 },

  // ================= ESPRESSO MACHINE (18 items) =================
  { name: 'Espresso', price: 0.5, categorySlug: 'espresso-machine', sortOrder: 1 },
  { name: 'Coffee latte geel', price: 0.75, categorySlug: 'espresso-machine', sortOrder: 2 },
  { name: 'Coffee latte booro', price: 0.5, categorySlug: 'espresso-machine', sortOrder: 3 },
  { name: 'Copicino geel', price: 0.75, categorySlug: 'espresso-machine', sortOrder: 4 },
  { name: 'Copicino booro', price: 0.5, categorySlug: 'espresso-machine', sortOrder: 5 },
  { name: 'Shaah geel', price: 0.5, categorySlug: 'espresso-machine', sortOrder: 6 },
  { name: 'Shaah booro', price: 0.25, categorySlug: 'espresso-machine', sortOrder: 7 },
  { name: 'Qaxwo geel', price: 0.5, categorySlug: 'espresso-machine', sortOrder: 8 },
  { name: 'Qaxwo booro', price: 0.25, categorySlug: 'espresso-machine', sortOrder: 9 },
  { name: 'Flat white', price: 1.0, categorySlug: 'espresso-machine', sortOrder: 10 },
  { name: 'Dodio', price: 0.75, categorySlug: 'espresso-machine', sortOrder: 11 },
  { name: 'Lungo', price: 0.5, categorySlug: 'espresso-machine', sortOrder: 12 },
  { name: 'Makayato esperro caano geel', price: 0.75, categorySlug: 'espresso-machine', sortOrder: 13 },
  { name: 'Makayato esperro caano buuro', price: 0.5, categorySlug: 'espresso-machine', sortOrder: 14 },
  { name: 'Cordado', price: 0.5, categorySlug: 'espresso-machine', sortOrder: 15 },
  { name: 'Dawa tea', price: 1.0, categorySlug: 'espresso-machine', sortOrder: 16 },
  { name: 'Dangues geel', price: 0.5, categorySlug: 'espresso-machine', sortOrder: 17 },
  { name: 'Dangues booro', price: 0.25, categorySlug: 'espresso-machine', sortOrder: 18 },
];

module.exports = {
  categories,
  menuItems,
};
