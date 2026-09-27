import kanjiRawData from '../../data/kanji_jlpt.json' with { type: 'json' };

export const JLPT_KANJI_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'];

export const KANJI_COUNT_BY_LEVEL = {
  N5: 73,
  N4: 151,
  N3: 341,
  N2: 345,
  N1: 1136,
};

export function getKanjiByLevel(level = 'N5') {
  const normLevel = String(level).toUpperCase().replace(/[^A-Z0-9]/g, '');
  const key = normLevel.includes('5')
    ? 'N5'
    : normLevel.includes('4')
    ? 'N4'
    : normLevel.includes('3')
    ? 'N3'
    : normLevel.includes('2')
    ? 'N2'
    : 'N1';

  return kanjiRawData[key] || [];
}

export function getAllKanji() {
  const all = [];
  JLPT_KANJI_LEVELS.forEach((level) => {
    const list = kanjiRawData[level] || [];
    list.forEach((item) => {
      all.push({ ...item, level });
    });
  });
  return all;
}

export function createKanjiCard(item, level = 'N5') {
  const char = item.kanji || '';
  const hex = item.unicode || (char ? char.charCodeAt(0).toString(16).toUpperCase() : '');
  const cardId = `kanji-${hex.toLowerCase()}-${level.toLowerCase()}`;
  const meaningsText = Array.isArray(item.meanings) ? item.meanings.join(', ') : (item.meaning || '');
  const onyomiText = Array.isArray(item.on_readings) ? item.on_readings.join('、') : (item.onyomi || '');
  const kunyomiText = Array.isArray(item.kun_readings) ? item.kun_readings.join('、') : (item.kunyomi || '');
  const primaryReading = onyomiText.split('、')[0] || kunyomiText.split('、')[0] || '';

  return {
    id: cardId,
    _id: cardId,
    content_type: 'kanji',
    jlpt_level: level,
    type: 'kanji',
    category: `JLPT ${level} Kanji`,
    jlpt: level,
    kanji: char,
    reading: primaryReading,
    meaning: meaningsText || 'Kanji character',
    definition: `JLPT ${level} Kanji: ${meaningsText}. On: ${onyomiText || '—'}, Kun: ${kunyomiText || '—'}`,
    onyomi: onyomiText,
    kunyomi: kunyomiText,
    strokes: Number(item.stroke_count || 0),
    stroke_count: Number(item.stroke_count || 0),
    heisig_keyword: item.heisig_en || '',
    unicode: hex,
    grade: Number(item.grade || 0),
    usageFrequency: String(item.freq_mainichi_shinbun || ''),
    relationships: [],
    interval: 0,
    repetitions: 0,
    ease_factor: 2.5,
    easeFactor: 2.5,
    next_review_date: Date.now(),
    dueDate: Date.now(),
  };
}

export function generateKanjiDeck(level = 'N5') {
  const list = getKanjiByLevel(level);
  return list.map((item) => createKanjiCard(item, level));
}

export function searchKanji(query = '', levelFilter = 'all') {
  const q = String(query).trim().toLowerCase();
  let pool = levelFilter === 'all' ? getAllKanji() : getKanjiByLevel(levelFilter).map(k => ({ ...k, level: levelFilter }));

  if (!q) return pool.slice(0, 100);

  return pool.filter((item) => {
    if (item.kanji === q) return true;
    if (item.unicode && item.unicode.toLowerCase() === q) return true;
    if (item.heisig_en && item.heisig_en.toLowerCase().includes(q)) return true;
    if (Array.isArray(item.meanings) && item.meanings.some(m => m.toLowerCase().includes(q))) return true;
    if (Array.isArray(item.on_readings) && item.on_readings.some(r => r.includes(q))) return true;
    if (Array.isArray(item.kun_readings) && item.kun_readings.some(r => r.includes(q))) return true;
    return false;
  });
}
