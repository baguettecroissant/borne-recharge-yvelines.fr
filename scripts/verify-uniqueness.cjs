// Verification script: checks content uniqueness across all 315 pages
// Run: node scripts/verify-uniqueness.js

const communes = require('../src/data/communes.json');

// Simulate the getVariantIndex function
function getVariantIndex(slug, offset, maxVariants) {
  let hash = offset * 31;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash + slug.charCodeAt(i)) | 0;
  }
  // Secondary hash to break collision patterns (Knuth multiplicative)
  hash = hash ^ (slug.length * 2654435761);
  hash = (hash ^ (offset * 16777619)) | 0;
  // Tertiary mix using first+last char codes to differentiate same-length slugs
  hash = (hash + slug.charCodeAt(0) * 7919 + slug.charCodeAt(slug.length - 1) * 104729) | 0;
  return Math.abs(hash) % maxVariants;
}

const categories = ['main', 'copropriete', 'wallbox'];
const CATEGORY_OFFSETS = { main: 0, copropriete: 100, wallbox: 200 };

// Pool sizes — must match contentEngine.ts
const POOL_SIZES = {
  main: { intro: 8, useCase: 6, eco: 6, commData: 6, expertTip: 6, realEstate: 8, popTier: 8 },
  copropriete: { intro: 8, useCase: 6, eco: 6, commData: 6, expertTip: 6, realEstate: 8, popTier: 8 },
  wallbox: { intro: 8, useCase: 6, eco: 6, commData: 6, expertTip: 6, realEstate: 8, popTier: 8 }
};

const offsets = {
  intro: 10,
  useCase: 20,
  eco: 30,
  commData: 40,
  expertTip: 50,
  realEstate: 60,
  popTier: 70,
};

let totalCollisions = 0;
let totalPages = 0;

for (const category of categories) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`CATEGORY: ${category.toUpperCase()}`);
  console.log('='.repeat(60));

  const fingerprints = new Map();
  
  for (const commune of communes) {
    const slug = commune.slug;
    const catOffset = CATEGORY_OFFSETS[category];
    const pools = POOL_SIZES[category];
    
    const fp = [
      getVariantIndex(slug, catOffset + offsets.intro, pools.intro),
      getVariantIndex(slug, catOffset + offsets.useCase, pools.useCase),
      getVariantIndex(slug, catOffset + offsets.eco, pools.eco),
      getVariantIndex(slug, catOffset + offsets.commData, pools.commData),
      getVariantIndex(slug, catOffset + offsets.expertTip, pools.expertTip),
      getVariantIndex(slug, catOffset + offsets.realEstate, pools.realEstate),
      getVariantIndex(slug, catOffset + offsets.popTier, pools.popTier),
    ].join('-');
    
    if (fingerprints.has(fp)) {
      fingerprints.get(fp).push(commune.nom);
    } else {
      fingerprints.set(fp, [commune.nom]);
    }
    totalPages++;
  }

  // Report collisions
  let catCollisions = 0;
  for (const [fp, names] of fingerprints) {
    if (names.length > 1) {
      catCollisions++;
      console.log(`  ⚠️  COLLISION (fingerprint ${fp}): ${names.join(' ↔ ')}`);
    }
  }

  const uniqueFPs = fingerprints.size;
  console.log(`\n  📊 Stats:`);
  console.log(`    Total communes: ${communes.length}`);
  console.log(`    Unique fingerprints: ${uniqueFPs}`);
  console.log(`    Collisions: ${catCollisions}`);
  console.log(`    Uniqueness: ${((uniqueFPs / communes.length) * 100).toFixed(1)}%`);

  totalCollisions += catCollisions;
}

console.log(`\n${'='.repeat(60)}`);
console.log(`SUMMARY`);
console.log('='.repeat(60));
console.log(`  Total pages analyzed: ${totalPages}`);
console.log(`  Total collision groups: ${totalCollisions}`);
console.log(`  Result: ${totalCollisions === 0 ? '✅ PASS — No duplicate fingerprints!' : '❌ FAIL — Duplicate fingerprints detected'}`);
console.log('');

// Additional checks
console.log(`\n${'='.repeat(60)}`);
console.log(`ADDITIONAL CONTENT DIMENSION CHECKS`);
console.log('='.repeat(60));

// Check localContext diversity (6 templates)
const localContextVariants = new Map();
for (const commune of communes) {
  for (const category of categories) {
    const idx = getVariantIndex(commune.slug, CATEGORY_OFFSETS[category] + 95, 6);
    const key = `${category}-${idx}`;
    if (!localContextVariants.has(key)) localContextVariants.set(key, 0);
    localContextVariants.set(key, localContextVariants.get(key) + 1);
  }
}
console.log(`\n  localContext distribution (6 templates × 3 categories):`);
for (const [key, count] of [...localContextVariants.entries()].sort()) {
  console.log(`    ${key}: ${count} communes`);
}

// Check FAQ combinations
const faqCombos = new Map();
for (const commune of communes) {
  for (const category of categories) {
    const faqPool = category === 'copropriete' ? 12 : category === 'wallbox' ? 12 : 12;
    const indices = [];
    let faqSeed = CATEGORY_OFFSETS[category] + 99;
    while (indices.length < 4) {
      const idx = getVariantIndex(commune.slug, faqSeed, faqPool);
      if (!indices.includes(idx)) {
        indices.push(idx);
      }
      faqSeed++;
    }
    const key = `${category}: ${indices.join('-')}`;
    if (!faqCombos.has(key)) faqCombos.set(key, 0);
    faqCombos.set(key, faqCombos.get(key) + 1);
  }
}
console.log(`\n  FAQ combination uniqueness (4 selected from 12):`);
console.log(`    Unique combos: ${faqCombos.size} / ${communes.length * 3} total pages`);
const maxFaqShared = Math.max(...faqCombos.values());
console.log(`    Max shared: ${maxFaqShared} communes share the same FAQ combo`);

// Check anecdote patrimoine diversity
const anecdoteCounts = new Map();
for (const commune of communes) {
  let hash = 0;
  for (let i = 0; i < commune.slug.length; i++) {
    hash = (hash * 31 + commune.slug.charCodeAt(i)) | 0;
  }
  hash = hash ^ (commune.slug.length * 2654435761);
  const idx = Math.abs(hash) % 12; // 12 generic anecdotes
  if (!anecdoteCounts.has(idx)) anecdoteCounts.set(idx, 0);
  anecdoteCounts.set(idx, anecdoteCounts.get(idx) + 1);
}
// Subtract specific anecdotes (18 communes with named ones)
const specificSlugs = ['versailles', 'le-chesnay-rocquencourt', 'viroflay', 'saint-germain-en-laye', 'le-vesinet', 'marly-le-roi', 'le-pecq', 'poissy', 'acheres', 'conflans-sainte-honorine', 'rambouillet', 'les-essarts-le-roi', 'saint-arnoult-en-yvelines', 'montigny-le-bretonneux', 'guyancourt', 'elancourt', 'voisins-le-bretonneux', 'trappes'];
console.log(`\n  Anecdote patrimoine distribution (12 generic + 5 specific groups):`);
console.log(`    Specific anecdotes: ${specificSlugs.length} communes`);
console.log(`    Generic distribution across 12 anecdotes:`);
for (const [idx, count] of [...anecdoteCounts.entries()].sort((a, b) => a[0] - b[0])) {
  console.log(`      Anecdote ${idx}: ${count} communes`);
}

process.exit(totalCollisions === 0 ? 0 : 1);
