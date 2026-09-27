/**
 * Graded Reader Library and Spaced Repetition Integration
 * Stories are stored as structured sentence & token objects to enable
 * individual word tapping, furigana toggles, reading readiness scoring,
 * and in-text SRS reinforcement highlighting.
 */

export const GRADED_READERS = [
  {
    id: 'reader-n5-tanaka-daily',
    title: '田中さんの一日',
    title_en: 'A Day in the Life of Tanaka-san',
    jlpt: 'N5',
    category: '日常生活 (Daily Life)',
    description: '田中さんの朝のルーティンから夜の勉強時間までのシンプルな日常ストーリー。',
    word_count: 120,
    sentences: [
      {
        id: 's1',
        japanese: '田中さんは毎朝七時に起きます。',
        english: 'Tanaka-san wakes up at 7 o\'clock every morning.',
        tokens: [
          { surface: '田中さん', base: '田中さん', reading: 'たなかさん', meaning: 'Mr./Ms. Tanaka', type: 'vocab', jlpt: 'N5' },
          { surface: 'は', reading: 'は', meaning: 'topic marker', type: 'particle' },
          { surface: '毎朝', base: '毎朝', reading: 'まいあさ', meaning: 'every morning', type: 'vocab', jlpt: 'N5' },
          { surface: '七時', base: '七時', reading: 'しちじ', meaning: '7 o\'clock', type: 'vocab', jlpt: 'N5' },
          { surface: 'に', reading: 'に', meaning: 'at/on (time marker)', type: 'particle' },
          { surface: '起きます', base: '起きる', reading: 'おきます', meaning: 'to wake up / get up', type: 'vocab', jlpt: 'N5' },
          { surface: '。', type: 'punct' },
        ],
      },
      {
        id: 's2',
        japanese: '朝ごはんにおいしいパンと卵を食べます。',
        english: 'For breakfast, he eats delicious bread and eggs.',
        tokens: [
          { surface: '朝ごはん', base: '朝ごはん', reading: 'あさごはん', meaning: 'breakfast', type: 'vocab', jlpt: 'N5' },
          { surface: 'に', reading: 'に', meaning: 'for (purpose)', type: 'particle' },
          { surface: 'おいしい', base: 'おいしい', reading: 'おいしい', meaning: 'delicious / tasty', type: 'vocab', jlpt: 'N5' },
          { surface: 'パン', base: 'パン', reading: 'ぱん', meaning: 'bread', type: 'vocab', jlpt: 'N5' },
          { surface: 'と', reading: 'と', meaning: 'and', type: 'particle' },
          { surface: '卵', base: '卵', reading: 'たまご', meaning: 'egg', type: 'vocab', jlpt: 'N5' },
          { surface: 'を', reading: 'を', meaning: 'object marker', type: 'particle' },
          { surface: '食べます', base: '食べる', reading: 'たべます', meaning: 'to eat', type: 'vocab', jlpt: 'N5' },
          { surface: '。', type: 'punct' },
        ],
      },
      {
        id: 's3',
        japanese: 'それから熱いお茶を飲みます。',
        english: 'Then, he drinks hot green tea.',
        tokens: [
          { surface: 'それから', base: 'それから', reading: 'それから', meaning: 'and then / after that', type: 'vocab', jlpt: 'N5' },
          { surface: '熱い', base: '熱い', reading: 'あつい', meaning: 'hot (thing)', type: 'vocab', jlpt: 'N5' },
          { surface: 'お茶', base: 'お茶', reading: 'おちゃ', meaning: 'tea / green tea', type: 'vocab', jlpt: 'N5' },
          { surface: 'を', reading: 'を', meaning: 'object marker', type: 'particle' },
          { surface: '飲みます', base: '飲む', reading: 'のみます', meaning: 'to drink', type: 'vocab', jlpt: 'N5' },
          { surface: '。', type: 'punct' },
        ],
      },
      {
        id: 's4',
        japanese: '八時半に電車で会社に行きます。',
        english: 'At 8:30, he goes to his company by train.',
        tokens: [
          { surface: '八時半', base: '八時半', reading: 'はちじはん', meaning: '8:30', type: 'vocab', jlpt: 'N5' },
          { surface: 'に', reading: 'に', meaning: 'at', type: 'particle' },
          { surface: '電車', base: '電車', reading: 'でんしゃ', meaning: 'train', type: 'vocab', jlpt: 'N5' },
          { surface: 'で', reading: 'で', meaning: 'by means of', type: 'particle' },
          { surface: '会社', base: '会社', reading: 'かいしゃ', meaning: 'company / office', type: 'vocab', jlpt: 'N5' },
          { surface: 'に', reading: 'に', meaning: 'to (destination)', type: 'particle' },
          { surface: '行きます', base: '行く', reading: 'いきます', meaning: 'to go', type: 'vocab', jlpt: 'N5' },
          { surface: '。', type: 'punct' },
        ],
      },
      {
        id: 's5',
        japanese: '夜は家で日本語を勉強します。',
        english: 'At night, he studies Japanese at home.',
        tokens: [
          { surface: '夜', base: '夜', reading: 'よる', meaning: 'night / evening', type: 'vocab', jlpt: 'N5' },
          { surface: 'は', reading: 'は', meaning: 'topic marker', type: 'particle' },
          { surface: '家', base: '家', reading: 'いえ', meaning: 'house / home', type: 'vocab', jlpt: 'N5' },
          { surface: 'で', reading: 'で', meaning: 'at / in (location of action)', type: 'particle' },
          { surface: '日本語', base: '日本語', reading: 'にほんご', meaning: 'Japanese language', type: 'vocab', jlpt: 'N5' },
          { surface: 'を', reading: 'を', meaning: 'object marker', type: 'particle' },
          { surface: '勉強します', base: '勉強する', reading: 'べんきょうします', meaning: 'to study', type: 'vocab', jlpt: 'N5' },
          { surface: '。', type: 'punct' },
        ],
      },
    ],
  },
  {
    id: 'reader-n5-cafe-first-time',
    title: 'はじめての喫茶店',
    title_en: 'First Time at a Japanese Café',
    jlpt: 'N5',
    category: '文化・食事 (Culture & Food)',
    description: '静かな喫茶店に入ってコーヒーとケーキを注文する会話形式のストーリー。',
    word_count: 135,
    sentences: [
      {
        id: 's1',
        japanese: '駅の近くに小さな喫茶店があります。',
        english: 'There is a small café near the station.',
        tokens: [
          { surface: '駅', base: '駅', reading: 'えき', meaning: 'station', type: 'vocab', jlpt: 'N5' },
          { surface: 'の', reading: 'の', meaning: 'of (possessive/location)', type: 'particle' },
          { surface: '近く', base: '近く', reading: 'ちかく', meaning: 'near / vicinity', type: 'vocab', jlpt: 'N5' },
          { surface: 'に', reading: 'に', meaning: 'at (existence location)', type: 'particle' },
          { surface: '小さな', base: '小さな', reading: 'ちいさな', meaning: 'small / little', type: 'vocab', jlpt: 'N5' },
          { surface: '喫茶店', base: '喫茶店', reading: 'きっさてん', meaning: 'coffee shop / café', type: 'vocab', jlpt: 'N5' },
          { surface: 'が', reading: 'が', meaning: 'subject marker', type: 'particle' },
          { surface: 'あります', base: 'ある', reading: 'あります', meaning: 'there is (inanimate)', type: 'vocab', jlpt: 'N5' },
          { surface: '。', type: 'punct' },
        ],
      },
      {
        id: 's2',
        japanese: '店の中はとても静かで、音楽が流れています。',
        english: 'Inside the shop is very quiet, and music is playing.',
        tokens: [
          { surface: '店', base: '店', reading: 'みせ', meaning: 'shop / store', type: 'vocab', jlpt: 'N5' },
          { surface: 'の', reading: 'の', meaning: 'of', type: 'particle' },
          { surface: '中', base: '中', reading: 'なか', meaning: 'inside', type: 'vocab', jlpt: 'N5' },
          { surface: 'は', reading: 'は', meaning: 'topic marker', type: 'particle' },
          { surface: 'とても', base: 'とても', reading: 'とても', meaning: 'very', type: 'vocab', jlpt: 'N5' },
          { surface: '静か', base: '静か', reading: 'しずか', meaning: 'quiet / peaceful', type: 'vocab', jlpt: 'N5' },
          { surface: 'で', reading: 'で', meaning: 'and (na-adj te-form)', type: 'particle' },
          { surface: '、', type: 'punct' },
          { surface: '音楽', base: '音楽', reading: 'おんがく', meaning: 'music', type: 'vocab', jlpt: 'N5' },
          { surface: 'が', reading: 'が', meaning: 'subject marker', type: 'particle' },
          { surface: '流れています', base: '流れる', reading: 'ながれています', meaning: 'is playing / flowing', type: 'vocab', jlpt: 'N5' },
          { surface: '。', type: 'punct' },
        ],
      },
      {
        id: 's3',
        japanese: '店員さんにホットコーヒーをお願いしました。',
        english: 'I ordered hot coffee from the staff.',
        tokens: [
          { surface: '店員さん', base: '店員', reading: 'てんいんさん', meaning: 'store staff / clerk', type: 'vocab', jlpt: 'N5' },
          { surface: 'に', reading: 'に', meaning: 'to / from', type: 'particle' },
          { surface: 'ホットコーヒー', base: 'ホットコーヒー', reading: 'ほっとこーひー', meaning: 'hot coffee', type: 'vocab', jlpt: 'N5' },
          { surface: 'を', reading: 'を', meaning: 'object marker', type: 'particle' },
          { surface: 'お願いしました', base: 'お願いする', reading: 'おねがいしました', meaning: 'requested / ordered', type: 'vocab', jlpt: 'N5' },
          { surface: '。', type: 'punct' },
        ],
      },
    ],
  },
  {
    id: 'reader-n4-momotaro',
    title: '桃太郎の旅立ち',
    title_en: 'The Departure of Momotarō',
    jlpt: 'N4',
    category: '昔話 (Folklore)',
    description: '日本で最も有名な昔話。桃から生まれた男の子が鬼退治へ向かう物語。',
    word_count: 170,
    sentences: [
      {
        id: 's1',
        japanese: '昔々、ある所におじいさんとおばあさんが住んでいました。',
        english: 'Once upon a time, an old man and an old woman lived in a certain place.',
        tokens: [
          { surface: '昔々', base: '昔々', reading: 'むかしむかし', meaning: 'long ago / once upon a time', type: 'vocab', jlpt: 'N4' },
          { surface: '、', type: 'punct' },
          { surface: 'ある', base: 'ある', reading: 'ある', meaning: 'a certain', type: 'vocab', jlpt: 'N4' },
          { surface: '所', base: '所', reading: 'ところ', meaning: 'place', type: 'vocab', jlpt: 'N4' },
          { surface: 'に', reading: 'に', meaning: 'in', type: 'particle' },
          { surface: 'おじいさん', base: 'おじいさん', reading: 'おじいさん', meaning: 'old man / grandfather', type: 'vocab', jlpt: 'N4' },
          { surface: 'と', reading: 'と', meaning: 'and', type: 'particle' },
          { surface: 'おばあさん', base: 'おばあさん', reading: 'おばあさん', meaning: 'old woman / grandmother', type: 'vocab', jlpt: 'N4' },
          { surface: 'が', reading: 'が', meaning: 'subject marker', type: 'particle' },
          { surface: '住んでいました', base: '住む', reading: 'すんでいました', meaning: 'were living', type: 'vocab', jlpt: 'N4' },
          { surface: '。', type: 'punct' },
        ],
      },
      {
        id: 's2',
        japanese: 'ある日、おばあさんが川で洗濯をしていると、大きな桃が流れてきました。',
        english: 'One day, when the old woman was washing clothes at the river, a giant peach came floating down.',
        tokens: [
          { surface: 'ある日', base: 'ある日', reading: 'あるひ', meaning: 'one day', type: 'vocab', jlpt: 'N4' },
          { surface: '、', type: 'punct' },
          { surface: 'おばあさん', base: 'おばあさん', reading: 'おばあさん', meaning: 'old woman', type: 'vocab', jlpt: 'N4' },
          { surface: 'が', reading: 'が', meaning: 'subject marker', type: 'particle' },
          { surface: '川', base: '川', reading: 'かわ', meaning: 'river', type: 'vocab', jlpt: 'N4' },
          { surface: 'で', reading: 'で', meaning: 'at', type: 'particle' },
          { surface: '洗濯', base: '洗濯', reading: 'せんたく', meaning: 'washing / laundry', type: 'vocab', jlpt: 'N4' },
          { surface: 'を', reading: 'を', meaning: 'object marker', type: 'particle' },
          { surface: 'していると', base: 'する', reading: 'していると', meaning: 'when doing (conditional と)', type: 'grammar', jlpt: 'N4' },
          { surface: '、', type: 'punct' },
          { surface: '大きな', base: '大きな', reading: 'おおきな', meaning: 'big / large', type: 'vocab', jlpt: 'N4' },
          { surface: '桃', base: '桃', reading: 'もも', meaning: 'peach', type: 'vocab', jlpt: 'N4' },
          { surface: 'が', reading: 'が', meaning: 'subject marker', type: 'particle' },
          { surface: '流れてきました', base: '流れてくる', reading: 'ながれてきました', meaning: 'came floating down', type: 'vocab', jlpt: 'N4' },
          { surface: '。', type: 'punct' },
        ],
      },
      {
        id: 's3',
        japanese: '桃を持ち帰って切ると、元気な男の子が生まれました。',
        english: 'When they took the peach home and cut it open, a lively baby boy was born.',
        tokens: [
          { surface: '桃', base: '桃', reading: 'もも', meaning: 'peach', type: 'vocab', jlpt: 'N4' },
          { surface: 'を', reading: 'を', meaning: 'object marker', type: 'particle' },
          { surface: '持ち帰って', base: '持ち帰る', reading: 'もちかえって', meaning: 'bring back / take home', type: 'vocab', jlpt: 'N4' },
          { surface: '切ると', base: '切る', reading: 'きると', meaning: 'when cutting open', type: 'grammar', jlpt: 'N4' },
          { surface: '、', type: 'punct' },
          { surface: '元気な', base: '元気', reading: 'げんきな', meaning: 'healthy / lively', type: 'vocab', jlpt: 'N4' },
          { surface: '男の子', base: '男の子', reading: 'おとこのこ', meaning: 'boy', type: 'vocab', jlpt: 'N4' },
          { surface: 'が', reading: 'が', meaning: 'subject marker', type: 'particle' },
          { surface: '生まれました', base: '生まれる', reading: 'うまれました', meaning: 'was born', type: 'vocab', jlpt: 'N4' },
          { surface: '。', type: 'punct' },
        ],
      },
    ],
  },
  {
    id: 'reader-n3-bento-culture',
    title: '日本のお弁当文化と心',
    title_en: 'The Culture and Spirit of Japanese Bento',
    jlpt: 'N3',
    category: '日本文化 (Culture)',
    description: '見た目の美しさと栄養バランスを両立させる、日本の伝統的な弁当文化についての読解文。',
    word_count: 195,
    sentences: [
      {
        id: 's1',
        japanese: '日本のお弁当は、単なる昼食ではなく、家族の愛情や季節感を表現する文化です。',
        english: 'Japanese bento is not merely a lunch, but a culture expressing familial love and seasonal aesthetic.',
        tokens: [
          { surface: '日本', base: '日本', reading: 'にほん', meaning: 'Japan', type: 'vocab', jlpt: 'N3' },
          { surface: 'の', reading: 'の', meaning: 'of', type: 'particle' },
          { surface: 'お弁当', base: '弁当', reading: 'おべんとう', meaning: 'boxed lunch / bento', type: 'vocab', jlpt: 'N3' },
          { surface: 'は', reading: 'は', meaning: 'topic marker', type: 'particle' },
          { surface: '、', type: 'punct' },
          { surface: '単なる', base: '単なる', reading: 'たんなる', meaning: 'mere / simple', type: 'vocab', jlpt: 'N3' },
          { surface: '昼食', base: '昼食', reading: 'ちゅうしょく', meaning: 'lunch', type: 'vocab', jlpt: 'N3' },
          { surface: 'ではなく', base: 'ではない', reading: 'ではなく', meaning: 'not (formal connective)', type: 'grammar', jlpt: 'N3' },
          { surface: '、', type: 'punct' },
          { surface: '家族', base: '家族', reading: 'かぞく', meaning: 'family', type: 'vocab', jlpt: 'N3' },
          { surface: 'の', reading: 'の', meaning: 'of', type: 'particle' },
          { surface: '愛情', base: '愛情', reading: 'あいじょう', meaning: 'love / affection', type: 'vocab', jlpt: 'N3' },
          { surface: 'や', reading: 'や', meaning: 'and / or (non-exhaustive)', type: 'particle' },
          { surface: '季節感', base: '季節感', reading: 'きせつかん', meaning: 'seasonal feeling / aesthetic', type: 'vocab', jlpt: 'N3' },
          { surface: 'を', reading: 'を', meaning: 'object marker', type: 'particle' },
          { surface: '表現する', base: '表現する', reading: 'ひょうげんする', meaning: 'to express / represent', type: 'vocab', jlpt: 'N3' },
          { surface: '文化', base: '文化', reading: 'ぶんか', meaning: 'culture', type: 'vocab', jlpt: 'N3' },
          { surface: 'です', reading: 'です', meaning: 'is / copula', type: 'particle' },
          { surface: '。', type: 'punct' },
        ],
      },
      {
        id: 's2',
        japanese: '彩り豊かなおかずを隙間なく詰めることで、開けた瞬間に喜びを感じられます。',
        english: 'By packing colorful side dishes without gaps, one can feel joy the instant it is opened.',
        tokens: [
          { surface: '彩り豊か', base: '彩り豊か', reading: 'いろどりゆたか', meaning: 'colorful / richly colored', type: 'vocab', jlpt: 'N3' },
          { surface: 'な', reading: 'な', meaning: 'na-adj particle', type: 'particle' },
          { surface: 'おかず', base: 'おかず', reading: 'おかず', meaning: 'side dishes', type: 'vocab', jlpt: 'N3' },
          { surface: 'を', reading: 'を', meaning: 'object marker', type: 'particle' },
          { surface: '隙間なく', base: '隙間なく', reading: 'すきまなく', meaning: 'without gaps / tightly', type: 'vocab', jlpt: 'N3' },
          { surface: '詰めることで', base: '詰める', reading: 'つめることで', meaning: 'by packing (by means of)', type: 'grammar', jlpt: 'N3' },
          { surface: '、', type: 'punct' },
          { surface: '開けた瞬間に', base: '開ける', reading: 'あけたしゅんかんに', meaning: 'the instant of opening', type: 'grammar', jlpt: 'N3' },
          { surface: '喜び', base: '喜び', reading: 'よろこび', meaning: 'joy / delight', type: 'vocab', jlpt: 'N3' },
          { surface: 'を', reading: 'を', meaning: 'object marker', type: 'particle' },
          { surface: '感じられます', base: '感じる', reading: 'かんじられます', meaning: 'can feel / experience', type: 'vocab', jlpt: 'N3' },
          { surface: '。', type: 'punct' },
        ],
      },
    ],
  },
];

/**
 * Returns all graded reader stories
 */
export function getAllReaders() {
  return GRADED_READERS;
}
export const getAllStories = getAllReaders;

/**
 * Filters graded readers by JLPT level
 */
export function getReadersByLevel(level = 'N5') {
  const norm = String(level).toUpperCase().replace(/[^A-Z0-9]/g, '');
  return GRADED_READERS.filter((r) => r.jlpt === norm);
}
export const getStoriesByLevel = getReadersByLevel;

/**
 * Retrieves a specific reader by ID
 */
export function getReaderById(id) {
  return GRADED_READERS.find((r) => r.id === id) || null;
}
export const getStoryById = getReaderById;

/**
 * Extracts unique content vocabulary and grammar words from a story (ignoring particles and punctuation)
 */
export function extractStoryContentWords(story) {
  if (!story || !Array.isArray(story.sentences)) return [];

  const map = new Map();
  for (const s of story.sentences) {
    for (const t of s.tokens || []) {
      if (t.type === 'punct' || t.type === 'particle') continue;
      const key = t.base || t.surface;
      if (!map.has(key)) {
        map.set(key, t);
      }
    }
  }

  return Array.from(map.values());
}

/**
 * Computes the user's Reading Readiness score for a story based on studied cards.
 * A content word is "Mastered/Known" if user has studied it and interval >= 7 days.
 *
 * @param {Object} story
 * @param {Array} userCards
 * @param {number} thresholdDays
 */
export function calculateReadingReadiness(story, userCards = [], thresholdDays = 7) {
  const contentWords = extractStoryContentWords(story);
  const totalCount = contentWords.length;

  if (totalCount === 0) {
    return { readinessPercent: 100, stableCount: 0, dueCount: 0, unstudiedCount: 0, totalCount: 0, statusLabel: 'Ready' };
  }

  const userMap = new Map();
  (userCards || []).forEach((c) => {
    if (c.kanji) userMap.set(c.kanji, c);
    if (c.reading) userMap.set(c.reading, c);
    if (c.grammar) userMap.set(c.grammar, c);
  });

  let stableCount = 0;
  let dueCount = 0;
  let unstudiedCount = 0;

  for (const token of contentWords) {
    const key = token.base || token.surface;
    const userCard = userMap.get(key) || userMap.get(token.surface) || userMap.get(token.reading);

    if (!userCard) {
      unstudiedCount++;
    } else {
      const interval = userCard.interval || 0;
      if (interval >= thresholdDays) {
        stableCount++;
      } else {
        dueCount++;
      }
    }
  }

  const readinessPercent = Math.round((stableCount / totalCount) * 100);

  let statusLabel = 'Vocabulary Prep Recommended';
  if (readinessPercent >= 80) {
    statusLabel = 'Ready to Read!';
  } else if (readinessPercent >= 50) {
    statusLabel = 'Great Challenge';
  }

  return {
    readinessPercent,
    stableCount,
    dueCount,
    unstudiedCount,
    totalCount,
    statusLabel,
  };
}

/**
 * Checks if a specific token matches a card in the user's active SRS queue
 * (due for review or currently in learning phase) for in-text reinforcement highlighting.
 */
export function isTokenInSrsQueue(token, userCards = [], now = Date.now()) {
  if (!token || token.type === 'punct' || token.type === 'particle') return null;

  const key = token.base || token.surface;
  const match = (userCards || []).find((c) => {
    return (
      c.kanji === key ||
      c.kanji === token.surface ||
      c.reading === token.reading ||
      c.grammar === key ||
      c.grammar === token.surface
    );
  });

  if (!match) return null;

  const dueDate = match.dueDate || match.next_review_date || 0;
  const isDue = dueDate <= now;
  const isLearning = (match.interval || 0) < 7;

  return {
    cardId: match.id || match._id,
    interval: match.interval || 0,
    repetitions: match.repetitions || 0,
    isDue,
    isLearning,
  };
}
