#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'data', 'kanji_jlpt.json');
const ALL_LIST = 'https://kanjiapi.dev/v1/kanji/all';
const DETAIL_BASE = 'https://kanjiapi.dev/v1/kanji';

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

// simple concurrency limiter
async function mapWithLimit(arr, limit, mapper) {
  const results = [];
  let i = 0;
  async function worker() {
    while (i < arr.length) {
      const idx = i++;
      try {
        results[idx] = await mapper(arr[idx], idx);
      } catch (err) {
        results[idx] = { error: err.message };
      }
    }
  }

  const workers = [];
  for (let w = 0; w < limit; w++) workers.push(worker());
  await Promise.all(workers);
  return results;
}

async function run() {
  console.log('Fetching full kanji list from', ALL_LIST);
  const allKanji = await fetchJson(ALL_LIST);
  console.log(`Total kanji in list: ${allKanji.length}`);

  // fetch details for all kanji with concurrency limit
  console.log('Fetching details for each kanji (this may take a while)...');
  const details = await mapWithLimit(allKanji, 40, async (kanji) => {
    const url = `${DETAIL_BASE}/${encodeURIComponent(kanji)}`;
    return await fetchJson(url);
  });

  // Group by JLPT level (1..5) and only include those with a jlpt field
  const out = { N5: [], N4: [], N3: [], N2: [], N1: [] };
  for (const d of details) {
    if (!d || typeof d !== 'object') continue;
    const jlpt = Number(d.jlpt || 0);
    if (jlpt >= 1 && jlpt <= 5) {
      out[`N${jlpt}`].push(d);
    }
  }

  // Sort each level by kanji character for stability
  for (const k of Object.keys(out)) {
    out[k].sort((a,b) => (a.kanji || '').localeCompare(b.kanji || ''));
  }

  fs.writeFileSync(OUT, JSON.stringify(out, null, 2), 'utf8');
  console.log('Saved grouped JLPT kanji to', OUT);
}

if (require.main === module) {
  run().catch(err => { console.error(err); process.exitCode = 2; });
}

module.exports = { run };
