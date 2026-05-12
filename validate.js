const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, 'dist', 'index.html'), 'utf8');
if (!content.includes('Hello World')) {
  console.error('Validation failed: "Hello World" not found in dist/index.html');
  process.exit(1);
}
console.log('Validation passed.');
