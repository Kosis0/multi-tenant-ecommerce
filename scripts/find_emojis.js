const fs = require('fs');
const path = require('path');

const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{FE00}-\u{FE0F}]/u;

const results = [];

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.git', '.next', '.system_generated'].includes(entry.name)) continue;
      scanDir(fullPath);
    } else if (entry.isFile() && /\.(js|jsx|mjs|css|sql|html|json)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (emojiRegex.test(line)) {
          results.push({ file: fullPath, line: idx + 1, text: line.trim() });
        }
      });
    }
  }
}

scanDir('./client');
scanDir('./src');
scanDir('./scripts');

console.log(`Found ${results.length} lines with emojis:`);
results.forEach(r => console.log(`${r.file}:${r.line}: ${r.text}`));
