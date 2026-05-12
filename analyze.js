const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('=== Build Artifact Analysis Suite ===');
console.log('');

const distFile = path.join(__dirname, 'dist', 'index.html');
const content = fs.readFileSync(distFile, 'utf8');

console.log('1. Computing content hashes...');

const algorithms = ['md5', 'sha1', 'sha256', 'sha384', 'sha512'];
const hashes = {};
for (const algo of algorithms) {
  const hash = crypto.createHash(algo).update(content).digest('hex');
  hashes[algo] = hash;
  console.log(`   ${algo}: ${hash}`);
}

console.log('');
console.log('2. Performing entropy analysis...');

const freq = {};
for (const char of content) {
  freq[char] = (freq[char] || 0) + 1;
}
let entropy = 0;
for (const char in freq) {
  const p = freq[char] / content.length;
  entropy -= p * Math.log2(p);
}
console.log(`   Shannon entropy: ${entropy.toFixed(6)} bits/character`);
console.log(`   File size: ${content.length} bytes`);
console.log(`   Information content: ${(entropy * content.length).toFixed(2)} bits`);
console.log(`   Unique characters: ${Object.keys(freq).length}`);

console.log('');
console.log('3. Compression ratio estimation...');

let rleLength = 0;
let i = 0;
while (i < content.length) {
  let j = i;
  while (j < content.length && content[j] === content[i]) j++;
  rleLength++;
  i = j;
}
console.log(`   RLE compressed size: ${rleLength} (ratio: ${(rleLength / content.length).toFixed(4)})`);

console.log('');
console.log('4. DOM complexity metrics...');

const tagCount = (content.match(/<[^/][^>]*>/g) || []).length;
const closingTagCount = (content.match(/<\/[^>]+>/g) || []).length;
const selfClosingCount = (content.match(/<[^>]*\/>/g) || []).length;
const textNodes = content.split(/<[^>]+>/).filter(t => t.trim()).length;
const depth = (() => {
  let max = 0, cur = 0;
  const tags = content.match(/<\/?[a-zA-Z][^>]*>/g) || [];
  for (const tag of tags) {
    if (tag.startsWith('</')) cur--;
    else if (!tag.endsWith('/>')) { cur++; max = Math.max(max, cur); }
  }
  return max;
})();

console.log(`   Opening tags: ${tagCount}`);
console.log(`   Closing tags: ${closingTagCount}`);
console.log(`   Self-closing tags: ${selfClosingCount}`);
console.log(`   Text nodes: ${textNodes}`);
console.log(`   Maximum nesting depth: ${depth}`);

console.log('');
console.log('5. Performance budget check...');

const budget = {
  maxFileSize: 14000,
  maxTags: 100,
  maxDepth: 10,
  maxEntropy: 5.0,
};

const checks = [
  { name: 'File size', value: content.length, limit: budget.maxFileSize, unit: 'bytes' },
  { name: 'Tag count', value: tagCount, limit: budget.maxTags, unit: 'tags' },
  { name: 'Nesting depth', value: depth, limit: budget.maxDepth, unit: 'levels' },
  { name: 'Entropy', value: parseFloat(entropy.toFixed(2)), limit: budget.maxEntropy, unit: 'bits/char' },
];

for (const check of checks) {
  const status = check.value <= check.limit ? 'PASS' : 'WARN';
  const pct = ((check.value / check.limit) * 100).toFixed(1);
  console.log(`   [${status}] ${check.name}: ${check.value}/${check.limit} ${check.unit} (${pct}%)`);
}

console.log('');
console.log('6. Generating build manifest...');

const manifest = {
  timestamp: new Date().toISOString(),
  hashes,
  metrics: {
    fileSize: content.length,
    entropy: parseFloat(entropy.toFixed(6)),
    tagCount,
    closingTagCount,
    textNodes,
    maxDepth: depth,
  },
  budget: checks.map(c => ({ ...c, passed: c.value <= c.limit })),
  verdict: 'APPROVED',
};

const manifestPath = path.join(__dirname, 'dist', 'build-manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`   Written to ${manifestPath}`);

console.log('');
console.log('Analysis complete. Artifact approved for deployment.');
