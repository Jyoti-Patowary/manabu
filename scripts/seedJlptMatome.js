require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');

const BASE_URL = 'https://jlptmatome-backend.vercel.app';
const LEVELS = [
  { label: 'N5', value: 5 },
  { label: 'N4', value: 4 },
  { label: 'N3', value: 3 },
  { label: 'N2', value: 2 },
  { label: 'N1', value: 1 },
];

const HIRAGANA = {
  a: 'あ', i: 'い', u: 'う', e: 'え', o: 'お',
  ka: 'か', ki: 'き', ku: 'く', ke: 'け', ko: 'こ',
  sa: 'さ', shi: 'し', su: 'す', se: 'せ', so: 'そ',
  ta: 'た', chi: 'ち', tsu: 'つ', te: 'て', to: 'と',
  na: 'な', ni: 'に', nu: 'ぬ', ne: 'ね', no: 'の',
  ha: 'は', hi: 'ひ', fu: 'ふ', he: 'へ', ho: 'ほ',
  ma: 'ま', mi: 'み', mu: 'む', me: 'め', mo: 'も',
  ya: 'や', yu: 'ゆ', yo: 'よ',
  ra: 'ら', ri: 'り', ru: 'る', re: 'れ', ro: 'ろ',
  wa: 'わ', wo: 'を', n: 'ん',
};

const KATAKANA = {
  a: 'ア', i: 'イ', u: 'ウ', e: 'エ', o: 'オ',
  ka: 'カ', ki: 'キ', ku: 'ク', ke: 'ケ', ko: 'コ',
  sa: 'サ', shi: 'シ', su: 'ス', se: 'セ', so: 'ソ',
  ta: 'タ', chi: 'チ', tsu: 'ツ', te: 'テ', to: 'ト',
  na: 'ナ', ni: 'ニ', nu: 'ヌ', ne: 'ネ', no: 'ノ',
  ha: 'ハ', hi: 'ヒ', fu: 'フ', he: 'ヘ', ho: 'ホ',
  ma: 'マ', mi: 'ミ', mu: 'ム', me: 'メ', mo: 'モ',
  ya: 'ヤ', yu: 'ユ', yo: 'ヨ',
  ra: 'ラ', ri: 'リ', ru: 'ル', re: 'レ', ro: 'ロ',
  wa: 'ワ', wo: 'ヲ', n: 'ン',
};

function cleanText(value) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseExampleString(exampleText) {
  const text = cleanText(exampleText);
  if (!text) return { japanese: '', kana: '', romaji: '', english: '' };

  const match = text.match(/\[JPN\]\s*(.*?)\s*\[JPN_KANA\]\s*(.*?)\s*\[ROMAJI\]\s*(.*?)\s*\[ENG\]\s*(.*)$/s);
  if (match) {
    return {
      japanese: cleanText(match[1]),
      kana: cleanText(match[2]),
      romaji: cleanText(match[3]),
      english: cleanText(match[4]),
    };
  }

  return {
    japanese: text,
    kana: '',
    romaji: '',
    english: '',
  };
}

function parseExamplesMap(payload) {
  const examples = [];
  if (!payload || !Array.isArray(payload)) return examples;

  for (const entry of payload) {
    const item = parseExampleString(entry?.example || entry?.Example || entry?.item_usage_example || '');
    if (!item.japanese && !item.kana && !item.english) continue;
    examples.push({
      ...item,
      type: entry?.example_type || entry?.type || 'example',
    });
  }

  return examples;
}

async function fetchJson(url, label) {
  console.log('Fetching URL:', url);
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; JLPTMatomeSeed/1.0)',
      Accept: 'application/json, text/plain, */*',
    },
  });

  const raw = await res.text();
  if (!res.ok) {
    throw new Error(`${label} failed (${res.status}): ${raw.slice(0, 250)}`);
  }

  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function buildKanaDeck(scriptName, kanaMap) {
  return Object.entries(kanaMap).map(([romaji, kana], index) => ({
    _id: new mongoose.Types.ObjectId(),
    type: scriptName === 'hiragana' ? 'hiragana' : 'katakana',
    kanji: kana,
    reading: kana,
    romaji,
    meaning: `${scriptName === 'hiragana' ? 'Hiragana' : 'Katakana'} for "${romaji}"`,
    category: scriptName,
    tags: ['jlpt-matome', scriptName],
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    dueDate: Date.now() + index,
  }));
}

async function enrichVocabularyList(levelNum, list = []) {
  const levelName = `N${levelNum}`;
  const enriched = [];

  for (const item of list) {
    const word = item.word || item.Word || '';
    if (!word) continue;

    const detailResponse = await fetchJson(
      `${BASE_URL}/api/vocabulary/details?word=${encodeURIComponent(word)}`,
      `Vocabulary detail for ${word}`
    );

    const detail = Array.isArray(detailResponse) ? detailResponse[0] : detailResponse?.data?.[0] || {};
    const examples = (Array.isArray(detailResponse) ? detailResponse : []).map((row) => parseExampleString(row?.Example || row?.example || ''));
    const firstExample = examples.find((example) => example.japanese) || {};

    enriched.push({
      _id: new mongoose.Types.ObjectId(),
      type: 'vocab',
      jlpt: levelName,
      category: levelName,
      kanji: word,
      reading: detail.Hiragana || item.hiragana || item.Hiragana || word,
      romaji: detail.Romaji || item.romaji || item.Romaji || '',
      meaning: detail.Meaning || item.meaning || item.Meaning || '',
      example: firstExample.japanese || '',
      exampleReading: firstExample.kana || '',
      exampleMeaning: firstExample.english || '',
      tags: ['jlpt-matome', 'vocab', levelName],
      interval: 0,
      repetitions: 0,
      easeFactor: 2.5,
      dueDate: Date.now(),
    });
  }

  return enriched;
}

async function enrichGrammarList(levelNum, list = []) {
  const levelName = `N${levelNum}`;
  const enriched = [];

  for (const item of list) {
    const name = item.item_name_jpn || item.item_name_jpn_hiragana || item.item_name_romaji || '';
    if (!name) continue;

    const detailResponse = await fetchJson(
      `${BASE_URL}/api/grammar/item?name=${encodeURIComponent(name)}`,
      `Grammar detail for ${name}`
    );

    const detail = Array.isArray(detailResponse?.data) ? detailResponse.data[0] : detailResponse?.data || item;
    const parsedExamples = [];
    for (const [key, value] of Object.entries(detail)) {
      if (key.startsWith('item_usage_example_')) {
        const parsed = parseExampleString(value);
        if (parsed.japanese || parsed.kana || parsed.english) {
          parsedExamples.push(parsed);
        }
      }
    }

    const firstExample = parsedExamples[0] || {};

    enriched.push({
      _id: new mongoose.Types.ObjectId(),
      type: 'grammar',
      jlpt: levelName,
      category: levelName,
      grammar: detail.item_name_jpn || name,
      reading: detail.item_name_jpn_hiragana || detail.item_name_romaji || name,
      romaji: detail.item_name_romaji || '',
      meaning: detail.item_meaning || detail.item_name_en || '',
      definition: detail.item_meaning || detail.item_name_en || '',
      formation: detail.item_formation || '',
      usage: detail.item_usage_context || detail.item_usage || '',
      howToUse: detail.item_usage_context || '',
      example: firstExample.japanese || '',
      exampleReading: firstExample.kana || '',
      exampleMeaning: firstExample.english || '',
      examples: parsedExamples,
      tags: ['jlpt-matome', 'grammar', levelName],
      interval: 0,
      repetitions: 0,
      easeFactor: 2.5,
      dueDate: Date.now(),
    });
  }

  return enriched;
}

async function enrichKanjiList(levelNum, list = []) {
  const levelName = `N${levelNum}`;
  const enriched = [];

  for (const item of list) {
    const kanji = item.kanji || item.kanji_char || '';
    if (!kanji) continue;

    const detailResponse = await fetchJson(
      `${BASE_URL}/api/kanji/details?kanji=${encodeURIComponent(kanji)}`,
      `Kanji detail for ${kanji}`
    );
    const detail = detailResponse?.data || item;

    const examplesResponse = await fetchJson(
      `${BASE_URL}/api/kanji/examples?kanji=${encodeURIComponent(kanji)}`,
      `Kanji example for ${kanji}`
    );
    const exampleRows = examplesResponse?.data || [];
    const wordExamples = (exampleRows.filter((row) => row.example_type === 'word')).map((row) => parseExampleString(row.example));
    const sentenceExamples = (exampleRows.filter((row) => row.example_type === 'sentence')).map((row) => parseExampleString(row.example));

    enriched.push({
      _id: new mongoose.Types.ObjectId(),
      type: 'kanji',
      jlpt: levelName,
      category: levelName,
      kanji,
      reading: [detail.reading_onyomi, detail.reading_kunyomi].filter(Boolean).join(' / ') || item.reading_kunyomi || item.reading_onyomi || '',
      onyomi: detail.reading_onyomi || '',
      kunyomi: detail.reading_kunyomi || '',
      romaji: detail.reading_onyomi || detail.reading_kunyomi || '',
      meaning: detail.meaning || item.meaning || '',
      definition: detail.meaning || item.meaning || '',
      strokes: Number(detail.nb_strokes || item.nb_strokes || 0),
      kanjiType: detail.kanji_list_type || '',
      usageFrequency: detail.usage_frequency || '',
      wordExamples,
      sentenceExamples,
      tags: ['jlpt-matome', 'kanji', levelName],
      interval: 0,
      repetitions: 0,
      easeFactor: 2.5,
      dueDate: Date.now(),
    });
  }

  return enriched;
}

async function buildSeedData() {
  const results = [];

  results.push({
    collection: 'Hiragana',
    deck: 'Hiragana Basics',
    cards: buildKanaDeck('hiragana', HIRAGANA),
  });

  results.push({
    collection: 'Katakana',
    deck: 'Katakana Basics',
    cards: buildKanaDeck('katakana', KATAKANA),
  });

  for (const { label, value } of LEVELS) {
    const vocabList = await fetchJson(`${BASE_URL}/api/vocabulary?jlpt_level=${value}`, `Vocab list ${label}`);
    const grammarList = await fetchJson(`${BASE_URL}/api/grammar?level=${value}`, `Grammar list ${label}`);
    const kanjiList = await fetchJson(`${BASE_URL}/api/kanji?jlpt_level=${value}`, `Kanji list ${label}`);

    results.push({
      collection: 'Vocabs',
      deck: `${label} Vocabs`,
      cards: await enrichVocabularyList(value, vocabList?.data || []),
    });

    results.push({
      collection: 'Grammar',
      deck: `${label} Grammar`,
      cards: await enrichGrammarList(value, grammarList?.data || []),
    });

    results.push({
      collection: 'Kanji',
      deck: `${label} Kanji`,
      cards: await enrichKanjiList(value, kanjiList?.data || []),
    });
  }

  return results;
}

async function seedToMongo(data, dryRun = false) {
  if (dryRun) {
    for (const item of data) {
      console.log(`${item.collection} / ${item.deck}: ${item.cards.length} cards`);
    }
    return;
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not set. Add it to .env.local before running the database seed.');
  }

  await mongoose.connect(mongoUri);

  for (const item of data) {
    const existingCollection = await mongoose.connection.db.collection('collections').findOne({ name: item.collection });

    if (existingCollection) {
      const existingDeck = existingCollection.decks?.find((deck) => deck.name === item.deck);

      if (existingDeck) {
        await mongoose.connection.db.collection('collections').updateOne(
          { _id: existingCollection._id, 'decks.name': item.deck },
          { $set: { 'decks.$.cards': item.cards, 'decks.$._id': existingDeck._id || new mongoose.Types.ObjectId() } }
        );
      } else {
        await mongoose.connection.db.collection('collections').updateOne(
          { _id: existingCollection._id },
          { $push: { decks: { _id: new mongoose.Types.ObjectId(), name: item.deck, cards: item.cards } } }
        );
      }
    } else {
      await mongoose.connection.db.collection('collections').insertOne({
        name: item.collection,
        description: `${item.collection} decks seeded from JLPTMatome`,
        decks: [{ _id: new mongoose.Types.ObjectId(), name: item.deck, cards: item.cards }],
      });
    }

    console.log(`Saved ${item.collection} / ${item.deck}: ${item.cards.length} cards`);
  }

  await mongoose.disconnect();
}

async function main() {
  const dryRun = process.argv.includes('--dry-run') || !process.env.MONGODB_URI;
  const data = await buildSeedData();

  if (dryRun) {
    await seedToMongo(data, true);
    console.log('\nDry run complete. Set MONGODB_URI in .env.local and run again without --dry-run to save to MongoDB.');
    return;
  }

  await seedToMongo(data, false);
  console.log('JLPTMatome seed complete.');
}

main().catch((error) => {
  console.error('Seed failed:', error.message);
  process.exit(1);
});
