/**
 * Utilities for Japanese text formatting, Furigana display, and Katakana loanword identification
 */

/**
 * Regex for Katakana characters (including prolonged sound mark ー and small katakana)
 */
export const KATAKANA_REGEX = /[\u30A0-\u30FF\u31F0-\u31FF\u30FC]/;

/**
 * Regex for Kanji characters (CJK Unified Ideographs)
 */
export const KANJI_REGEX = /[\u4E00-\u9FAF\u3400-\u4DBF]/;

/**
 * Checks whether a word is primarily or characteristically a Katakana loanword (外来語)
 * @param {string} text - The word or expression to evaluate
 * @param {Object} [meta={}] - Optional metadata (partOfSpeech, category, etc.)
 * @returns {boolean}
 */
export function isKatakanaLoanword(text = '', meta = {}) {
  if (!text || typeof text !== 'string') return false;

  // Check explicit category or POS indicators
  if (meta.thematicCategory === 'loanwords' || meta.category === 'loanwords') {
    return true;
  }
  if (Array.isArray(meta.partOfSpeech) && meta.partOfSpeech.some((p) => /loan|gairaigo/i.test(p))) {
    return true;
  }

  // Count Katakana and Kanji characters
  const katakanaChars = text.match(/[\u30A0-\u30FF\u31F0-\u31FF\u30FC]/g) || [];
  const kanjiChars = text.match(/[\u4E00-\u9FAF\u3400-\u4DBF]/g) || [];

  // A word is a loanword if it has 2+ Katakana characters and Katakana outnumbers or equals Kanji
  // (e.g. カフェ, パン, アニメ, テスト, アメリカ人)
  if (katakanaChars.length >= 2 && katakanaChars.length >= kanjiChars.length) {
    return true;
  }

  return false;
}

/**
 * Returns true if text contains Kanji characters
 * @param {string} text
 * @returns {boolean}
 */
export function hasKanji(text = '') {
  if (!text || typeof text !== 'string') return false;
  return /[\u4E00-\u9FAF\u3400-\u4DBF]/.test(text);
}
