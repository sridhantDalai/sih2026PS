const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'imp', 'data.json'), 'utf-8'));

let oBullets = 0;
let numberedLists = 0;
let letterLists = 0;

for (const ps of data.problem_statements) {
  const desc = ps.description || '';
  if (/\s+o\s+[A-Z]/.test(desc)) oBullets++;
  if (/\b\d+\.\s+[A-Z]/.test(desc)) numberedLists++;
  if (/\b[A-F]\.\s+[A-Z]/.test(desc)) letterLists++;
}

console.log('Total PS:', data.problem_statements.length);
console.log('With "o <Capital>" bullets:', oBullets);
console.log('With numbered lists (1. 2.):', numberedLists);
console.log('With lettered lists (A. B.):', letterLists);
