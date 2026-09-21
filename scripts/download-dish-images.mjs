/**
 * download-dish-images.mjs
 * One-time script: downloads curated Indian dish photos from Unsplash to public/images/dishes/
 * Run: node scripts/download-dish-images.mjs
 */

import fs from 'fs';
import path from 'path';
import https from 'https';

const OUT_DIR = path.resolve('public/images/dishes');
fs.mkdirSync(OUT_DIR, { recursive: true });

// Curated map: filename → Unsplash photo ID (high-quality, free to use)
const DISHES = {
  // North Indian
  butter_chicken:       'photo-1603894584373-5ac82b2ae398',
  dal_makhani:          'photo-1546833999-b9f581a1996d',
  paneer_tikka:         'photo-1567337710282-00832b415979',
  shahi_paneer:         'photo-1631452180519-c014fe946bc7',
  palak_paneer:         'photo-1618449840665-9ed506d73a34',
  kadai_paneer:         'photo-1631452180519-c014fe946bc7',
  malai_kofta:          'photo-1631452180519-c014fe946bc7',
  rajma_chawal:         'photo-1546833999-b9f581a1996d',
  chole:                'photo-1626200419199-391ae4be7a41',
  aloo_gobi:            'photo-1574653853027-5382a3d23a15',
  dal_tadka:            'photo-1546833999-b9f581a1996d',
  tandoori_chicken:     'photo-1599487488170-d11ec9c172f0',
  rogan_josh:           'photo-1603894584373-5ac82b2ae398',
  nihari:               'photo-1603894584373-5ac82b2ae398',

  // Biryani & Rice
  chicken_biryani:      'photo-1563379091339-03b21ab4a4f8',
  mutton_biryani:       'photo-1563379091339-03b21ab4a4f8',
  veg_biryani:          'photo-1565557623262-b51c2513a641',
  jeera_rice:           'photo-1536304929831-ee1ca9d44906',
  pulao:                'photo-1536304929831-ee1ca9d44906',

  // South Indian
  masala_dosa:          'photo-1589301760014-d929f3979dbc',
  plain_dosa:           'photo-1589301760014-d929f3979dbc',
  idli:                 'photo-1589301760014-d929f3979dbc',
  medu_vada:            'photo-1589301760014-d929f3979dbc',
  uttapam:              'photo-1589301760014-d929f3979dbc',
  rasam:                'photo-1546833999-b9f581a1996d',

  // Street Food
  samosa:               'photo-1601050690597-df0568f70950',
  pav_bhaji:            'photo-1606491956689-2ea866880c84',
  chole_bhature:        'photo-1626200419199-391ae4be7a41',
  pani_puri:            'photo-1625398407796-82b11bf1f745',
  aloo_tikki:           'photo-1601050690597-df0568f70950',
  bhel_puri:            'photo-1625398407796-82b11bf1f745',
  vada_pav:             'photo-1606491956689-2ea866880c84',
  pakora:               'photo-1601050690597-df0568f70950',

  // Breads
  naan:                 'photo-1574484284002-952d92a03a52',
  garlic_naan:          'photo-1574484284002-952d92a03a52',
  tandoori_roti:        'photo-1574484284002-952d92a03a52',
  paratha:              'photo-1574484284002-952d92a03a52',

  // Desserts
  gulab_jamun:          'photo-1601303516534-bf4c3b5c1e24',
  rasgulla:             'photo-1601303516534-bf4c3b5c1e24',
  kheer:                'photo-1601303516534-bf4c3b5c1e24',
  halwa:                'photo-1601303516534-bf4c3b5c1e24',
  jalebi:               'photo-1601303516534-bf4c3b5c1e24',
  rasmalai:             'photo-1601303516534-bf4c3b5c1e24',

  // Beverages
  lassi:                'photo-1588680388937-a4e59bef0e04',
  mango_lassi:          'photo-1588680388937-a4e59bef0e04',
  masala_chai:          'photo-1561336313-0bd5e0b27ec8',
  cold_coffee:          'photo-1461023058943-07fcbe16d735',
  nimbu_pani:           'photo-1556679343-c7306c1976bc',

  // Non-Veg
  chicken_tikka:        'photo-1599487488170-d11ec9c172f0',
  mutton_curry:         'photo-1603894584373-5ac82b2ae398',
  fish_curry:           'photo-1565299585323-38d6b0865b47',
  prawn_masala:         'photo-1565299585323-38d6b0865b47',
};

function download(photoId, filename) {
  return new Promise((resolve, reject) => {
    const outPath = path.join(OUT_DIR, `${filename}.jpg`);
    if (fs.existsSync(outPath)) {
      console.log(`  ✓ skip (exists): ${filename}.jpg`);
      resolve();
      return;
    }

    const url = `https://images.unsplash.com/${photoId}?w=600&h=450&fit=crop&q=80&fm=jpg`;

    const file = fs.createWriteStream(outPath);
    https.get(url, { headers: { 'User-Agent': 'MenzoMenuApp/1.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        // Follow redirect
        https.get(res.headers.location, { headers: { 'User-Agent': 'MenzoMenuApp/1.0' } }, (res2) => {
          res2.pipe(file);
          file.on('finish', () => { file.close(); console.log(`  ✓ ${filename}.jpg`); resolve(); });
        }).on('error', reject);
        return;
      }
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(outPath);
        console.warn(`  ✗ ${filename}.jpg (HTTP ${res.statusCode})`);
        resolve(); // don't crash the whole run
        return;
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); console.log(`  ✓ ${filename}.jpg`); resolve(); });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
      console.warn(`  ✗ ${filename}.jpg (${err.message})`);
      resolve();
    });
  });
}

// Run downloads sequentially to avoid rate-limiting
(async () => {
  console.log(`Downloading ${Object.keys(DISHES).length} dish images to ${OUT_DIR}\n`);
  for (const [filename, photoId] of Object.entries(DISHES)) {
    await download(photoId, filename);
    await new Promise(r => setTimeout(r, 100)); // 100ms between requests
  }
  console.log('\nDone. Run `npm run dev` to see images.');
})();
