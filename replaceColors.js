const fs = require('fs');
const path = require('path');
const dirs = ['frontend/src/pages', 'frontend/src/components'];
const replacements = [
  { regex: /'#111827'/g, replacement: "'var(--text-main)'" },
  { regex: /"#111827"/g, replacement: "'var(--text-main)'" },
  { regex: /'#fff'/g, replacement: "'var(--bg-card)'" },
  { regex: /"#fff"/g, replacement: "'var(--bg-card)'" },
  { regex: /'#ffffff'/g, replacement: "'var(--bg-card)'" },
  { regex: /'#F9FAFB'/g, replacement: "'var(--bg-ghost)'" },
  { regex: /"#F9FAFB"/g, replacement: "'var(--bg-ghost)'" },
  { regex: /'#F3F4F6'/g, replacement: "'var(--border-light)'" },
  { regex: /"#F3F4F6"/g, replacement: "'var(--border-light)'" },
  { regex: /'#9CA3AF'/g, replacement: "'var(--text-muted)'" },
  { regex: /"#9CA3AF"/g, replacement: "'var(--text-muted)'" },
  { regex: /'#374151'/g, replacement: "'var(--text-ghost)'" },
  { regex: /"#374151"/g, replacement: "'var(--text-ghost)'" }
];

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      for (const { regex, replacement } of replacements) {
        content = content.replace(regex, replacement);
      }
      if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated ' + fullPath);
      }
    }
  }
}
dirs.forEach(processDir);
