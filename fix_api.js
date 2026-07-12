const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.jsx') || file.endsWith('.js')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('frontend/src');
let count = 0;
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let replaced = content.split('${import.meta.env.VITE_API_URL || "http://localhost:5000"}').join('https://electro-mart-qalg.vercel.app');
  if (content !== replaced) {
    fs.writeFileSync(f, replaced);
    console.log("Updated " + f);
    count++;
  }
});
console.log("Total updated: " + count);
