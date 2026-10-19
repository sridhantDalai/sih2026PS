/**
 * Data Processing Script for SIH 2026 Problem Statements
 * Reads imp/data.json, normalizes fields, and outputs src/data/problemStatements.json
 */
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '..', 'imp', 'data.json');
const outputPath = path.join(__dirname, '..', 'src', 'data', 'problemStatements.json');

const raw = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

console.log(`Source file: ${inputPath}`);
console.log(`Source record count: ${raw.problem_statements.length}`);
console.log(`Source declared count: ${raw.count}`);

function normalizeWhitespace(str) {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/\s+/g, ' ').trim();
}

function normalizeCategory(cat) {
  if (!cat || typeof cat !== 'string') return 'Unknown';
  const lower = cat.trim().toLowerCase();
  if (lower === 'software') return 'Software';
  if (lower === 'hardware') return 'Hardware';
  return cat.trim();
}

const seenIds = new Set();
const processed = [];

for (const ps of raw.problem_statements) {
  const id = normalizeWhitespace(ps.ps_number || ps.problem_statement_id || '');

  // Skip truly empty entries
  if (!id && !normalizeWhitespace(ps.problem_statement_title)) {
    console.warn('Skipping entry with no ID and no title');
    continue;
  }

  // Track duplicate IDs
  if (id && seenIds.has(id)) {
    console.warn(`Duplicate PS ID found: ${id} — keeping both entries`);
  }
  if (id) seenIds.add(id);

  processed.push({
    serialNo: parseInt(ps.serial_no, 10) || processed.length + 1,
    psNumber: normalizeWhitespace(ps.ps_number),
    psId: normalizeWhitespace(ps.problem_statement_id),
    title: normalizeWhitespace(ps.problem_statement_title),
    category: normalizeCategory(ps.category),
    theme: normalizeWhitespace(ps.theme) || 'Miscellaneous',
    organization: normalizeWhitespace(ps.organization),
    department: normalizeWhitespace(ps.department),
    description: normalizeWhitespace(ps.description),
    submittedIdeasCount: normalizeWhitespace(ps.submitted_ideas_count),
    deadline: normalizeWhitespace(ps.deadline_for_idea_submission),
    youtubeLink: normalizeWhitespace(ps.youtube_link),
    datasetLink: normalizeWhitespace(ps.dataset_link),
    contactInfo: normalizeWhitespace(ps.contact_info),
  });
}

const output = {
  meta: {
    title: raw.title || 'Smart India Hackathon',
    year: raw.year || 2026,
    totalCount: processed.length,
    softwareCount: processed.filter(p => p.category === 'Software').length,
    hardwareCount: processed.filter(p => p.category === 'Hardware').length,
    themes: [...new Set(processed.map(p => p.theme))].sort(),
    organizations: [...new Set(processed.map(p => p.organization))].filter(Boolean).sort(),
    processedAt: new Date().toISOString(),
  },
  problemStatements: processed,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');

console.log(`\nProcessed record count: ${processed.length}`);
console.log(`Software: ${output.meta.softwareCount}`);
console.log(`Hardware: ${output.meta.hardwareCount}`);
console.log(`Themes: ${output.meta.themes.length}`);
console.log(`Organizations: ${output.meta.organizations.length}`);
console.log(`Output written to: ${outputPath}`);

// Verification
if (processed.length !== raw.problem_statements.length) {
  console.error(`\n⚠ MISMATCH: Source had ${raw.problem_statements.length} but processed has ${processed.length}`);
} else {
  console.log(`\n✓ Record counts match: ${processed.length}`);
}
