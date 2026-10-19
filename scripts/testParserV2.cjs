const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'imp', 'data.json'), 'utf-8'));

const PREAMBLES = [
  'Description (Background, Detailed Description and Expected Solution)'
];

const MAJOR_HEADINGS = [
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
  'Background & Description',
  'Key Features Expected',
  'Key Functional Requirements',
  'Key Requirements',
  'Key Deliverables',
  'Key Features',
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
  'Deployment Constraints',
  'Deployment Constraint',
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

/**
 * Splits text into sentences cleanly at existing whitespace boundaries after . ! ?
 */
function splitSentences(text) {
  if (!text || !text.trim()) return [];
  const sentences = [];
  const re = /(?:[\.\?!])(\s+)(?=[A-Z0-9"'])/g;
  let m;
  let lastIndex = 0;
  while ((m = re.exec(text)) !== null) {
    const periodIndex = m.index + 1;
    const spaceIndex = periodIndex + m[1].length;
    const snippet = text.slice(Math.max(0, m.index - 5), m.index + 1);
    if (/\b(?:e\.g|i\.e|vs|etc|approx|dr|mr|mrs|prof)\.$/i.test(snippet)) {
      continue;
    }
    sentences.push(text.slice(lastIndex, periodIndex).trim());
    lastIndex = spaceIndex;
  }
  const lastPart = text.slice(lastIndex).trim();
  if (lastPart) {
    sentences.push(lastPart);
  }
  return sentences;
}

/**
 * Finds slice break points for paragraph splitting within a text block.
 */
function findParagraphBreakIndices(text) {
  const breaks = [];
  if (!text || text.length < 320) return breaks;

  const re = /(?:[\.\?!])(\s+)(?=[A-Z0-9"'])/g;
  let m;
  let lastBreak = 0;

  while ((m = re.exec(text)) !== null) {
    const spaceIndex = m.index + 1;
    const afterSpaceIndex = spaceIndex + m[1].length;

    const snippetBefore = text.slice(Math.max(0, m.index - 5), m.index + 1);
    if (/\b(?:e\.g|i\.e|vs|etc|approx|dr|mr|mrs|prof)\.$/i.test(snippetBefore)) {
      continue;
    }

    if (spaceIndex - lastBreak >= 220) {
      breaks.push({
        cutStart: spaceIndex,
        cutEnd: afterSpaceIndex
      });
      lastBreak = afterSpaceIndex;
    }
  }

  return breaks;
}

/**
 * Parses a paragraph-like string to see if it contains an inline colon lead-in followed by sentences.
 * E.g. "... informed decision-making. The proposed solution should focus on: Rapid and reliable... Easy-to-use..."
 */
function parseTextWithColonBullets(text) {
  // Regex to look for a sentence/clause ending with a colon:
  // e.g. "The proposed solution should focus on:" or "Key features include:"
  const colonRegex = /(?:^|[\.\?!]\s+)([^.\?!]{4,80}:)\s+(?=[A-Z0-9])/g;
  let m;
  let matches = [];
  while ((m = colonRegex.exec(text)) !== null) {
    const fullMatch = m[0];
    const leadPhrase = m[1];
    const phraseIndex = m.index + fullMatch.indexOf(leadPhrase);
    matches.push({
      lead: leadPhrase,
      index: phraseIndex,
      length: leadPhrase.length
    });
  }

  if (matches.length === 0) {
    // Normal paragraph splitting
    const breaks = findParagraphBreakIndices(text);
    if (breaks.length === 0) {
      return [{ type: 'paragraph', text: text.trim() }];
    }
    const blocks = [];
    let start = 0;
    for (const b of breaks) {
      const part = text.slice(start, b.cutStart).trim();
      if (part) blocks.push({ type: 'paragraph', text: part });
      start = b.cutEnd;
    }
    const lastPart = text.slice(start).trim();
    if (lastPart) blocks.push({ type: 'paragraph', text: lastPart });
    return blocks;
  }

  const resultBlocks = [];
  let currentPos = 0;

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    // Any narrative text before this colon lead-in
    if (match.index > currentPos) {
      const priorText = text.slice(currentPos, match.index).trim();
      if (priorText) {
        const priorBreaks = findParagraphBreakIndices(priorText);
        if (priorBreaks.length === 0) {
          resultBlocks.push({ type: 'paragraph', text: priorText });
        } else {
          let s = 0;
          for (const b of priorBreaks) {
            const p = priorText.slice(s, b.cutStart).trim();
            if (p) resultBlocks.push({ type: 'paragraph', text: p });
            s = b.cutEnd;
          }
          const lp = priorText.slice(s).trim();
          if (lp) resultBlocks.push({ type: 'paragraph', text: lp });
        }
      }
    }

    // The lead-in itself (e.g. "The proposed solution should focus on:")
    resultBlocks.push({
      type: 'sub-heading-lead',
      text: match.lead
    });

    // The text following the colon until next match or end
    const afterPos = match.index + match.length;
    const nextPos = (i + 1 < matches.length) ? matches[i + 1].index : text.length;
    const bulletsText = text.slice(afterPos, nextPos).trim();

    // Split bulletsText into standalone sentences
    const sentences = splitSentences(bulletsText);
    if (sentences.length >= 2) {
      // Multiple standalone requirement sentences! Render as clean bullet items
      for (const sent of sentences) {
        resultBlocks.push({
          type: 'bullet-sentence',
          text: sent
        });
      }
    } else {
      // Just one sentence or continuation
      resultBlocks.push({
        type: 'paragraph',
        text: bulletsText
      });
    }

    currentPos = nextPos;
  }

  return resultBlocks;
}

/**
 * Parses section body into structured blocks (paragraphs, list items, bullets).
 */
function parseBodyBlocks(bodyText) {
  if (!bodyText || !bodyText.trim()) return [];

  const markerRegex = /(?:^|\s+)((?:\d+\.)|(?:[A-F]\.)|(?:o)|(?:[•\-]))\s+(?=[A-Z0-9"'])/g;
  const listMatches = [];
  let m;
  while ((m = markerRegex.exec(bodyText)) !== null) {
    const fullMatch = m[0];
    const marker = m[1];
    const markerIndex = m.index + fullMatch.indexOf(marker);
    listMatches.push({
      marker,
      index: markerIndex,
      type: /^\d+\./.test(marker) ? 'numbered' : /^[A-F]\./.test(marker) ? 'lettered' : marker === 'o' ? 'bullet-o' : 'bullet'
    });
  }

  const hasList = listMatches.length >= 2 || (listMatches.length === 1 && listMatches[0].marker === '1.');

  if (!hasList) {
    return parseTextWithColonBullets(bodyText);
  }

  const blocks = [];

  // Content before first list item
  if (listMatches[0].index > 0) {
    const leadText = bodyText.slice(0, listMatches[0].index).trim();
    if (leadText) {
      const parsedLead = parseTextWithColonBullets(leadText);
      blocks.push(...parsedLead);
    }
  }

  // List items
  for (let i = 0; i < listMatches.length; i++) {
    const curr = listMatches[i];
    const next = listMatches[i + 1];
    const itemTextRaw = bodyText.slice(curr.index, next ? next.index : bodyText.length).trim();

    const concludeMatch = itemTextRaw.match(/^(.*?\.\s+)(The\s+(?:prototype|system|ultimate|proposed|solution|project|evaluation|testing).*)$/is);
    if (!next && concludeMatch) {
      blocks.push({
        type: 'list-item',
        listType: curr.type,
        marker: curr.marker,
        text: concludeMatch[1].trim()
      });
      const trailing = concludeMatch[2].trim();
      const parsedTrailing = parseTextWithColonBullets(trailing);
      blocks.push(...parsedTrailing);
    } else {
      blocks.push({
        type: 'list-item',
        listType: curr.type,
        marker: curr.marker,
        text: itemTextRaw
      });
    }
  }

  return blocks;
}

function parseDescription(rawText) {
  if (!rawText) return { preamble: null, sections: [] };

  let text = rawText.trim();
  let preamble = null;

  for (const p of PREAMBLES) {
    if (text.startsWith(p)) {
      preamble = p;
      text = text.slice(p.length).trim();
      break;
    }
  }

  const matches = [];

  // Prefix topic at start e.g. "Gobardhan:" or "Solid Waste Management (SWM):"
  const startTopicMatch = text.match(/^([A-Za-z0-9\s\/\(\)\-]{3,40}):\s+/);
  if (startTopicMatch && !MAJOR_HEADINGS.some(h => startTopicMatch[1].toLowerCase() === h.toLowerCase())) {
    matches.push({
      heading: startTopicMatch[1] + ':',
      index: 0,
      length: startTopicMatch[0].length
    });
  }

  for (const h of MAJOR_HEADINGS) {
    const escaped = h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(
      `(?:^|(?:[\\.\\?!]\\s+)|(?:\\n\\s*))(${escaped})(?::(?=\\s)|(?=\\s+[A-Z0-9]))`,
      'g'
    );

    let m;
    while ((m = regex.exec(text)) !== null) {
      const fullMatch = m[0];
      const headingWord = m[1];
      const headingIndex = m.index + fullMatch.indexOf(headingWord);

      let actualHeading = headingWord;
      let matchLen = headingWord.length;
      if (text[headingIndex + headingWord.length] === ':') {
        actualHeading += ':';
        matchLen += 1;
      }

      const overlaps = matches.some(existing =>
        (headingIndex >= existing.index && headingIndex < existing.index + existing.length) ||
        (existing.index >= headingIndex && existing.index < headingIndex + matchLen)
      );

      if (!overlaps) {
        matches.push({
          heading: actualHeading,
          index: headingIndex,
          length: matchLen
        });
      }
    }
  }

  matches.sort((a, b) => a.index - b.index);

  const sections = [];

  if (matches.length === 0) {
    sections.push({
      heading: null,
      blocks: parseBodyBlocks(text)
    });
  } else {
    if (matches[0].index > 0) {
      const leadContent = text.slice(0, matches[0].index).trim();
      if (leadContent) {
        sections.push({ heading: null, blocks: parseBodyBlocks(leadContent) });
      }
    }

    for (let i = 0; i < matches.length; i++) {
      const curr = matches[i];
      const startIndex = curr.index + curr.length;
      const endIndex = (i + 1 < matches.length) ? matches[i + 1].index : text.length;
      const body = text.slice(startIndex, endIndex).trim();
      sections.push({
        heading: curr.heading,
        blocks: parseBodyBlocks(body)
      });
    }
  }

  return { preamble, sections };
}

// Function to collect all words
function getWords(str) {
  if (!str) return [];
  return str.trim().split(/\s+/).filter(Boolean);
}

// Check SIH26252
console.log('=== Checking SIH26252 parsing ===');
const ps252 = data.problem_statements.find(p => p.ps_number === 'SIH26252');
const parsed252 = parseDescription(ps252.description);
console.log('Sections in SIH26252:', parsed252.sections.length);
for (const s of parsed252.sections) {
  console.log(`\nSection Heading: [${s.heading}]`);
  for (const b of s.blocks) {
    console.log(`  Type: [${b.type}] => ${b.text.slice(0, 70)}...`);
  }
}

// Run Zero-Word test across all 265
console.log('\n=== Checking Zero-Word test on ALL 265 PS ===');
let mismatches = 0;
for (let i = 0; i < data.problem_statements.length; i++) {
  const ps = data.problem_statements[i];
  const origDesc = ps.description || '';
  const parsed = parseDescription(origDesc);

  let reconstructed = [];
  if (parsed.preamble) {
    reconstructed.push(parsed.preamble);
  }
  for (const s of parsed.sections) {
    if (s.heading) reconstructed.push(s.heading);
    for (const b of s.blocks) {
      reconstructed.push(b.text);
    }
  }

  const origWords = getWords(origDesc);
  const reconWords = getWords(reconstructed.join(' '));

  if (origWords.length !== reconWords.length) {
    console.error(`MISMATCH on ${ps.ps_number}: orig ${origWords.length} words, recon ${reconWords.length} words`);
    mismatches++;
  } else {
    for (let w = 0; w < origWords.length; w++) {
      if (origWords[w] !== reconWords[w]) {
        console.error(`WORD DIFF on ${ps.ps_number} at index ${w}: "${origWords[w]}" vs "${reconWords[w]}"`);
        mismatches++;
        break;
      }
    }
  }
}

if (mismatches === 0) {
  console.log('✓ 100% SUCCESS: ALL 265 PROBLEM STATEMENTS VERIFIED WITH ZERO WORD MODIFICATION!');
} else {
  console.log(`Failed with ${mismatches} mismatches`);
}
