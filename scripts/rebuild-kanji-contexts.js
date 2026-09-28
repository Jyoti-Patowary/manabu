import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

import Lesson from '../src/models/Lesson.js';
import VocabEntry from '../src/models/VocabEntry.js';
import KanjiEntry from '../src/models/KanjiEntry.js';

// Kana to Hepburn Romaji converter
const KANA_MAP = {
  // Hiragana
  'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
  'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
  'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
  'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
  'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
  'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
  'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
  'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
  'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
  'わ': 'wa', 'を': 'o', 'ん': 'n',
  'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
  'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
  'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do',
  'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
  'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
  // Katakana
  'ア': 'a', 'イ': 'i', 'ウ': 'u', 'エ': 'e', 'オ': 'o',
  'カ': 'ka', 'キ': 'ki', 'ク': 'ku', 'ケ': 'ke', 'コ': 'ko',
  'サ': 'sa', 'シ': 'shi', 'ス': 'su', 'セ': 'se', 'ソ': 'so',
  'タ': 'ta', 'チ': 'chi', 'ツ': 'tsu', 'テ': 'te', 'ト': 'to',
  'ナ': 'na', 'ニ': 'ni', 'ヌ': 'nu', 'ネ': 'ne', 'ノ': 'no',
  'ハ': 'ha', 'ヒ': 'hi', 'フ': 'fu', 'ヘ': 'he', 'ホ': 'ho',
  'マ': 'ma', 'ミ': 'mi', 'ム': 'mu', 'メ': 'me', 'モ': 'mo',
  'ヤ': 'ya', 'ユ': 'yu', 'ヨ': 'yo',
  'ラ': 'ra', 'リ': 'ri', 'ル': 'ru', 'レ': 're', 'ロ': 'ro',
  'ワ': 'wa', 'ヲ': 'o', 'ン': 'n',
  'ガ': 'ga', 'ギ': 'gi', 'グ': 'gu', 'げ': 'ge', 'ゴ': 'go',
  'ザ': 'za', 'ジ': 'ji', 'ズ': 'zu', 'ゼ': 'ze', 'ゾ': 'zo',
  'ダ': 'da', 'ヂ': 'ji', 'ヅ': 'zu', 'デ': 'de', 'ド': 'do',
  'バ': 'ba', 'ビ': 'bi', 'ブ': 'bu', 'ベ': 'be', 'ボ': 'bo',
  'パ': 'pa', 'ピ': 'pi', 'プ': 'pu', 'ペ': 'pe', 'ポ': 'po',
};

const COMBO_MAP = {
  // Hiragana yoon
  'きゃ': 'kya', 'きゅ': 'kyu', 'きょ': 'kyo',
  'しゃ': 'sha', 'しゅ': 'shu', 'しょ': 'sho',
  'ちゃ': 'cha', 'ちゅ': 'chu', 'ちょ': 'cho',
  'にゃ': 'nya', 'にゅ': 'nyu', 'にょ': 'nyo',
  'ひゃ': 'hya', 'ひゅ': 'hyu', 'ひょ': 'hyo',
  'みゃ': 'mya', 'みゅ': 'myu', 'みょ': 'myo',
  'りゃ': 'rya', 'りゅ': 'ryu', 'りょ': 'ryo',
  'ぎゃ': 'gya', 'ぎゅ': 'gyu', 'ぎょ': 'gyo',
  'じゃ': 'ja', 'じゅ': 'ju', 'じょ': 'jo',
  'ぢゃ': 'ja', 'ぢゅ': 'ju', 'ぢょ': 'jo',
  'びゃ': 'bya', 'びゅ': 'byu', 'びょ': 'byo',
  'ぴゃ': 'pya', 'ぴゅ': 'pyu', 'ぴょ': 'pyo',
  // Katakana yoon & foreign combos
  'キャ': 'kya', 'キュ': 'kyu', 'キョ': 'kyo',
  'シャ': 'sha', 'シュ': 'shu', 'ショ': 'sho',
  'チャ': 'cha', 'チュ': 'chu', 'チョ': 'cho',
  'ニャ': 'nya', 'ニュ': 'nyu', 'ニョ': 'nyo',
  'ヒャ': 'hya', 'ヒュ': 'hyu', 'ヒョ': 'hyo',
  'ミャ': 'mya', 'ミュ': 'myu', 'ミョ': 'myo',
  'リャ': 'rya', 'リュ': 'ryu', 'リョ': 'ryo',
  'ギャ': 'gya', 'ギュ': 'gyu', 'ギョ': 'gyo',
  'ジャ': 'ja', 'ジュ': 'ju', 'ジョ': 'jo',
  'ビャ': 'bya', 'ビュ': 'byu', 'ビョ': 'byo',
  'ピャ': 'pya', 'ピュ': 'pyu', 'ピョ': 'pyo',
  'ティ': 'ti', 'ディ': 'di', 'トゥ': 'tu', 'ドゥ': 'du',
  'ファ': 'fa', 'フィ': 'fi', 'フェ': 'fe', 'フォ': 'fo',
  'ウィ': 'wi', 'ウェ': 'we', 'ウォ': 'wo',
  'シェ': 'she', 'ジェ': 'je', 'チェ': 'che',
};

export function kanaToRomaji(kana) {
  if (!kana) return '';
  let res = '';
  let i = 0;
  while (i < kana.length) {
    if (kana[i] === 'っ' || kana[i] === 'ッ') {
      const nextCombo = kana.slice(i + 1, i + 3);
      const nextChar = kana[i + 1];
      const nextRomaji = COMBO_MAP[nextCombo] || KANA_MAP[nextChar] || '';
      if (nextRomaji) {
        if (nextRomaji.startsWith('ch')) res += 't';
        else res += nextRomaji[0];
      }
      i++;
      continue;
    }
    if (kana[i] === 'ー') {
      const prevChar = res[res.length - 1];
      if (prevChar) res += prevChar;
      i++;
      continue;
    }
    const combo = kana.slice(i, i + 2);
    if (COMBO_MAP[combo]) {
      res += COMBO_MAP[combo];
      i += 2;
      continue;
    }
    const single = kana[i];
    if (KANA_MAP[single]) {
      res += KANA_MAP[single];
    } else {
      res += single;
    }
    i++;
  }
  return res;
}

// Lesson 6 Foundational Kanji curated introductory readings
const L6_FOUNDATIONAL = {
  '一': { reading: 'いち', romaji: 'ichi', meaning: 'one' },
  '二': { reading: 'に', romaji: 'ni', meaning: 'two' },
  '三': { reading: 'さん', romaji: 'san', meaning: 'three' },
  '日': { reading: 'ひ', romaji: 'hi', meaning: 'day, sun' },
  '月': { reading: 'つき', romaji: 'tsuki', meaning: 'month, moon' },
  '木': { reading: 'き', romaji: 'ki', meaning: 'tree, wood' },
  '山': { reading: 'やま', romaji: 'yama', meaning: 'mountain' },
  '川': { reading: 'かわ', romaji: 'kawa', meaning: 'river' },
  '人': { reading: 'ひと', romaji: 'hito', meaning: 'person' },
  '口': { reading: 'くち', romaji: 'kuchi', meaning: 'mouth' },
};

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.');

  const lessons = await Lesson.find().sort({ order: 1 }).lean();
  const lessonMap = new Map();
  lessons.forEach((l) => lessonMap.set(String(l._id), l));

  const cjkRegex = /[\u4e00-\u9faf\u3400-\u4dbf]/g;
  const courseContextsMap = {};

  // 1. Seed foundational Lesson 6 kanji
  for (const [char, meta] of Object.entries(L6_FOUNDATIONAL)) {
    courseContextsMap[char] = [
      {
        lesson: 6,
        vocabulary: char,
        reading: meta.reading,
        romaji: meta.romaji,
        meaning: meta.meaning,
      },
    ];
  }

  // 2. Scan vocabulary sorted by lesson order
  const vocabs = await VocabEntry.find().lean();
  vocabs.sort((a, b) => {
    const lA = lessonMap.get(String(a.lessonId))?.order || 0;
    const lB = lessonMap.get(String(b.lessonId))?.order || 0;
    return lA - lB;
  });

  for (const v of vocabs) {
    if (!v.kanji) continue;
    const lDoc = lessonMap.get(String(v.lessonId));
    const lessonOrder = lDoc ? lDoc.order : null;
    const matches = v.kanji.match(cjkRegex);
    if (!matches) continue;

    const romaji = v.romaji || kanaToRomaji(v.kana);
    const meaning = v.naturalMeaning || v.meanings?.[0] || v.literalMeaning || '';

    for (const char of matches) {
      if (!courseContextsMap[char]) {
        courseContextsMap[char] = [];
      }
      const existing = courseContextsMap[char];
      const isDuplicate = existing.some(
        (c) => c.lesson === lessonOrder && c.vocabulary === v.kanji && c.reading === v.kana
      );
      if (!isDuplicate) {
        existing.push({
          lesson: lessonOrder,
          vocabulary: v.kanji,
          reading: v.kana,
          romaji: romaji,
          meaning: meaning,
        });
      }
    }
  }

  const allKanji = await KanjiEntry.find().lean();
  const allChars = allKanji.map((k) => k.character);

  console.log(`Curriculum Kanji: ${allChars.length}`);
  console.log(`Kanji with course context: ${Object.keys(courseContextsMap).length}`);

  // Generate file content
  const header = `/**
 * Kanji Course Contexts System
 *
 * Sourced directly from actual curriculum vocabulary records across Lessons 1-30.
 *
 * CRITICAL ARCHITECTURAL DISTINCTIONS:
 * 1. Dictionary readings (On'yomi, Kun'yomi, standard definitions) remain strictly preserved
 *    in dictionary source data (KANJIDIC2) and are never modified or overwritten.
 * 2. Vocabulary readings represent the complete learner-facing Japanese words taught in each lesson.
 * 3. Course context records link each Kanji character to the actual vocabulary term(s) where
 *    the learner encounters it, preventing stem truncation (e.g. 冷 is contextualized via 冷たい)
 *    and avoiding conflating compound words with individual character readings.
 * 4. Multiple contexts for a single Kanji are preserved as structured arrays rather than
 *    being collapsed into a single string.
 */

export const KANJI_COURSE_CONTEXTS = ${JSON.stringify(courseContextsMap, null, 2)};

/**
 * Returns all course vocabulary contexts for a given Kanji character.
 * @param {string} char - The Kanji character (e.g. "冷", "何", "結")
 * @returns {Array<{ lesson: number, vocabulary: string, reading: string, romaji: string, meaning: string }>}
 */
export function getKanjiCourseContexts(char) {
  return KANJI_COURSE_CONTEXTS[char] || [];
}

/**
 * Returns the contextual vocabulary record for a given Kanji character in the context of a specific lesson.
 * If no context exists for the specific lesson, falls back to the introductory context.
 * @param {string} char - The Kanji character
 * @param {number} [lessonOrder] - Optional lesson order number (e.g. 8, 15)
 * @returns {{ lesson: number, vocabulary: string, reading: string, romaji: string, meaning: string } | null}
 */
export function getKanjiContextForLesson(char, lessonOrder = null) {
  const contexts = KANJI_COURSE_CONTEXTS[char];
  if (!contexts || contexts.length === 0) return null;
  if (lessonOrder !== null && lessonOrder !== undefined) {
    const match = contexts.find((c) => c.lesson === Number(lessonOrder));
    if (match) return match;
  }
  return contexts[0];
}

/**
 * Backward-compatible helper returning the primary learner-facing reading and metadata.
 * @param {string} char
 * @param {number} [lessonOrder]
 * @returns {{ reading: string, romaji: string, meaning: string, vocabulary: string, lesson: number } | null}
 */
export function getKanjiLessonReading(char, lessonOrder = null) {
  const ctx = getKanjiContextForLesson(char, lessonOrder);
  if (!ctx) return null;
  return {
    reading: ctx.reading,
    romaji: ctx.romaji,
    meaning: ctx.meaning,
    vocabulary: ctx.vocabulary,
    lesson: ctx.lesson,
  };
}
`;

  const outputPath = path.resolve('src/lib/kanjiContextualReadings.js');
  fs.writeFileSync(outputPath, header, 'utf8');
  console.log(`Saved updated course contexts to ${outputPath}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
