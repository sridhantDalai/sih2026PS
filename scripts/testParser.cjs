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
 * Finds slice break points for paragraph splitting within a text block.
 * Only breaks at existing whitespace boundaries after a period/exclamation/question mark.
 */
function findParagraphBreakIndices(text) {
  const breaks = [];
  if (!text || text.length < 350) return breaks;

  // Find sentence endings followed by whitespace
  // E.g. ". " or "? " or "! "
  const re = /(?:[\.\?!])(\s+)(?=[A-Z0-9"'])/g;
  let m;
  let lastBreak = 0;

  while ((m = re.exec(text)) !== null) {
    const spaceIndex = m.index + 1; // point where whitespace begins
    const afterSpaceIndex = spaceIndex + m[1].length;
    
    // Check if this looks like an abbreviation
    const snippetBefore = text.slice(Math.max(0, m.index - 5), m.index + 1);
    if (/\b(?:e\.g|i\.e|vs|etc|approx|dr|mr|mrs|prof)\.$/i.test(snippetBefore)) {
      continue;
    }

    // Only create a paragraph if the current paragraph is at least ~220 characters
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
 * Parses section body into blocks using exact slice ranges.
 */
function parseBodyBlocks(bodyText) {
  if (!bodyText || !bodyText.trim()) return [];

  // Check for list items:
  // e.g. "1. ", "2. ", "A. ", "o ", "• ", "- "
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
    // Break into readable paragraphs using findParagraphBreakIndices
    const breaks = findParagraphBreakIndices(bodyText);
    if (breaks.length === 0) {
      return [{ type: 'paragraph', text: bodyText.trim() }];
    }

    const blocks = [];
    let start = 0;
    for (const b of breaks) {
      const part = bodyText.slice(start, b.cutStart).trim();
      if (part) {
        blocks.push({ type: 'paragraph', text: part });
      }
      start = b.cutEnd;
    }
    const lastPart = bodyText.slice(start).trim();
    if (lastPart) {
      blocks.push({ type: 'paragraph', text: lastPart });
    }
    return blocks;
  }

  // Has list items
  const blocks = [];

  // Lead content before first item
  if (listMatches[0].index > 0) {
    const leadText = bodyText.slice(0, listMatches[0].index).trim();
    if (leadText) {
      const leadBreaks = findParagraphBreakIndices(leadText);
      if (leadBreaks.length === 0) {
        blocks.push({ type: 'paragraph', text: leadText });
      } else {
        let start = 0;
        for (const b of leadBreaks) {
          const part = leadText.slice(start, b.cutStart).trim();
          if (part) blocks.push({ type: 'paragraph', text: part });
          start = b.cutEnd;
        }
        const lastPart = leadText.slice(start).trim();
        if (lastPart) blocks.push({ type: 'paragraph', text: lastPart });
      }
    }
  }

  // Each list item
  for (let i = 0; i < listMatches.length; i++) {
    const curr = listMatches[i];
    const next = listMatches[i + 1];
    const itemTextRaw = bodyText.slice(curr.index, next ? next.index : bodyText.length).trim();

    // Check if the item text ends and has trailing narrative paragraph
    // (e.g. "10. System Integration... The prototype should demonstrate...")
    const concludeMatch = itemTextRaw.match(/^(.*?\.\s+)(The\s+(?:prototype|system|ultimate|proposed|solution|project|evaluation|testing).*)$/is);
    if (!next && concludeMatch) {
      blocks.push({
        type: 'list-item',
        listType: curr.type,
        marker: curr.marker,
        text: concludeMatch[1].trim()
      });
      const trailing = concludeMatch[2].trim();
      const trailBreaks = findParagraphBreakIndices(trailing);
      if (trailBreaks.length === 0) {
        blocks.push({ type: 'paragraph', text: trailing });
      } else {
        let start = 0;
        for (const b of trailBreaks) {
          const part = trailing.slice(start, b.cutStart).trim();
          if (part) blocks.push({ type: 'paragraph', text: part });
          start = b.cutEnd;
        }
        const lastPart = trailing.slice(start).trim();
        if (lastPart) blocks.push({ type: 'paragraph', text: lastPart });
      }
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

function getWords(str) {
  if (!str) return [];
  return str.trim().split(/\s+/).filter(Boolean);
}

console.log('Testing Zero-Word Modification on all 265 problem statements...');
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
