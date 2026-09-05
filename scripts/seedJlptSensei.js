require('dotenv').config({ path: '.env.local' });

const fs = require('node:fs');
const path = require('node:path');
const cheerio = require('cheerio');
const mongoose = require('mongoose');

const BASE_URL = 'https://jlptsensei.com';
const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

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

const LEVEL_TO_URL = {
  N5: `${BASE_URL}/jlpt-n5-vocabulary-list/`,
  N4: `${BASE_URL}/jlpt-n4-vocabulary-list/`,
  N3: `${BASE_URL}/jlpt-n3-vocabulary-list/`,
  N2: `${BASE_URL}/jlpt-n2-vocabulary-list/`,
  N1: `${BASE_URL}/jlpt-n1-vocabulary-list/`,
};

function cleanText(value) {
  return String(value || '')
    .replace(/\u00A0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isHeaderCell(value) {
  const text = cleanText(value).toLowerCase();
  if (!text) return true;
  return ['#', 'word', 'vocabulary', 'kanji', 'grammar lesson', 'grammar meaning', 'meaning', 'usage', 'type', 'onyomi', 'kunyomi', 'on', 'kun', 'vocabulary list', 'grammar list', 'kanji meaning'].includes(text);
}

function extractJapaneseReading(value) {
  const text = cleanText(value);
  const match = text.match(/[ぁ-ゖァ-ヶー]+/);
  return match ? match[0] : text;
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; JLPTSeed/1.0; +https://example.com)',
      Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} while fetching ${url}`);
  }

  return res.text();
}

function parseVocabRows(html) {
  const $ = cheerio.load(html);
  const items = [];

  $('table tr').each((_, row) => {
    const cells = $(row).find('td, th').toArray().map((cell) => cleanText($(cell).text()));
    if (cells.length < 4) return;
    const [index, word, readingCell, type, meaning] = cells;
    if (!word || !meaning) return;
    if (isHeaderCell(index) || isHeaderCell(word) || isHeaderCell(type)) return;
    if (!/^\d+$/.test(cleanText(index))) return;

    const reading = extractJapaneseReading(readingCell || word);
    const item = {
      type: 'vocab',
      kanji: word,
      reading,
      meaning,
      category: 'vocab',
      tags: ['jlpt-sensei', 'vocab'],
    };

    if (item.kanji && item.meaning) items.push(item);
  });

  return items;
}

function parseGrammarRows(html) {
  const $ = cheerio.load(html);
  const items = [];

  $('table tr').each((_, row) => {
    const cells = $(row).find('td, th').toArray().map((cell) => cleanText($(cell).text()));
    if (cells.length < 4) return;
    const [index, lesson, readingCell, meaning] = cells;
    if (!lesson || !meaning) return;
    if (isHeaderCell(index) || isHeaderCell(lesson) || isHeaderCell(meaning)) return;
    if (!/^\d+$/.test(cleanText(index))) return;

    const item = {
      type: 'grammar',
      grammar: lesson,
      reading: cleanText(readingCell),
      meaning: cleanText(meaning),
      category: 'grammar',
      tags: ['jlpt-sensei', 'grammar'],
    };

    if (item.grammar && item.meaning) items.push(item);
  });

  return items;
}

function parseKanjiRows(html) {
  const $ = cheerio.load(html);
  const items = [];

  $('table tr').each((_, row) => {
    const cells = $(row).find('td, th').toArray().map((cell) => cleanText($(cell).text()));
    if (cells.length < 5) return;
    const [index, kanji, onyomi, kunyomi, meaning] = cells;
    if (!kanji || !meaning) return;
    if (isHeaderCell(index) || isHeaderCell(kanji) || isHeaderCell(meaning)) return;
    if (!/^\d+$/.test(cleanText(index))) return;

    const reading = [onyomi, kunyomi].filter(Boolean).join(' / ');
    const item = {
      type: 'kanji',
      kanji,
      reading,
      meaning,
      category: 'kanji',
      tags: ['jlpt-sensei', 'kanji'],
    };

    if (item.kanji && item.meaning) items.push(item);
  });

  return items;
}

function buildKanaCards(scriptName, kanaMap) {
  return Object.entries(kanaMap).map(([romaji, kana], index) => ({
    _id: new mongoose.Types.ObjectId(),
    type: scriptName === 'hiragana' ? 'hiragana' : 'katakana',
    kanji: kana,
    reading: kana,
    romaji,
    meaning: `${scriptName === 'hiragana' ? 'Hiragana' : 'Katakana'} for "${romaji}"`,
    category: scriptName,
    tags: ['jlpt-sensei', scriptName],
    interval: 0,
    repetitions: 0,
    easeFactor: 2.5,
    dueDate: Date.now() + index,
  }));
}

const BUILDERS = {
  hiragana: async () => buildKanaCards('hiragana', HIRAGANA),
  katakana: async () => buildKanaCards('katakana', KATAKANA),
  vocab: async (level) => {
    const url = LEVEL_TO_URL[level];
    const html = await fetchHtml(url);
    return parseVocabRows(html).map((card, index) => ({
      ...card,
      _id: new mongoose.Types.ObjectId(),
      jlpt: level,
      category: level,
      interval: 0,
      repetitions: 0,
      easeFactor: 2.5,
      dueDate: Date.now() + index,
    }));
  },
  grammar: async (level) => {
    const url = `${BASE_URL}/jlpt-${level.toLowerCase()}-grammar-list/`;
    const html = await fetchHtml(url);
    return parseGrammarRows(html).map((card, index) => ({
      ...card,
      _id: new mongoose.Types.ObjectId(),
      jlpt: level,
      category: level,
      interval: 0,
      repetitions: 0,
      easeFactor: 2.5,
      dueDate: Date.now() + index,
    }));
  },
  kanji: async (level) => {
    const url = `${BASE_URL}/jlpt-${level.toLowerCase()}-kanji-list/`;
    const html = await fetchHtml(url);
    return parseKanjiRows(html).map((card, index) => ({
      ...card,
      _id: new mongoose.Types.ObjectId(),
      jlpt: level,
      category: level,
      interval: 0,
      repetitions: 0,
      easeFactor: 2.5,
      dueDate: Date.now() + index,
    }));
  },
};

async function buildSeedData() {
  const results = [];

  results.push({
    collection: 'Hiragana',
    deck: 'Hiragana Basics',
    cards: await BUILDERS.hiragana(),
  });

  results.push({
    collection: 'Katakana',
    deck: 'Katakana Basics',
    cards: await BUILDERS.katakana(),
  });

  for (const level of LEVELS) {
    results.push({
      collection: 'Vocabs',
      deck: `${level} Vocabs`,
      cards: await BUILDERS.vocab(level),
    });

    results.push({
      collection: 'Grammar',
      deck: `${level} Grammar`,
      cards: await BUILDERS.grammar(level),
    });

    results.push({
      collection: 'Kanji',
      deck: `${level} Kanji`,
      cards: await BUILDERS.kanji(level),
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
    const collection = await mongoose.connection.db.collection('collections').findOne({ name: item.collection });

    if (collection) {
      const existingDeck = collection.decks?.find((deck) => deck.name === item.deck);
      if (!existingDeck) {
        await mongoose.connection.db.collection('collections').updateOne(
          { _id: collection._id },
          { $push: { decks: { _id: new mongoose.Types.ObjectId(), name: item.deck, cards: item.cards } } }
        );
      } else {
        await mongoose.connection.db.collection('collections').updateOne(
          { _id: collection._id, 'decks.name': item.deck },
          { $set: { 'decks.$.cards': item.cards, 'decks.$._id': existingDeck._id || new mongoose.Types.ObjectId() } }
        );
      }
    } else {
      await mongoose.connection.db.collection('collections').insertOne({
        name: item.collection,
        description: `${item.collection} decks seeded from JLPT Sensei`,
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
  console.log('Seed complete.');
}

main().catch((error) => {
  console.error('Seed failed:', error.message);
  process.exit(1);
});
