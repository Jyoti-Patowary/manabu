import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  splitIntoMoras,
  generatePitchContour,
  getPitchTypeName,
  lookupPitchAccent,
} from './pitchAccentData.js';

describe('pitchAccentData library', () => {
  it('correctly segments words into phonological moras', () => {
    // Digraphs (yōon)
    assert.deepEqual(splitIntoMoras('きょうと'), ['きょ', 'う', 'と']);
    assert.deepEqual(splitIntoMoras('しゃしん'), ['しゃ', 'し', 'ん']);
    assert.deepEqual(splitIntoMoras('おちゃ'), ['お', 'ちゃ']);

    // Geminate stop (small tsu) and long vowels
    assert.deepEqual(splitIntoMoras('がっこう'), ['が', 'っ', 'こ', 'う']);
    assert.deepEqual(splitIntoMoras('コーヒー'), ['コ', 'ー', 'ヒ', 'ー']);

    // Simple kana
    assert.deepEqual(splitIntoMoras('さくら'), ['さ', 'く', 'ら']);
    assert.deepEqual(splitIntoMoras('ねこ'), ['ね', 'こ']);
  });

  it('generates accurate pitch contour for Heiban [0] (平板)', () => {
    // さくら: 3 moras, Pattern 0 -> [L, H, H]
    const moras = ['さ', 'く', 'ら'];
    const contour = generatePitchContour(moras, 0);

    assert.equal(contour.length, 3);
    assert.equal(contour[0].pitch, 'L');
    assert.equal(contour[1].pitch, 'H');
    assert.equal(contour[2].pitch, 'H');
    assert.equal(contour[0].isDrop, false);
    assert.equal(contour[1].isDrop, false);
    assert.equal(contour[2].isDrop, false);
    assert.equal(getPitchTypeName(0, 3), '平板 (Heiban)');
  });

  it('generates accurate pitch contour for Atamadaka [1] (頭高)', () => {
    // ねこ: 2 moras, Pattern 1 -> [H, L], drop after mora 1
    const moras = ['ね', 'こ'];
    const contour = generatePitchContour(moras, 1);

    assert.equal(contour.length, 2);
    assert.equal(contour[0].pitch, 'H');
    assert.equal(contour[0].isDrop, true);
    assert.equal(contour[1].pitch, 'L');
    assert.equal(getPitchTypeName(1, 2), '頭高 (Atamadaka)');
  });

  it('generates accurate pitch contour for Nakadaka [2] (中高)', () => {
    // たべる: 3 moras, Pattern 2 -> [L, H, L], drop after mora 2
    const moras = ['た', 'べ', 'る'];
    const contour = generatePitchContour(moras, 2);

    assert.equal(contour.length, 3);
    assert.equal(contour[0].pitch, 'L');
    assert.equal(contour[1].pitch, 'H');
    assert.equal(contour[1].isDrop, true);
    assert.equal(contour[2].pitch, 'L');
    assert.equal(getPitchTypeName(2, 3), '中高 (Nakadaka)');
  });

  it('generates accurate pitch contour for Odaka [3] (尾高)', () => {
    // せんせい: 4 moras, Pattern 4 (if pattern equals mora count) or おとこ [3] (3 moras)
    const moras = ['お', 'と', 'こ'];
    const contour = generatePitchContour(moras, 3);

    assert.equal(contour.length, 3);
    assert.equal(contour[0].pitch, 'L');
    assert.equal(contour[1].pitch, 'H');
    assert.equal(contour[2].pitch, 'H');
    assert.equal(contour[2].isDrop, true);
    assert.equal(getPitchTypeName(3, 3), '尾高 (Odaka)');
  });

  it('looks up pitch accent dictionary for common vocabulary', () => {
    // N5 words
    const taberu = lookupPitchAccent('食べる', 'たべる');
    assert.equal(taberu.pattern, 2);
    assert.equal(taberu.hasExplicitData, true);
    assert.equal(taberu.moras[1].pitch, 'H');
    assert.equal(taberu.moras[1].isDrop, true);

    const neko = lookupPitchAccent('猫', 'ねこ');
    assert.equal(neko.pattern, 1);
    assert.equal(neko.typeName, '頭高 (Atamadaka)');

    const nihon = lookupPitchAccent('日本', 'にほん');
    assert.equal(nihon.pattern, 2);

    const sakura = lookupPitchAccent('桜', 'さくら');
    assert.equal(sakura.pattern, 0);
    assert.equal(sakura.typeName, '平板 (Heiban)');
  });

  it('provides sensible heuristic estimates for unlisted words', () => {
    // Unlisted i-adjective: e.g. あたらしい (5 moras) -> drops before い at mora 4
    const res = lookupPitchAccent('新しい', 'あたらしい');
    assert.ok(res.moras.length > 0);
    assert.equal(typeof res.pattern, 'number');
    assert.ok(res.typeName.length > 0);
  });
});

