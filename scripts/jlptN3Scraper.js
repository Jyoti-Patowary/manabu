const fs = require('node:fs');
const path = require('node:path');
const cheerio = require('cheerio');

const DEFAULT_URL = 'https://jlptsensei.com/jlpt-n3-vocabulary-list/';
const TARGET_URL = process.argv[2] || DEFAULT_URL;

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; JLPTScraper/1.0; +https://example.com)',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} while fetching ${url}`);
  }

  return res.text();
}

function cleanText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .replace(/\u00A0/g, ' ')
    .trim();
}

function findJapaneseReading(value) {
  const normalized = cleanText(value);
  const match = normalized.match(/([ぁ-ゖァ-ヶー]+)$/);
  return match ? match[1] : normalized;
}

function isLikelyHeader(text) {
  const normalized = cleanText(text).toLowerCase();
  return ['#', 'word', 'vocabulary', 'kanji', 'reading', 'meaning', 'english', 'type'].includes(normalized);
}

function extractEntries(html) {
  const $ = cheerio.load(html);
  const results = [];

  $('table tr').each((_, row) => {
    const cells = $(row).find('td, th').toArray().map((cell) => cleanText($(cell).text()));
    if (cells.length < 4) return;

    const [index, kanji, combinedReading, type, meaning] = cells;
    if (!kanji || !meaning) return;
    if (isLikelyHeader(index) || isLikelyHeader(kanji) || isLikelyHeader(type)) return;
    if (/^\d+$/.test(cleanText(index))) {
      const reading = findJapaneseReading(combinedReading);
      const item = {
        kanji,
        reading,
        meaning,
        type: type || '',
      };

      if (item.kanji && item.meaning) {
        results.push(item);
      }
    }
  });

  if (results.length === 0) {
    $('tr').each((_, row) => {
      const cells = $(row).find('td, th').toArray().map((cell) => cleanText($(cell).text()));
      const maybeWord = cells.find((cell) => cell && !/^\d+$/.test(cell) && !isLikelyHeader(cell));
      if (!maybeWord || cells.length < 2) return;

      const meaning = cells[cells.length - 1];
      if (meaning && maybeWord) {
        results.push({
          kanji: maybeWord,
          reading: '',
          meaning,
        });
      }
    });
  }

  if (results.length === 0) {
    $('li, .vocab-item, .word-item, .jlpt-item').each((_, item) => {
      const text = cleanText($(item).text());
      if (!text) return;
      const match = text.match(/^(.+?)\s*[-–—]\s*(.+)$/);
      if (match) {
        const term = cleanText(match[1]);
        const meaning = cleanText(match[2]);
        if (term && meaning && !isLikelyHeader(term)) {
          results.push({ kanji: term, reading: '', meaning });
        }
      }
    });
  }

  return results;
}

async function main() {
  console.log(`Fetching: ${TARGET_URL}`);
  const html = await fetchHtml(TARGET_URL);
  const entries = extractEntries(html);

  if (!entries.length) {
    console.error('No vocabulary entries were found. Check the target URL or page selectors.');
    process.exit(1);
  }

  const outputPath = path.join(process.cwd(), 'jlpt-n3-vocab.json');
  fs.writeFileSync(outputPath, JSON.stringify(entries, null, 2));

  console.log(`Saved ${entries.length} vocabulary items to ${outputPath}`);
  console.log(JSON.stringify(entries.slice(0, 10), null, 2));
}

main().catch((error) => {
  console.error('Scraper failed:', error.message);
  process.exit(1);
});
