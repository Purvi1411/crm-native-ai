const fs = require('fs');
const path = require('path');

const map = {
  '#4F46E5': '#06B6D4',
  '#4338CA': '#0891B2',
  '#3730A3': '#155E75',
  '#6366F1': '#22D3EE',
  '#818CF8': '#67E8F9',
  '4F46E5': '06B6D4',
  '4338CA': '0891B2',
  '3730A3': '155E75',
  '6366F1': '22D3EE',
  '818CF8': '67E8F9'
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
