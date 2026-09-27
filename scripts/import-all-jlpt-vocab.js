import fs from 'fs';
import path from 'path';

const dir = '/home/puja/.gemini/antigravity/brain/545c8fb1-6c2e-4c9e-819c-500f7119fc1c/.user_uploaded/';
const mappings = [
  { file: 'media_1790240911138.csv', level: 'N5', output: 'data/n5_vocab.json' },
  { file: 'media_1790241247807.csv', level: 'N4', output: 'data/n4_vocab.json' },
  { file: 'media_1790241247894.csv', level: 'N3', output: 'data/n3_vocab.json' },
  { file: 'media_1790241247740.csv', level: 'N2', output: 'data/n2_vocab.json' },
  { file: 'media_1790241247761.csv', level: 'N1', output: 'data/n1_vocab.json' },
];

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Load existing N5 examples map to enrich if possible
const existingExamples = new Map();
if (fs.existsSync('data/n5_vocab.json')) {
  try {
    const old = JSON.parse(fs.readFileSync('data/n5_vocab.json', 'utf8'));
    old.forEach(item => {
      const key = (item.kanji || item.reading || '').trim();
      if (key && (item.example || item.exampleMeaning)) {
        existingExamples.set(key, {
          example: item.example || '',
          exampleReading: item.exampleReading || '',
          exampleMeaning: item.exampleMeaning || '',
          category: item.category || '',
        });
      }
    });
    console.log('Indexed ' + existingExamples.size + ' existing vocabulary examples');
  } catch (e) {
    console.warn('Could not index existing examples:', e.message);
  }
}

const summary = {};
const allCardsByLevel = {};

mappings.forEach(({ file, level, output }) => {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    return;
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split(/\r?\n/).filter(l => l.trim().length > 0);
  const dataLines = lines.slice(1); // skip header

  const cards = dataLines.map((line, idx) => {
    const cols = parseCSVLine(line);
    const expression = (cols[0] || '').trim();
    const reading = (cols[1] || '').trim();
    let meaning = (cols[2] || '').trim().replace(/^"|"$/g, '').trim();
    const rawTags = (cols[3] || '').trim();
    const tags = rawTags ? rawTags.split(/\s+/).filter(Boolean) : [level, 'vocab'];

    const enriched = existingExamples.get(expression) || existingExamples.get(reading);

    const safeBase = expression || reading || 'word';
    const cardId = 'vocab-' + level.toLowerCase() + '-' + idx + '-' + encodeURIComponent(safeBase).slice(0, 30);

    return {
      id: cardId,
      _id: cardId,
      kanji: expression,
      reading: reading || expression,
      meaning: meaning || 'Vocabulary word',
      content_type: 'vocab',
      type: 'vocab',
      jlpt_level: level,
      jlpt: level,
      category: enriched?.category || ('JLPT ' + level + ' Vocabulary'),
      tags: Array.from(new Set([level, 'vocab', ...tags])),
      example: enriched?.example || '',
      exampleReading: enriched?.exampleReading || '',
      exampleMeaning: enriched?.exampleMeaning || '',
      interval: 0,
      repetitions: 0,
      ease_factor: 2.5,
      easeFactor: 2.5,
      dueDate: Date.now(),
      next_review_date: Date.now(),
      mastered: false,
    };
  });

  fs.writeFileSync(output, JSON.stringify(cards, null, 2));
  summary[level] = cards.length;
  allCardsByLevel[level] = cards;
});

console.log('Successfully parsed and generated JSON files in data/:');
console.log(summary);

export { mappings, allCardsByLevel, parseCSVLine };

