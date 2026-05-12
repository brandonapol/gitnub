const fs = require('fs');
const path = require('path');

const dist = path.join(__dirname, 'dist');
if (!fs.existsSync(dist)) {
  fs.mkdirSync(dist);
}
fs.copyFileSync(
  path.join(__dirname, 'index.html'),
  path.join(dist, 'index.html')
);
