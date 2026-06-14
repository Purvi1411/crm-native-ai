const fs = require('fs');
const path = require('path');

const map = {
  '#06B6D4': '#F97316',
  '#0891B2': '#EA580C',
  '#155E75': '#C2410C',
  '#22D3EE': '#FB923C',
  '#67E8F9': '#FDBA74',
  '06B6D4': 'F97316',
  '0891B2': 'EA580C',
  '155E75': 'C2410C',
  '22D3EE': 'FB923C',
  '67E8F9': 'FDBA74'
};

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.jsx') || file.endsWith('.css') || file.endsWith('.js')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('c:\\\\Users\\\\palpu\\\\OneDrive\\\\Desktop\\\\Tech-Mahindra\\\\frontend\\\\src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  Object.keys(map).forEach(key => {
    const regex = new RegExp(key, 'gi');
    newContent = newContent.replace(regex, map[key]);
  });
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log('Updated ' + file);
  }
});
