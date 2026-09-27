import test from 'node:test';
import assert from 'node:assert/strict';
import { isKatakanaLoanword, hasKanji } from './japaneseUtils.js';

test('japaneseUtils: isKatakanaLoanword identifies foreign loanwords accurately', () => {
  // Pure Katakana loanwords
  assert.equal(isKatakanaLoanword('カフェ'), true);
  assert.equal(isKatakanaLoanword('パン'), true);
  assert.equal(isKatakanaLoanword('アニメ'), true);
  assert.equal(isKatakanaLoanword('テスト'), true);

  // Mixed Katakana + Kanji words (like nationalities or compound loanwords)
  assert.equal(isKatakanaLoanword('アメリカ人'), true);

  // Native Japanese words in Kanji/Hiragana (NOT loanwords)
  assert.equal(isKatakanaLoanword('本'), false);
  assert.equal(isKatakanaLoanword('辞書'), false);
  assert.equal(isKatakanaLoanword('おはよう'), false);
  assert.equal(isKatakanaLoanword('食べる'), false);
  assert.equal(isKatakanaLoanword(''), false);
  assert.equal(isKatakanaLoanword(null), false);

  // Metadata override
  assert.equal(isKatakanaLoanword('word', { thematicCategory: 'loanwords' }), true);
});

test('japaneseUtils: hasKanji detects CJK ideographs', () => {
  assert.equal(hasKanji('本'), true);
  assert.equal(hasKanji('日本語'), true);
  assert.equal(hasKanji('食べる'), true);
  assert.equal(hasKanji('カフェ'), false);
  assert.equal(hasKanji('ひらがな'), false);
});
