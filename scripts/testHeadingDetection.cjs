const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'imp', 'data.json'), 'utf-8'));

// Common SIH major headings:
const majorHeadings = [
  'Description (Background, Detailed Description and Expected Solution)',
  'Detailed Description and Expected Solution',
  'Problem Description and Expected Solution',
  'Proposed Solution and Key Functional Requirements',
  'Expected Solution / Deliverables',
  'Expected Solution/ Deliverables',
  'Expected Solutions / Outcomes',
  'Expected Solution/ Outcomes',
  'Prototype Demonstration and Evaluation',
  'Prototype and Evaluation Criteria',
  'Background of the Problem Statement',
  'Description of the Problem Statement',
  'Description of the Study',
  'Key Features Expected',
  'Key Functional Requirements',
  'Key Requirements',
  'Key Deliverables',
  'Desired Outcomes',
  'Expected Outcomes',
  'Expected Outcome',
  'Expected Deliverables',
  'Expected Results',
  'Expected Result',
  'Expected Solutions',
  'Expected Solution',
  'Detailed Description',
  'Problem Description',
  'Problem Statement',
  'Defining the Problem',
  'Existing Problem',
  'Essential Safeguards',
  'Regulatory Safeguard',
  'Evaluation Criteria',
  'Evaluation Metrics',
  'Innovation Expected',
  'Target Users',
  'Potential Impact',
  'Core functional requirements',
  'Functional Requirements Data Ingestion',
  'Dataset Requirements',
  'Dataset Details',
  'Deliverables Participants should provide',
  'For Grand Finale',
  'Objectives',
  'Objective',
  'Background',
  'Description'
];

let foundHeadings = [];

for (let i = 0; i < data.problem_statements.length; i++) {
  const ps = data.problem_statements[i];
  const desc = ps.description || '';
  if (!desc) continue;
  
  // Find which major headings occur in this description
  let matches = [];
  for (const h of majorHeadings) {
    // Look for heading followed by colon, space, or end
    // Heading might be with colon: 'Background:' or without: 'Background The All India...'
    // Regex must ensure it's not part of another word
    const re = new RegExp(`(?:^|[\\.\\?\\!\\n]\\s+|\\s{2,})(${h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(?::|\\s+(?=[A-Z0-9]))`, 'gi');
    let m;
    while ((m = re.exec(desc)) !== null) {
      matches.push({ heading: m[1], index: m.index });
    }
  }
  if (matches.length > 0) {
    foundHeadings.push({ psNumber: ps.ps_number, count: matches.length });
  }
}

console.log(`PS with detected major headings: ${foundHeadings.length} / ${data.problem_statements.length}`);
