/**
 * Japanese Pitch Accent Engine (Tokyo Dialect / 標準語)
 *
 * Provides phonological mora segmentation, pitch contour generation,
 * canonical pitch accent dictionary for JLPT vocabulary, and heuristic fallbacks.
 */

// Contracted small kana that attach to preceding kana to form a single mora
const SMALL_KANA = new Set(['ゃ', 'ゅ', 'ょ', 'ぁ', 'ぃ', 'ぅ', 'ぇ', 'ぉ', 'ャ', 'ュ', 'ョ', 'ァ', 'ィ', 'ゥ', 'ェ', 'ォ']);

/**
 * Splits Japanese text (hiragana or katakana) into phonological moras.
 * E.g.:
 *   "きょうと" -> ["きょ", "う", "と"]
 *   "がっこう" -> ["が", "っ", "こ", "う"]
 *   "おちゃ" -> ["お", "ちゃ"]
 */
export function splitIntoMoras(text) {
  if (!text) return [];
  const chars = Array.from(String(text).trim());
  const moras = [];

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const nextChar = chars[i + 1];

    if (nextChar && SMALL_KANA.has(nextChar)) {
      moras.push(char + nextChar);
      i++; // Skip the combined small kana
    } else {
      moras.push(char);
    }
  }

  return moras;
}

/**
 * Pitch Accent Types:
 * - 0: 平板 (Heiban - Flat)
 * - 1: 頭高 (Atamadaka - Head-High)
 * - 2+: 中高 (Nakadaka - Middle-High)
 * - N (where N == moraCount): 尾高 (Odaka - Tail-High)
 */
export function getPitchTypeName(pattern, moraCount) {
  const p = Number(pattern);
  if (p === 0) return '平板 (Heiban)';
  if (p === 1) return '頭高 (Atamadaka)';
  if (p === moraCount) return '尾高 (Odaka)';
  if (p > 1 && p < moraCount) return '中高 (Nakadaka)';
  return '平板 (Heiban)';
}

/**
 * Generates pitch contour for a sequence of moras given a pitch pattern number.
 * Standard Tokyo pitch accent rules:
 * - Pitch always changes between mora 1 and mora 2 (either L->H or H->L).
 * - Pattern 0 (Heiban): Mora 1 is Low (L), Moras 2..N are High (H), no drop.
 * - Pattern 1 (Atamadaka): Mora 1 is High (H), Moras 2..N are Low (L), drops after mora 1.
 * - Pattern K (Nakadaka/Odaka, K >= 2): Mora 1 is Low (L), Moras 2..K are High (H), Moras K+1..N are Low (L). Drops after mora K.
 *
 * @param {Array<string>} moras
 * @param {number} pattern
 * @returns {Array<{ mora: string, pitch: 'H'|'L', isDrop: boolean }>}
 */
export function generatePitchContour(moras, pattern = 0) {
  const count = moras.length;
  if (count === 0) return [];

  const p = Math.max(0, Number(pattern));

  if (count === 1) {
    // Single-mora word
    const pitch = p === 1 ? 'H' : 'L';
    return [{ mora: moras[0], pitch, isDrop: p === 1 }];
  }

  return moras.map((mora, idx) => {
    const moraNum = idx + 1; // 1-indexed
    let pitch = 'L';
    let isDrop = false;

    if (p === 0) {
      // Heiban: 1 is L, 2+ are H
      pitch = moraNum === 1 ? 'L' : 'H';
    } else if (p === 1) {
      // Atamadaka: 1 is H, 2+ are L
      pitch = moraNum === 1 ? 'H' : 'L';
      if (moraNum === 1) isDrop = true;
    } else {
      // Nakadaka / Odaka: 1 is L, 2..p are H, (p+1)+ are L
      if (moraNum === 1) {
        pitch = 'L';
      } else if (moraNum <= p) {
        pitch = 'H';
      } else {
        pitch = 'L';
      }
      if (moraNum === p) isDrop = true;
    }

    return { mora, pitch, isDrop };
  });
}

/**
 * Curated Pitch Accent Dictionary for Common JLPT Words (N5 - N1)
 * Keys are normalized kanji or hiragana readings.
 */
export const PITCH_ACCENT_DICTIONARY = {
  // N5 Essentials
  '食べる': { pattern: 2, reading: 'たべる' },
  'たべる': { pattern: 2 },
  '飲む': { pattern: 1, reading: 'のむ' },
  'のむ': { pattern: 1 },
  '見る': { pattern: 1, reading: 'みる' },
  'みる': { pattern: 1 },
  '聞く': { pattern: 0, reading: 'きく' },
  'きく': { pattern: 0 },
  '行く': { pattern: 0, reading: 'いく' },
  'いく': { pattern: 0 },
  '来る': { pattern: 1, reading: 'くる' },
  'くる': { pattern: 1 },
  '本': { pattern: 1, reading: 'ほん' },
  'ほん': { pattern: 1 },
  '猫': { pattern: 1, reading: 'ねこ' },
  'ねこ': { pattern: 1 },
  '犬': { pattern: 2, reading: 'いぬ' },
  'いぬ': { pattern: 2 },
  '桜': { pattern: 0, reading: 'さくら' },
  'さくら': { pattern: 0 },
  '水': { pattern: 0, reading: 'みず' },
  'みず': { pattern: 0 },
  'お金': { pattern: 0, reading: 'おかね' },
  'おかね': { pattern: 0 },
  '日本': { pattern: 2, reading: 'にほん' },
  'にほん': { pattern: 2 },
  '日本語': { pattern: 0, reading: 'にほんご' },
  'にほんご': { pattern: 0 },
  '学生': { pattern: 0, reading: 'がくせい' },
  'がくせい': { pattern: 0 },
  '先生': { pattern: 3, reading: 'せんせい' },
  'せんせい': { pattern: 3 },
  '友達': { pattern: 0, reading: 'ともだち' },
  'ともだち': { pattern: 0 },
  '学校': { pattern: 0, reading: 'がっこう' },
  'がっこう': { pattern: 0 },
  '京都': { pattern: 1, reading: 'きょうと' },
  'きょうと': { pattern: 1 },
  '東京': { pattern: 0, reading: 'とうきょう' },
  'とうきょう': { pattern: 0 },
  '朝': { pattern: 1, reading: 'あさ' },
  'あさ': { pattern: 1 },
  '昼': { pattern: 2, reading: 'ひる' },
  'ひる': { pattern: 2 },
  '夜': { pattern: 1, reading: 'よる' },
  'よる': { pattern: 1 },
  '今日': { pattern: 1, reading: 'きょう' },
  'きょう': { pattern: 1 },
  '明日': { pattern: 3, reading: 'あした' },
  'あした': { pattern: 3 },
  'おいしい': { pattern: 3 },
  '大きい': { pattern: 3, reading: 'おおきい' },
  'おおきい': { pattern: 3 },
  '小さい': { pattern: 3, reading: 'ちいさい' },
  'ちいさい': { pattern: 3 },
  '高い': { pattern: 2, reading: 'たかい' },
  'たかい': { pattern: 2 },
  'あなた': { pattern: 2 },
  '私': { pattern: 0, reading: 'わたし' },
  'わたし': { pattern: 0 },
  '車': { pattern: 0, reading: 'くるま' },
  'くるま': { pattern: 0 },
  '電車': { pattern: 0, reading: 'でんしゃ' },
  'でんしゃ': { pattern: 0 },
  '駅': { pattern: 1, reading: 'えき' },
  'えき': { pattern: 1 },
  '雨': { pattern: 1, reading: 'あめ' },
  'あめ': { pattern: 1 },
  '飴': { pattern: 0, reading: 'あめ' },
  '橋': { pattern: 2, reading: 'はし' },
  'はし': { pattern: 2 },
  '箸': { pattern: 1, reading: 'はし' },

  // N4 & N3 Essentials
  '勉強': { pattern: 0, reading: 'べんきょう' },
  'べんきょう': { pattern: 0 },
  '仕事': { pattern: 0, reading: 'しごと' },
  'しごと': { pattern: 0 },
  '会社': { pattern: 0, reading: 'かいしゃ' },
  'かいしゃ': { pattern: 0 },
  '約束': { pattern: 0, reading: 'やくそく' },
  'やくそく': { pattern: 0 },
  '経験': { pattern: 0, reading: 'けいけん' },
  'けいけん': { pattern: 0 },
  '質問': { pattern: 0, reading: 'しつもん' },
  'しつもん': { pattern: 0 },
  '文化': { pattern: 1, reading: 'ぶんか' },
  'ぶんか': { pattern: 1 },
  '伝統': { pattern: 0, reading: 'でんとう' },
  'でんとう': { pattern: 0 },
  '旅行': { pattern: 0, reading: 'りょこう' },
  'りょこう': { pattern: 0 },
  '家族': { pattern: 1, reading: 'かぞく' },
  'かぞく': { pattern: 1 },
  '時間': { pattern: 0, reading: 'じかん' },
  'じかん': { pattern: 0 },
  '世界': { pattern: 1, reading: 'せかい' },
  'せかい': { pattern: 1 },
  '料理': { pattern: 1, reading: 'りょうり' },
  'りょうり': { pattern: 1 },
  '食事': { pattern: 0, reading: 'しょくじ' },
  'しょくじ': { pattern: 0 },
  '弁当': { pattern: 0, reading: 'べんとう' },
  'べんとう': { pattern: 0 },
};

/**
 * Heuristic Pitch Accent Fallback for words not in the explicit dictionary.
 * Standard rules for Japanese lexical classes:
 * - Verbs ending in -u usually have downstep on penultimate mora (e.g. 食べる [2], 始める [3]).
 * - Sino-Japanese kango compounds (2 kanji) are predominantly Heiban [0] (~65%).
 * - i-adjectives have downstep on the syllable right before -i (e.g. 美しい [4], 高い [2]).
 */
function estimatePitchPattern(moras, word, reading) {
  const count = moras.length;
  if (count <= 1) return 1;

  const r = String(reading || word || '');

  // i-adjective: e.g. たかい (3 moras) -> downstep at mora 2 (before い)
  if (r.endsWith('い') && count >= 3) {
    return count - 1;
  }

  // Verb ending in -u/-ru: downstep typically at count - 1
  if ((r.endsWith('る') || r.endsWith('む') || r.endsWith('く') || r.endsWith('す') || r.endsWith('つ')) && count >= 3) {
    return count - 1;
  }

  // Default for Sino-Japanese compounds and common words: Heiban [0]
  return 0;
}

/**
 * Main Lookup Resolver:
 * Takes a word (kanji) and/or reading (kana), returns full pitch accent object:
 * {
 *   word: string,
 *   reading: string,
 *   moras: Array<{ mora: string, pitch: 'H'|'L', isDrop: boolean }>,
 *   pattern: number,
 *   typeName: string,
 *   hasExplicitData: boolean
 * }
 */
export function lookupPitchAccent(word, reading = '') {
  const cleanWord = String(word || '').trim();
  const cleanReading = String(reading || word || '').trim();

  const entry = PITCH_ACCENT_DICTIONARY[cleanWord] || PITCH_ACCENT_DICTIONARY[cleanReading];
  const targetReading = entry?.reading || cleanReading || cleanWord;
  const moras = splitIntoMoras(targetReading);

  let pattern;
  let hasExplicitData = false;

  if (entry && typeof entry.pattern === 'number') {
    pattern = entry.pattern;
    hasExplicitData = true;
  } else {
    pattern = estimatePitchPattern(moras, cleanWord, targetReading);
  }

  const contour = generatePitchContour(moras, pattern);
  const typeName = getPitchTypeName(pattern, moras.length);

  return {
    word: cleanWord,
    reading: targetReading,
    moras: contour,
    pattern,
    typeName,
    hasExplicitData,
  };
}

