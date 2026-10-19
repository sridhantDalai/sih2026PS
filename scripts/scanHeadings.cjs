const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'imp', 'data.json'), 'utf-8'));

// Let's inspect how headings appear
// We look for patterns where a known heading or title-cased phrase appears:
// 1) At the start of the string
// 2) After a period/question/exclamation mark followed by space
// 3) Or followed by a colon

const knownHeadingsList = [
  'Description (Background, Detailed Description and Expected Solution)',
  'Detailed Description and Expected Solution',
  'Problem Description and Expected Solution',
  'Proposed Solution and Key Functional Requirements',
  'Expected Solution / Deliverables',
  'Expected Solution/ Deliverables',
  'Expected Solution/Deliverables',
  'Expected Solutions / Outcomes',
  'Expected Solution/ Outcomes',
  'Expected Solution Module A',
  'Prototype Demonstration and Evaluation',
  'Prototype and Evaluation Criteria',
  'Background of the Problem Statement',
  'Description of the Problem Statement',
  'Description of the Study',
  'Deliverables Participants should provide',
  'Functional Requirements Data Ingestion',
  'Key Features Expected',
  'Key Functional Requirements',
  'Key Requirements',
  'Key Deliverables',
  'Expected Deliverables',
  'Desired Outcomes',
  'Expected Outcomes',
  'Expected Outcome',
  'Expected Results',
  'Expected Result',
  'Expected Solutions',
  'Expected Solution',
  'Expected solution',
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
  'Dataset Requirements',
  'Dataset Details',
  'End-to-End Workflow',
  'Deployment Constraint',
  'Deployment Constraints',
  'For Grand Finale',
  'Objectives',
  'Objective',
  'Background',
  'Description',
  'Benefits',
  'Challenges',
  'Current Challenges',
  'Existing Challenges',
  'Scope of Work',
  'Scope',
  'Methodology',
  'Technology Stack',
  'Tech Stack'
];

// Let's test finding these in each PS
let stats = {
  totalPS: data.problem_statements.length,
  withHeadings: 0,
  headingCounts: {}
};

for (const ps of data.problem_statements) {
  const desc = ps.description || '';
  let found = [];
  
  // Also check topic prefixes at start like "Gobardhan:", "Solid Waste Management (SWM):", etc.
  const startTopic = desc.match(/^([A-Za-z\s\/\(\)\-]{3,40}):\s+/);
  if (startTopic) {
    found.push({ heading: startTopic[1], pos: 0 });
  }

  for (const h of knownHeadingsList) {
    // Escape for regex
    const escaped = h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Can match at start of string or after a sentence/colon/space
    // Followed by colon or space + capital letter or number
    const re = new RegExp(`(?:^|[\\.\\?\\!]\\s+|\\s{2,})(${escaped})(?::|(?=\\s+[A-Z0-9]))`, 'g');
    let m;
    while ((m = re.exec(desc)) !== null) {
      // Find actual index of the heading
      const fullMatch = m[0];
      const heading = m[1];
      const matchIndex = m.index + fullMatch.indexOf(heading);
      // Avoid duplicates or overlaps
      if (!found.some(f => Math.abs(f.pos - matchIndex) < 5)) {
        found.push({ heading, pos: matchIndex });
      }
    }
  }

  if (found.length > 0) {
    stats.withHeadings++;
    for (const f of found) {
      stats.headingCounts[f.heading] = (stats.headingCounts[f.heading] || 0) + 1;
    }
  }
}

console.log(`PS with detected headings: ${stats.withHeadings} / ${stats.totalPS}`);
console.log('Top detected headings:', Object.entries(stats.headingCounts).sort((a,b) => b[1] - a[1]).slice(0, 30));
