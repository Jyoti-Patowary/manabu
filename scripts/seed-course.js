import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Import Mongoose models
import Lesson from '../src/models/Lesson.js';
import KanaEntry from '../src/models/KanaEntry.js';
import GrammarPoint from '../src/models/GrammarPoint.js';
import VocabEntry from '../src/models/VocabEntry.js';
import KanjiEntry from '../src/models/KanjiEntry.js';
import ExampleSentence from '../src/models/ExampleSentence.js';
import UserCard from '../src/models/UserCard.js';
import UserProgress from '../src/models/UserProgress.js';
import User from '../src/models/User.js';
import { seedUnit6, seedUnit7 } from './seed-unit6-unit7.js';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not configured');
}

// 30-Lesson Curriculum Definition


// Supplemental KANJIDIC2 table for common characters missing from base export
const SUPPLEMENTAL_KANJIDIC = {
  '願': { unicode: '9858', onyomi: ['ガン'], kunyomi: ['ねが.う', '-ねがい'], meanings: ['request', 'pledge', 'wish'], strokeCount: 19, grade: 4, jlptLevel: 'N3' },
  '誰': { unicode: '8AB0', onyomi: ['スイ'], kunyomi: ['だれ', 'たれ'], meanings: ['who', 'someone'], strokeCount: 15, grade: 8, jlptLevel: 'N5' },
  '鍵': { unicode: '9375', onyomi: ['ケン'], kunyomi: ['かぎ'], meanings: ['key'], strokeCount: 17, grade: 8, jlptLevel: 'N2' },
  '食': { unicode: '98DF', onyomi: ['ショク', 'ジキ'], kunyomi: ['く.う', 'く.らう', 'た.べる', 'は.む'], meanings: ['eat', 'food'], strokeCount: 9, grade: 2, jlptLevel: 'N5' },
  '飲': { unicode: '98EE', onyomi: ['イン', 'オン'], kunyomi: ['の.む', '-の.み'], meanings: ['drink'], strokeCount: 12, grade: 3, jlptLevel: 'N5' },
  '飯': { unicode: '98EF', onyomi: ['ハン'], kunyomi: ['めし'], meanings: ['meal', 'boiled rice'], strokeCount: 12, grade: 4, jlptLevel: 'N4' },
  '館': { unicode: '9928', onyomi: ['カン'], kunyomi: ['やかた', 'たて'], meanings: ['building', 'mansion', 'large hall'], strokeCount: 16, grade: 3, jlptLevel: 'N4' },
  '駅': { unicode: '99C5', onyomi: ['エキ'], kunyomi: [], meanings: ['station'], strokeCount: 14, grade: 3, jlptLevel: 'N5' },
  '分': { unicode: '5206', onyomi: ['ブン', 'フン', 'ブ'], kunyomi: ['わ.ける', 'わ.け', 'わ.かれる', 'わ.かる'], meanings: ['part', 'minute of time', 'understand'], strokeCount: 4, grade: 2, jlptLevel: 'N5' },
  '椅': { unicode: '6905', onyomi: ['イ'], kunyomi: [], meanings: ['chair'], strokeCount: 12, grade: 8, jlptLevel: 'N2' },
  '電': { unicode: '96FB', onyomi: ['デン'], kunyomi: [], meanings: ['electricity'], strokeCount: 13, grade: 2, jlptLevel: 'N5' },
  '魚': { unicode: '9B5A', onyomi: ['ギョ'], kunyomi: ['うお', 'さかな', '-ざかな'], meanings: ['fish'], strokeCount: 11, grade: 2, jlptLevel: 'N5' },
  '高': { unicode: '9AD8', onyomi: ['コウ'], kunyomi: ['たか.い', 'たか', 'たか.まる', 'たか.める'], meanings: ['tall', 'high', 'expensive'], strokeCount: 10, grade: 2, jlptLevel: 'N5' },
  '面': { unicode: '9762', onyomi: ['メン', 'ベン'], kunyomi: ['おも', 'おもて', 'つら'], meanings: ['mask', 'face', 'surface'], strokeCount: 9, grade: 3, jlptLevel: 'N3' },
  '静': { unicode: '9759', onyomi: ['セイ', 'ジョウ'], kunyomi: ['しず-', 'しず.か', 'しず.まる'], meanings: ['quiet'], strokeCount: 14, grade: 4, jlptLevel: 'N4' },
  '賑': { unicode: '8CD1', onyomi: ['シン'], kunyomi: ['にぎ.わう', 'にぎ.やか'], meanings: ['flourish', 'bustling'], strokeCount: 15, grade: 8, jlptLevel: 'N1' },
  '麗': { unicode: '9E97', onyomi: ['レイ'], kunyomi: ['うるわ.しい', 'うら.らか'], meanings: ['lovely', 'beautiful', 'graceful'], strokeCount: 19, grade: 8, jlptLevel: 'N1' },
  '丈': { unicode: '4E08', onyomi: ['ジョウ'], kunyomi: ['たけ'], meanings: ['length', 'measure', 'sturdy'], strokeCount: 3, grade: 8, jlptLevel: 'N2' },
  '開': { unicode: '958B', onyomi: ['カイ'], kunyomi: ['ひら.く', 'ひら.き', '-びら.き', 'ひら.ける', 'あ.く', 'あ.ける'], meanings: ['open', 'unfold', 'unseal'], strokeCount: 12, grade: 3, jlptLevel: 'N4' },
  '閉': { unicode: '9589', onyomi: ['ヘイ'], kunyomi: ['と.じる', 'と.ざす', 'し.める', 'し.まる', 'た.てる'], meanings: ['closed', 'shut'], strokeCount: 11, grade: 6, jlptLevel: 'N4' },
  '身': { unicode: '8EAB', onyomi: ['シン'], kunyomi: ['み'], meanings: ['somebody', 'person', "one's station in life"], strokeCount: 7, grade: 3, jlptLevel: 'N3' },
  '院': { unicode: '9662', onyomi: ['イン'], kunyomi: [], meanings: ['institution', 'temple', 'mansion', 'school'], strokeCount: 10, grade: 3, jlptLevel: 'N4' },
  '嘘': { unicode: '5618', onyomi: ['キョ', 'コ'], kunyomi: ['うそ', 'ふ.く'], meanings: ['lie', 'falsehood'], strokeCount: 14, grade: 8, jlptLevel: 'N1' },
  '題': { unicode: '984C', onyomi: ['ダイ'], kunyomi: [], meanings: ['topic', 'subject', 'theme'], strokeCount: 18, grade: 3, jlptLevel: 'N4' },
  '雑': { unicode: '96D1', onyomi: ['ザツ', 'ゾウ'], kunyomi: ['まじ.える', 'まじ.る'], meanings: ['miscellaneous', 'mixed'], strokeCount: 14, grade: 5, jlptLevel: 'N3' },
  '靴': { unicode: '9774', onyomi: ['カ'], kunyomi: ['くつ'], meanings: ['shoes', 'boots'], strokeCount: 13, grade: 8, jlptLevel: 'N2' },
  '飛': { unicode: '98DB', onyomi: ['ヒ'], kunyomi: ['と.ぶ', 'と.ばす'], meanings: ['fly', 'skip'], strokeCount: 9, grade: 4, jlptLevel: 'N3' },
  '音': { unicode: '97F3', onyomi: ['オン', 'イン'], kunyomi: ['おと', 'ね'], meanings: ['sound', 'noise'], strokeCount: 9, grade: 1, jlptLevel: 'N4' },
  '除': { unicode: '9664', onyomi: ['ジョ', 'ジ'], kunyomi: ['のぞ.く'], meanings: ['exclude', 'remove', 'divide'], strokeCount: 10, grade: 6, jlptLevel: 'N2' },
  '験': { unicode: '9A13', onyomi: ['ケン', 'ゲン'], kunyomi: ['ため.す'], meanings: ['verification', 'effect', 'testing'], strokeCount: 18, grade: 4, jlptLevel: 'N3' },
  '風': { unicode: '98A8', onyomi: ['フウ', 'フ'], kunyomi: ['かぜ', 'かざ-'], meanings: ['wind', 'air', 'style'], strokeCount: 9, grade: 2, jlptLevel: 'N4' },
  '険': { unicode: '967A', onyomi: ['ケン'], kunyomi: ['けわ.しい'], meanings: ['precipitous', 'inaccessible', 'severe'], strokeCount: 11, grade: 5, jlptLevel: 'N2' },
  '限': { unicode: '9650', onyomi: ['ゲン'], kunyomi: ['かぎ.る', 'かぎ.り'], meanings: ['limit', 'restrict'], strokeCount: 9, grade: 5, jlptLevel: 'N3' },
  '無': { unicode: '7121', onyomi: ['ム', 'ブ'], kunyomi: ['な.い'], meanings: ['nothingness', 'none', 'without'], strokeCount: 12, grade: 4, jlptLevel: 'N3' },
  '頭': { unicode: '982D', onyomi: ['トウ', 'ズ'], kunyomi: ['あたま', 'かしら'], meanings: ['head'], strokeCount: 16, grade: 2, jlptLevel: 'N4' },
  '間': { unicode: '9593', onyomi: ['カン', 'ケン'], kunyomi: ['あいだ', 'ま'], meanings: ['interval', 'space', 'between', 'time'], strokeCount: 12, grade: 2, jlptLevel: 'N5' },
  '障': { unicode: '969C', onyomi: ['ショウ'], kunyomi: ['さわ.る'], meanings: ['hinder', 'hurt', 'obstacle'], strokeCount: 14, grade: 6, jlptLevel: 'N3' },
  '震': { unicode: '9707', onyomi: ['シン'], kunyomi: ['ふる.う', 'ふる.える'], meanings: ['quake', 'shake', 'tremble'], strokeCount: 15, grade: 8, jlptLevel: 'N2' },
};

const LESSON_DEFINITIONS = [
  // Unit 0: Writing Systems & Kanji Fundamentals
  {
    order: 1,
    slug: 'hiragana-1',
    unit: 0,
    title: 'Hiragana I: Vowels & First Consonants',
    titleJapanese: 'ひらがな（一）：母音と基本音',
    type: 'writing-system',
    description: 'Master the 5 core Japanese vowels (あ・い・う・え・お) and the K, S, and T consonant rows with stroke orders and visual mnemonics.',
    estimatedMinutes: 20,
  },
  {
    order: 2,
    slug: 'hiragana-2',
    unit: 0,
    title: 'Hiragana II: Nasals, Liquids, & Solo Sounds',
    titleJapanese: 'ひらがな（二）：残りの清音と「ん」',
    type: 'writing-system',
    description: 'Learn the N, H, M, Y, R, and W rows, the nasal ん, double consonant sokuon (small っ), and long vowels.',
    estimatedMinutes: 20,
  },
  {
    order: 3,
    slug: 'hiragana-3',
    unit: 0,
    title: 'Hiragana III: Sound Shifts & Combinations',
    titleJapanese: 'ひらがな（三）：濁音・半濁音・拗音',
    type: 'writing-system',
    description: 'Explore voiced sounds (が・ざ・だ・ば), semi-voiced (ぱ), and contracted digraphs (きゃ・しゃ・ちゃ).',
    estimatedMinutes: 20,
  },
  {
    order: 4,
    slug: 'katakana-1',
    unit: 0,
    title: 'Katakana I: Core Characters & Loanwords',
    titleJapanese: 'カタカナ（一）：基本４６文字',
    type: 'writing-system',
    description: 'Learn the 46 standard Katakana phonetic characters, stroke order rules, and foreign loanword pronunciation patterns.',
    estimatedMinutes: 20,
  },
  {
    order: 5,
    slug: 'katakana-2',
    unit: 0,
    title: 'Katakana II: Modern Combinations & Long Vowels',
    titleJapanese: 'カタカナ（二）：外来語の特殊音と長音',
    type: 'writing-system',
    description: 'Master loanword sound combinations (ファ・ティ・ディ・ウィ), and the prolonged sound mark (ー).',
    estimatedMinutes: 15,
  },
  {
    order: 6,
    slug: 'kanji-fundamentals',
    unit: 0,
    title: 'Kanji Fundamentals: The Ideographic System',
    titleJapanese: '漢字の基礎：部首と音読み・訓読み',
    type: 'kanji-intro',
    description: 'Understand how Chinese characters function: pictographs, radicals/components, On-readings vs. Kun-readings, and okurigana.',
    estimatedMinutes: 25,
  },

  // Unit 1: The Core Foundation
  {
    order: 7,
    slug: 'greetings-and-courtesy',
    unit: 1,
    title: 'Everyday Courtesy & Classroom Phrases',
    titleJapanese: 'あいさつと日常の表現',
    type: 'vocab-set',
    description: 'Essential social greetings, gratitude formulas, apologies, and classroom Japanese used from day one.',
    estimatedMinutes: 15,
  },
  {
    order: 8,
    slug: 'identity-and-topic',
    unit: 1,
    title: 'Identity & The Topic Marker',
    titleJapanese: '存在・名詞文と主題の「は」',
    type: 'grammar',
    description: 'Learn state-of-being predicates (だ / です), negation (ではありません), topic particle は (wa), and questions with か.',
    estimatedMinutes: 20,
  },
  {
    order: 9,
    slug: 'pointing-and-subject',
    unit: 1,
    title: 'Demonstratives & The Subject Marker',
    titleJapanese: '指示代名詞（こそあど）と主格の「が」',
    type: 'grammar',
    description: 'Discover demonstratives (これ/それ/あれ/どれ and この/その/あの/どの) and differentiate the subject marker が from topic は.',
    estimatedMinutes: 20,
  },
  {
    order: 10,
    slug: 'belonging-and-inclusions',
    unit: 1,
    title: 'Belonging & Inclusions',
    titleJapanese: '所属・連体修飾の「の」と「も」・数字',
    type: 'grammar',
    description: 'Express ownership and modification with particle の, inclusion with も ("also"), and count numbers 1-100 with age counters.',
    estimatedMinutes: 20,
  },

  // Unit 2: Verbs & Basic Action Sequences
  {
    order: 11,
    slug: 'actions-and-venues',
    unit: 2,
    title: 'Action, Object, & Venue',
    titleJapanese: '動詞文：目的語「を」と場所「で」・移動「へ」',
    type: 'grammar',
    description: 'SOV word order, direct objects with を, action location with で, and movement goals with へ and に.',
    estimatedMinutes: 25,
  },
  {
    order: 12,
    slug: 'time-and-polite-tenses',
    unit: 2,
    title: 'Time & Polite Verb Conjugation',
    titleJapanese: '時間「に」と丁寧形（〜ます・〜ました）',
    type: 'grammar',
    description: 'Polite verbal conjugation in present and past (〜ます, 〜ました, 〜ません, 〜ませんでした), and time particle に.',
    estimatedMinutes: 25,
  },
  {
    order: 13,
    slug: 'existence-and-location',
    unit: 2,
    title: 'Existence & Physical Location',
    titleJapanese: '存在の動詞（ある・いる）と所在「に」',
    type: 'grammar',
    description: 'Distinguish animate existence (いる) from inanimate (ある) and express physical locations with に.',
    estimatedMinutes: 20,
  },
  {
    order: 14,
    slug: 'companions-and-lists',
    unit: 2,
    title: 'Companions & Interpersonal Actions',
    titleJapanese: '共格「と」・並立「や」と相手の「に」',
    type: 'grammar',
    description: 'Doing actions with companions (particle と), exhaustive vs non-exhaustive lists, and recipient targets with に.',
    estimatedMinutes: 20,
  },

  // Unit 3: Descriptive Grammar
  {
    order: 15,
    slug: 'true-i-adjectives',
    unit: 3,
    title: 'True Adjectives (い-Adjectives)',
    titleJapanese: 'い形容詞の活用（肯定・否定・過去）',
    type: 'grammar',
    description: 'Conjugate い-adjectives across present, negative (〜くない), past (〜かった), and past-negative (〜くなかった).',
    estimatedMinutes: 20,
  },
  {
    order: 16,
    slug: 'na-adjectives',
    unit: 3,
    title: 'Adjectival Nouns (な-Adjectives)',
    titleJapanese: 'な形容詞（形容動詞）の性質と活用',
    type: 'grammar',
    description: 'Modify nouns with な-adjectives, conjugate predicate endings, and form adverbs with に.',
    estimatedMinutes: 20,
  },
  {
    order: 17,
    slug: 'comparisons-and-degree',
    unit: 3,
    title: 'Comparisons & Degree',
    titleJapanese: '比較（より〜のほうが）と最上級（一番）',
    type: 'grammar',
    description: 'Form comparative sentences (Aのほうが Bより), superlatives (一番), and use adverbs of degree.',
    estimatedMinutes: 20,
  },

  // Unit 4: The Linking Engine (て-Form)
  {
    order: 18,
    slug: 'verb-groups',
    unit: 4,
    title: 'Verb Classification & Dictionary Roots',
    titleJapanese: '動詞のグループ分け（五段・一段・不規則）',
    type: 'grammar',
    description: 'Classify verbs into Godan (Group 1), Ichidan (Group 2), and Irregular (Group 3) from their dictionary form.',
    estimatedMinutes: 25,
  },
  {
    order: 19,
    slug: 'te-form-linking',
    unit: 4,
    title: 'The Conjunctive て-Form',
    titleJapanese: 'て形の作り方と動作の連続・理由',
    type: 'grammar',
    description: 'Master the te-form conjugation rules across all verb groups to chain sequential actions and express reasons.',
    estimatedMinutes: 30,
  },
  {
    order: 20,
    slug: 'ongoing-and-resulting-states',
    unit: 4,
    title: 'Ongoing Actions & Resulting States',
    titleJapanese: '〜ている（進行中の動作と結果の状態）',
    type: 'grammar',
    description: 'Use 〜ている for ongoing progressive actions and durable resulting states (住んでいる, 知っている).',
    estimatedMinutes: 20,
  },
  {
    order: 21,
    slug: 'requests-and-permissions',
    unit: 4,
    title: 'Requests, Permissions, & Prohibitions',
    titleJapanese: '〜てください・〜てもいい・〜てはいけない',
    type: 'grammar',
    description: 'Polite requests (〜てください), asking permission (〜てもいいですか), and expressing prohibitions (〜てはいけません).',
    estimatedMinutes: 20,
  },

  // Unit 5: Casual Register & Complex Sentences
  {
    order: 22,
    slug: 'plain-casual-register',
    unit: 5,
    title: 'The Plain / Informal Speech Register',
    titleJapanese: '普通体・タ形・ナイ形と日常のタメ口',
    type: 'grammar',
    description: 'Casual conversation forms: Plain present, Plain negative (〜ない), Plain past (〜た), and Plain past-neg (〜なかった).',
    estimatedMinutes: 25,
  },
  {
    order: 23,
    slug: 'quoting-and-thoughts',
    unit: 5,
    title: 'Quoting & Expressing Thoughts',
    titleJapanese: '引用の「と」（〜と思う・〜と言った）',
    type: 'grammar',
    description: 'Direct and indirect quotation with particle と, and expressing personal opinions with 〜と思う.',
    estimatedMinutes: 20,
  },
  {
    order: 24,
    slug: 'noun-modification-clauses',
    unit: 5,
    title: 'Noun Modification (Relative Clauses)',
    titleJapanese: '連体修飾節（名詞を修飾する文）',
    type: 'grammar',
    description: 'Embed full descriptive clauses directly before nouns without relative pronouns (e.g. 昨日買った本).',
    estimatedMinutes: 25,
  },

  // Unit 6: Desires, Experiences, & Ability
  {
    order: 25,
    slug: 'desires-and-wants',
    unit: 6,
    title: 'Wants & Desires',
    titleJapanese: '願望表現（〜たい・ほしい・〜たがる）',
    type: 'grammar',
    description: 'Express personal wishes with verb-stem + 〜たい, nominal desire with ほしい, and third-person wants with 〜たがる.',
    estimatedMinutes: 20,
  },
  {
    order: 26,
    slug: 'experience-and-actions',
    unit: 6,
    title: 'Past Experience & Listing Actions',
    titleJapanese: '経験（〜たことがある）と例示（〜たり〜たり）',
    type: 'grammar',
    description: 'Talk about life experiences with 〜たことがある, and list non-exhaustive actions with 〜たり〜たりする.',
    estimatedMinutes: 20,
  },
  {
    order: 27,
    slug: 'potential-form-ability',
    unit: 6,
    title: 'Ability & The Potential Form',
    titleJapanese: '可能動詞（〜(ら)れる）と能力表現',
    type: 'grammar',
    description: 'Conjugate verbs into potential form to express ability, and observe the object particle shift from を to が.',
    estimatedMinutes: 25,
  },

  // Unit 7: Obligations, Recommendations, & Conjectures
  {
    order: 28,
    slug: 'obligations-and-absence',
    unit: 7,
    title: 'Obligation & Absence of Obligation',
    titleJapanese: '義務（〜なければならない）と不必要（〜なくてもいい）',
    type: 'grammar',
    description: 'Express necessity ("must do" 〜なければならない / 〜ないといけない) and absence of duty ("don\'t have to" 〜なくてもいい).',
    estimatedMinutes: 25,
  },
  {
    order: 29,
    slug: 'advice-and-recommendations',
    unit: 7,
    title: 'Advice & Recommendations',
    titleJapanese: '助言（〜たほうがいい）と提案（〜たらどう）',
    type: 'grammar',
    description: 'Give guidance with 〜たほうがいい ("you should") and 〜ないほうがいい ("you shouldn\'t").',
    estimatedMinutes: 20,
  },
  {
    order: 30,
    slug: 'explanations-and-conjectures',
    unit: 7,
    title: 'Explanation & Conjecture',
    titleJapanese: '説明の「のだ・んだ」と推量（〜でしょう・〜かもしれない）',
    type: 'grammar',
    description: 'Use the explanatory のだ / んだ to seek or give clarification, and express conjectures with 〜かもしれない and 〜でしょう.',
    estimatedMinutes: 25,
  },
];

// Helper to seed all 30 lessons idempotently
async function seedLessons() {
  console.log('Seeding 30 curriculum lessons in sequence...');
  const lessonDocs = {};

  for (let i = 0; i < LESSON_DEFINITIONS.length; i++) {
    const def = LESSON_DEFINITIONS[i];
    const prevOrder = def.order - 1;
    const prereqIds = [];

    if (prevOrder > 0 && lessonDocs[prevOrder]) {
      prereqIds.push(lessonDocs[prevOrder]._id);
    }

    const doc = await Lesson.findOneAndUpdate(
      { order: def.order },
      {
        $set: {
          slug: def.slug,
          unit: def.unit,
          title: def.title,
          titleJapanese: def.titleJapanese,
          type: def.type,
          prerequisiteLessonIds: prereqIds,
          description: def.description,
          estimatedMinutes: def.estimatedMinutes,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    lessonDocs[def.order] = doc;
  }

  console.log(`✓ Seeded all ${Object.keys(lessonDocs).length} lessons successfully.`);
  return lessonDocs;
}

// Seed Unit 0: Writing Systems (Hiragana, Katakana, and Kanji intro)
async function seedUnit0(lessonDocs) {
  console.log('Seeding Unit 0 writing systems & kanji intro...');

  // 1. Lesson 1: Hiragana Part 1 (Vowels + K/S/T rows = 20 chars)
  const hiraL1 = [
    { c: 'あ', r: 'a', m: 'Looks like an Apple with a stem.' },
    { c: 'い', r: 'i', m: 'Two vertical lines like two hawaii Insects.' },
    { c: 'う', r: 'u', m: 'Looks like a person punched in the stomach shouting Ugh!' },
    { c: 'え', r: 'e', m: 'Looks like an Energetic ninja running.' },
    { c: 'お', r: 'o', m: 'An Orbit around an asteroid.' },
    { c: 'か', r: 'ka', m: 'Looks like a blade cutting a Key.' },
    { c: 'き', r: 'ki', m: 'Looks like a traditional Key.' },
    { c: 'く', r: 'ku', m: 'Looks like a Cuckoo bird beak.' },
    { c: 'け', r: 'ke', m: 'Looks like a Keg of soda.' },
    { c: 'こ', r: 'ko', m: 'Two worms crawling side by side.' },
    { c: 'さ', r: 'sa', m: 'Looks like a Samurai sword.' },
    { c: 'し', r: 'shi', m: 'Looks like a Shepherds hook.' },
    { c: 'す', r: 'su', m: 'A spiral Swirl.' },
    { c: 'せ', r: 'se', m: 'Two people Sitting on a bench.' },
    { c: 'そ', r: 'so', m: 'Sewing a zigzag stitch.' },
    { c: 'た', r: 'ta', m: 'Spells the letters "ta".' },
    { c: 'ち', r: 'chi', m: 'A Cheerful cheerleader.' },
    { c: 'つ', r: 'tsu', m: 'A huge Tsunami wave.' },
    { c: 'て', r: 'te', m: 'A dog wagging its Tail.' },
    { c: 'と', r: 'to', m: 'A Thorn in a toe.' },
  ];

  for (const item of hiraL1) {
    await KanaEntry.findOneAndUpdate(
      { character: item.c, type: 'hiragana' },
      {
        $set: {
          romaji: item.r,
          mnemonic: item.m,
          lessonId: lessonDocs[1]._id,
        },
      },
      { upsert: true }
    );
  }

  // 2. Lesson 2: Hiragana Part 2 (N/H/M/Y/R/W rows & ん = 26 chars)
  const hiraL2 = [
    { c: 'な', r: 'na', m: 'A nun praying before a cross.' },
    { c: 'に', r: 'ni', m: 'A needle and thread.' },
    { c: 'ぬ', r: 'nu', m: 'Chopsticks grabbing noodles.' },
    { c: 'ね', r: 'ne', m: 'A cat playing with a net.' },
    { c: 'の', r: 'no', m: 'A No-smoking circle sign.' },
    { c: 'は', r: 'ha', m: 'The letter H with a lower loop.' },
    { c: 'ひ', r: 'hi', m: 'A big laughing mouth: He-he!' },
    { c: 'ふ', r: 'fu', m: 'Mt. Fuji with snow falling.' },
    { c: 'へ', r: 'he', m: 'A hill pointing to heaven.' },
    { c: 'ほ', r: 'ho', m: 'A house with a roof and fence.' },
    { c: 'ま', r: 'ma', m: 'A mast on a sailboat.' },
    { c: 'み', r: 'mi', m: 'Lucky number 21.' },
    { c: 'む', r: 'mu', m: 'A cow swinging its tail: Moo!' },
    { c: 'め', r: 'me', m: 'A bowl of tasty noodles.' },
    { c: 'も', r: 'mo', m: 'A fishhook catching more worms.' },
    { c: 'や', r: 'ya', m: 'A yak with horns.' },
    { c: 'ゆ', r: 'yu', m: 'A unique goldfish swimming.' },
    { c: 'よ', r: 'yo', m: 'A yo-yo dangling.' },
    { c: 'ら', r: 'ra', m: 'A rabbit sitting up.' },
    { c: 'り', r: 'ri', m: 'Two reeds growing in a river.' },
    { c: 'る', r: 'ru', m: 'A loop holding a pearl.' },
    { c: 'れ', r: 're', m: 'A runner leaning forward.' },
    { c: 'ろ', r: 'ro', m: 'A road turning corners.' },
    { c: 'わ', r: 'wa', m: 'A white swan on water.' },
    { c: 'を', r: 'wo', m: 'An Olympic skater with arms out.' },
    { c: 'ん', r: 'n', m: 'The cursive letter n.' },
  ];

  for (const item of hiraL2) {
    await KanaEntry.findOneAndUpdate(
      { character: item.c, type: 'hiragana' },
      {
        $set: {
          romaji: item.r,
          mnemonic: item.m,
          lessonId: lessonDocs[2]._id,
        },
      },
      { upsert: true }
    );
  }

  // 3. Lesson 3: Hiragana Part 3 (Dakuon, Handakuon, Yōon)
  const hiraL3 = [
    { c: 'が', r: 'ga', m: 'か with dakuten (tenten).' },
    { c: 'ぎ', r: 'gi', m: 'き with dakuten.' },
    { c: 'ぐ', r: 'gu', m: 'く with dakuten.' },
    { c: 'げ', r: 'ge', m: 'け with dakuten.' },
    { c: 'ご', r: 'go', m: 'こ with dakuten.' },
    { c: 'ざ', r: 'za', m: 'さ with dakuten.' },
    { c: 'じ', r: 'ji', m: 'し with dakuten.' },
    { c: 'ず', r: 'zu', m: 'す with dakuten.' },
    { c: 'ぜ', r: 'ze', m: 'せ with dakuten.' },
    { c: 'ぞ', r: 'zo', m: 'そ with dakuten.' },
    { c: 'だ', r: 'da', m: 'た with dakuten.' },
    { c: 'ぢ', r: 'ji', m: 'ち with dakuten.' },
    { c: 'づ', r: 'zu', m: 'つ with dakuten.' },
    { c: 'で', r: 'de', m: 'て with dakuten.' },
    { c: 'ど', r: 'do', m: 'と with dakuten.' },
    { c: 'ば', r: 'ba', m: 'は with dakuten.' },
    { c: 'び', r: 'bi', m: 'ひ with dakuten.' },
    { c: 'ぶ', r: 'bu', m: 'ふ with dakuten.' },
    { c: 'べ', r: 'be', m: 'へ with dakuten.' },
    { c: 'ぼ', r: 'bo', m: 'ほ with dakuten.' },
    { c: 'ぱ', r: 'pa', m: 'は with handakuten (maru).' },
    { c: 'ぴ', r: 'pi', m: 'ひ with handakuten.' },
    { c: 'ぷ', r: 'pu', m: 'ふ with handakuten.' },
    { c: 'ぺ', r: 'pe', m: 'へ with handakuten.' },
    { c: 'ぽ', r: 'po', m: 'ほ with handakuten.' },
  ];

  for (const item of hiraL3) {
    await KanaEntry.findOneAndUpdate(
      { character: item.c, type: 'hiragana' },
      {
        $set: {
          romaji: item.r,
          mnemonic: item.m,
          lessonId: lessonDocs[3]._id,
        },
      },
      { upsert: true }
    );
  }

  // 4. Lesson 4: Katakana Part 1 (Core 46 characters)
  const kataCore = [
    { c: 'ア', r: 'a', m: 'An axe blade corner.' },
    { c: 'イ', r: 'i', m: 'An eagle standing tall.' },
    { c: 'ウ', r: 'u', m: 'Under an umbrella.' },
    { c: 'エ', r: 'e', m: 'Elevator girder beams.' },
    { c: 'オ', r: 'o', m: 'An opera singer striking a pose.' },
    { c: 'カ', r: 'ka', m: 'Sharp corner of a card.' },
    { c: 'キ', r: 'ki', m: 'Key with sharp angles.' },
    { c: 'ク', r: 'ku', m: 'A chef cooking with a spatula.' },
    { c: 'ケ', r: 'ke', m: 'A kettle spout.' },
    { c: 'コ', r: 'ko', m: 'Two corner brackets.' },
    { c: 'サ', r: 'sa', m: 'Three small sticks.' },
    { c: 'シ', r: 'shi', m: 'Ship sails tilting downward.' },
    { c: 'ス', r: 'su', m: 'A hanger suspended.' },
    { c: 'セ', r: 'se', m: 'A set square.' },
    { c: 'ソ', r: 'so', m: 'A needle sewing down.' },
    { c: 'タ', r: 'ta', m: 'A kite in the wind.' },
    { c: 'チ', r: 'chi', m: 'A cheerleader waving.' },
    { c: 'ツ', r: 'tsu', m: 'Two eyes looking up.' },
    { c: 'テ', r: 'te', m: 'A television antenna.' },
    { c: 'ト', r: 'to', m: 'A sharp totem pole.' },
    { c: 'ナ', r: 'na', m: 'A sword and dagger.' },
    { c: 'ニ', r: 'ni', m: 'Two horizontal lines.' },
    { c: 'ヌ', r: 'nu', m: 'Chopsticks crossing.' },
    { c: 'ネ', r: 'ne', m: 'A neat tie.' },
    { c: 'ノ', r: 'no', m: 'A long nose slash.' },
    { c: 'ハ', r: 'ha', m: 'Under a thatched roof.' },
    { c: 'ヒ', r: 'hi', m: 'A hero cape.' },
    { c: 'フ', r: 'fu', m: 'An owl feather.' },
    { c: 'ヘ', r: 'he', m: 'A pointed hill.' },
    { c: 'ホ', r: 'ho', m: 'A holy cross.' },
    { c: 'マ', r: 'ma', m: 'A wine glass.' },
    { c: 'ミ', r: 'mi', m: 'Three musical strings.' },
    { c: 'ム', r: 'mu', m: 'A triangle roof.' },
    { c: 'メ', r: 'me', m: 'Two crossed sabers.' },
    { c: 'モ', r: 'mo', m: 'A modern ladder.' },
    { c: 'ヤ', r: 'ya', m: 'A yak horn.' },
    { c: 'ユ', r: 'yu', m: 'A fishhook.' },
    { c: 'ヨ', r: 'yo', m: 'A shelf bracket.' },
    { c: 'ラ', r: 'ra', m: 'A lantern top.' },
    { c: 'リ', r: 'ri', m: 'Two straight ribbons.' },
    { c: 'ル', r: 'ru', m: 'Roots branching down.' },
    { c: 'レ', r: 're', m: 'A right-angle corner.' },
    { c: 'ロ', r: 'ro', m: 'A square road block.' },
    { c: 'ワ', r: 'wa', m: 'A wine glass silhouette.' },
    { c: 'ヲ', r: 'wo', m: 'A wolf paw.' },
    { c: 'ン', r: 'n', m: 'An arrow shooting up.' },
  ];

  for (const item of kataCore) {
    await KanaEntry.findOneAndUpdate(
      { character: item.c, type: 'katakana' },
      {
        $set: {
          romaji: item.r,
          mnemonic: item.m,
          lessonId: lessonDocs[4]._id,
        },
      },
      { upsert: true }
    );
  }

  // 5. Lesson 5: Katakana Part 2 (Modern loanword combinations)
  const kataCombos = [
    { c: 'ファ', r: 'fa', m: 'フ + small ァ for foreign "fa"' },
    { c: 'フィ', r: 'fi', m: 'フ + small ィ for foreign "fi"' },
    { c: 'フェ', r: 'fe', m: 'フ + small ェ for foreign "fe"' },
    { c: 'フォ', r: 'fo', m: 'フ + small ォ for foreign "fo"' },
    { c: 'ティ', r: 'ti', m: 'テ + small ィ for foreign "ti"' },
    { c: 'ディ', r: 'di', m: 'デ + small ィ for foreign "di"' },
    { c: 'ウィ', r: 'wi', m: 'ウ + small ィ for foreign "wi"' },
    { c: 'ウェ', r: 'we', m: 'ウ + small ェ for foreign "we"' },
    { c: 'ウォ', r: 'wo', m: 'ウ + small ォ for foreign "wo"' },
    { c: 'チェ', r: 'che', m: 'チ + small ェ for foreign "che"' },
    { c: 'シェ', r: 'she', m: 'シ + small ェ for foreign "she"' },
    { c: 'ジェ', r: 'je', m: 'ジ + small ェ for foreign "je"' },
  ];

  for (const item of kataCombos) {
    await KanaEntry.findOneAndUpdate(
      { character: item.c, type: 'katakana' },
      {
        $set: {
          romaji: item.r,
          mnemonic: item.m,
          lessonId: lessonDocs[5]._id,
        },
      },
      { upsert: true }
    );
  }

  // 6. Lesson 6: Kanji Fundamentals (Introductory foundational characters)
  const introKanji = [
    { char: '一', uni: '4E00', on: ['イチ', 'イツ'], kun: ['ひと', 'ひと.つ'], m: ['one'], strokes: 1, grade: 1 },
    { char: '二', uni: '4E8C', on: ['ニ', 'ジ'], kun: ['ふた', 'ふた.つ'], m: ['two'], strokes: 2, grade: 1 },
    { char: '三', uni: '4E09', on: ['サン'], kun: ['み', 'み.つ', 'みっ.つ'], m: ['three'], strokes: 3, grade: 1 },
    { char: '日', uni: '65E5', on: ['ニチ', 'ジツ'], kun: ['ひ', '-び', '-か'], m: ['day', 'sun', 'Japan'], strokes: 4, grade: 1 },
    { char: '月', uni: '6708', on: ['ゲツ', 'ガツ'], kun: ['つき'], m: ['month', 'moon'], strokes: 4, grade: 1 },
    { char: '木', uni: '6728', on: ['ボク', 'モク'], kun: ['き', 'こ-'], m: ['tree', 'wood'], strokes: 4, grade: 1 },
    { char: '山', uni: '5C71', on: ['サン', 'セン'], kun: ['やま'], m: ['mountain'], strokes: 3, grade: 1 },
    { char: '川', uni: '5DDD', on: ['セン'], kun: ['かわ'], m: ['river', 'stream'], strokes: 3, grade: 1 },
    { char: '人', uni: '4EBA', on: ['ジン', 'ニン'], kun: ['ひと', '-り', '-と'], m: ['person'], strokes: 2, grade: 1 },
    { char: '口', uni: '53E3', on: ['コウ', 'ク'], kun: ['くち'], m: ['mouth'], strokes: 3, grade: 1 },
  ];

  for (const k of introKanji) {
    await KanjiEntry.findOneAndUpdate(
      { character: k.char },
      {
        $set: {
          unicode: k.uni,
          onyomi: k.on,
          kunyomi: k.kun,
          meanings: k.m,
          strokeCount: k.strokes,
          grade: k.grade,
          lessonId: lessonDocs[6]._id,
          jlptLevel: 'N5',
        },
      },
      { upsert: true }
    );
  }

  console.log('✓ Unit 0 writing systems seeded successfully.');
}

async function seedUnit1(lessonDocs) {
  console.log('Seeding Unit 1: Lessons 7, 8, 9, 10...');

  // ----------------------------------------------------
  // LESSON 7: Everyday Courtesy & Social Formulas (Reference Lesson)
  // ----------------------------------------------------
  const l7Grammar = await GrammarPoint.findOneAndUpdate(
    { lessonId: lessonDocs[7]._id, order: 1 },
    {
      $set: {
        categoryType: 'expression',
        title: 'Expression 1: Social Greetings & Courtesy Formulas',
        pattern: 'Greeting Formulas (あいさつと日常の表現)',
        formation: 'Fixed situational conversational formulas (Time / Hierarchy / Context)',
        courseLevel: 'N5 Foundation',
        politenessLevel: 'Polite (丁寧語) & Casual (普通体)',
        literalMeaning: 'Situational social acknowledgments & reciprocal goodwill',
        naturalMeaning: 'Everyday greetings, apologies, and classroom phrases',
        whyItIsUsed: 'Japanese greetings are situational formulas reflecting the time of day, social distance, and relative hierarchy. Unlike literal questions in English ("How are you?"), Japanese formulas acknowledge social presence and mutual goodwill. Using appropriate politeness levels establishes harmonious interpersonal relationships from day one.',
        wordBreakdown: [
          { japanese: 'おはよう', reading: 'おはよう', romaji: 'ohayou', literal: 'Early (casual)', role: 'Informal root' },
          { japanese: 'ございます', reading: 'ございます', romaji: 'gozaimasu', literal: 'Polite existence', role: 'Polite honorific' },
          { japanese: 'ありがとう', reading: 'ありがとう', romaji: 'arigatou', literal: 'Rare / precious', role: 'Gratitude root' },
          { japanese: 'すみません', reading: 'すみません', romaji: 'sumimasen', literal: 'Cannot be settled', role: 'Polite acknowledgment of indebtedness' },
        ],
        explanation: 'Japanese social greetings (あいさつ) are fixed cultural formulas that establish the tone of an interaction.\n\n1. Hierarchy and Register: Politeness is morphological. Casual forms like おはよう and ありがとう are strictly for family and close peers. Adding ございます or です introduces polite social distance necessary with teachers, elders, and colleagues.\n\n2. Situational Formulas: Greetings are tailored to specific daily thresholds: waking hours (おはようございます), daytime (こんにちは), evening (こんばんは), and leave-taking (じゃあ、また / 失礼します).\n\n3. Functional Indebtedness: Phrases like すみません and よろしくお願いします reflect Japanese cultural values of mutual consideration (気遣い - kizukai) and acknowledging social effort.',
        usage: 'Use standard polite formulas (おはようございます, ありがとうございます, すみません) with teachers, coworkers, and in shops.',
        whenToUse: 'Use immediately upon encountering someone, entering a room, receiving assistance, or parting.',
        whenNotToUse: 'Do not use casual greetings (おはよう, ありがとう) with superiors, teachers, or customers.',
        nuance: 'さようなら carries a sense of finality ("farewell for a long time"). In daily classroom or workplace departures, use じゃあ、また (casual) or 失礼します (polite).',
        beginnerTip: 'Whenever in doubt about politeness, always default to the longer form (おはようございます, ありがとうございます).',
        commonMistakes: [
          { incorrect: 'さようなら (to colleagues at end of day)', correct: 'お疲れ様でした / 失礼します', explanation: 'さようなら implies long-term or permanent farewell. In daily classroom or workplace departures, use じゃあまた (casual) or 失礼します (polite).' },
          { incorrect: 'Using おはよう with a teacher', correct: 'おはようございます', explanation: 'Dropping ございます with an instructor sounds overly informal and disrespectful.' },
        ],
        comparison: {
          target: 'Polite vs. Casual Courtesy Formulas',
          comparisonPoints: [
            { label: 'Morning Greeting', itemA: 'おはよう (Casual: friends & family)', itemB: 'おはようございます (Polite: teachers & seniors)', explanation: 'Adding ございます creates respectful social distance.' },
            { label: 'Gratitude', itemA: 'ありがとう (Casual: close peers)', itemB: 'ありがとうございます (Polite: standard courtesy)', explanation: 'Using casual ありがとう with a teacher or clerk sounds overly familiar.' },
            { label: 'Farewell', itemA: 'じゃあ、また (Daily: "See you")', itemB: 'さようなら (Definitive: "Farewell")', explanation: 'さようなら implies an extended or permanent parting.' },
          ],
        },
        notes: 'おはようございます is formal; おはよう is casual with peers and family.',
        caution: 'さようなら implies a long-term or definitive parting; use じゃあまた for daily casual farewells.',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l7Vocab = [
    { kanji: 'おはよう', kana: 'おはよう', romaji: 'ohayou', meanings: ['Good morning (casual)'], naturalMeaning: 'Good morning', literalMeaning: 'It is early (お早う)', register: 'Casual (peers & family)', nuance: 'Used with friends, classmates, and family members in the morning before noon.', commonMistakes: 'Never use with teachers, managers, or customers; use おはようございます instead.', pos: ['interjection'], seq: 1000100 },
    { kanji: 'おはようございます', kana: 'おはようございます', romaji: 'ohayou gozaimasu', meanings: ['Good morning (polite)'], naturalMeaning: 'Good morning', literalMeaning: 'It is honorably early', register: 'Polite (formal & respect)', nuance: 'Standard polite morning greeting required for teachers, bosses, colleagues, and elders.', pos: ['expression'], seq: 1000110 },
    { kanji: 'こんにちは', kana: 'こんにちは', romaji: 'konnichiwa', meanings: ['Hello', 'Good afternoon'], naturalMeaning: 'Hello / Good afternoon', literalMeaning: 'As for today... (今日は)', register: 'General / Neutral', nuance: 'Used from midday until dusk. Written with final character は (pronounced "wa") because it originated as a sentence topic particle.', pos: ['expression'], seq: 1000120 },
    { kanji: 'こんばんは', kana: 'こんばんは', romaji: 'konbanwa', meanings: ['Good evening'], naturalMeaning: 'Good evening', literalMeaning: 'As for this evening... (今晩は)', register: 'General / Neutral', nuance: 'Used after dark when meeting someone. Also written with particle は pronounced "wa".', pos: ['expression'], seq: 1000130 },
    { kanji: 'さようなら', kana: 'さようなら', romaji: 'sayounara', meanings: ['Goodbye', 'Farewell'], naturalMeaning: 'Goodbye / Farewell', literalMeaning: 'If that is how it must be... (然様なら)', register: 'Formal / Definitive', nuance: 'Implies a long-term or permanent parting. For everyday school departures, native speakers prefer じゃあ、また or 失礼します.', pos: ['expression'], seq: 1000140 },
    { kanji: 'じゃあ、また', kana: 'じゃあ、また', romaji: 'jaa, mata', meanings: ['See you later'], naturalMeaning: 'See you later / Bye', literalMeaning: 'Well then, again', register: 'Casual', nuance: 'Natural, friendly farewell for classmates, close peers, and friends.', pos: ['expression'], seq: 1000150 },
    { kanji: 'ありがとう', kana: 'ありがとう', romaji: 'arigatou', meanings: ['Thank you (casual)'], naturalMeaning: 'Thanks / Thank you', literalMeaning: 'It is rare / hard to exist (有難う)', register: 'Casual', nuance: 'Friendly expression of gratitude for friends and family.', pos: ['expression'], seq: 1000160 },
    { kanji: 'ありがとうございます', kana: 'ありがとうございます', romaji: 'arigatou gozaimasu', meanings: ['Thank you very much (polite)'], naturalMeaning: 'Thank you very much', literalMeaning: 'It is exceedingly rare and precious', register: 'Polite / Formal', nuance: 'Standard polite gratitude formula used with teachers, strangers, and service staff.', pos: ['expression'], seq: 1000170 },
    { kanji: 'すみません', kana: 'すみません', romaji: 'sumimasen', meanings: ['Excuse me', 'I am sorry', 'Thank you (for trouble)'], naturalMeaning: 'Excuse me / I am sorry', literalMeaning: 'It cannot be completed / settled (済まない)', register: 'General / Polite', nuance: 'Triple-purpose formula: 1) Getting attention in public, 2) Apologizing for a minor bump/inconvenience, 3) Approaching politely before asking for directions or a favor.', pos: ['expression'], seq: 1000180 },
    { kanji: 'はい', kana: 'はい', romaji: 'hai', meanings: ['Yes', 'Okay', 'That is right', 'Present (roll call)'], naturalMeaning: 'Yes / Okay / Present', literalMeaning: 'Affirmative acknowledgment', register: 'Standard / Polite', nuance: 'In classrooms, functions as the standard response when the teacher calls roll ("Present!"). In conversation, also acts as aizuchi (listener feedback) signaling "I am listening".', pos: ['interjection'], seq: 1000190 },
    { kanji: 'いいえ', kana: 'いいえ', romaji: 'iie', meanings: ['No', 'Not at all', 'You are welcome'], naturalMeaning: 'No / Not at all', literalMeaning: 'Negative denial', register: 'Standard / Polite', nuance: 'Direct negative answer. In response to thanks or compliments, contextually means "Not at all / Do not mention it" as a modest brush-off.', pos: ['interjection'], seq: 1000200 },
    { kanji: 'お願いします', kana: 'おねがいします', romaji: 'onegaishimasu', meanings: ['Please (requesting)', 'I ask of you'], naturalMeaning: 'Please / I request this', literalMeaning: 'I make a humble wish/request (お＋願い＋します)', register: 'Polite', nuance: 'Used when requesting an item (お水をお願いします) or asking someone to perform a task or service for you.', kanjiNotes: 'Contains N3 kanji 願, but this phrase is core N5 beginner everyday courtesy vocabulary.', pos: ['expression'], seq: 1000210 },
    { kanji: '初めまして', kana: 'はじめまして', romaji: 'hajimemashite', meanings: ['Nice to meet you (first time)'], naturalMeaning: 'How do you do? / Nice to meet you', literalMeaning: 'For the very first time (from 始める / 初めて)', register: 'Polite', nuance: 'Strictly used ONLY when meeting someone for the first time in your life. Never use it with someone you have encountered before.', pos: ['expression'], seq: 1000220 },
    { kanji: 'よろしくお願いします', kana: 'よろしくおねがいします', romaji: 'yoroshiku onegaishimasu', meanings: ['Nice to meet you', 'I look forward to working with you', 'Please treat me well'], naturalMeaning: 'I look forward to working with you / Nice to meet you', literalMeaning: 'I ask for your goodwill and favorable treatment', register: 'Polite / Formal', nuance: 'Indispensable reciprocal social formula. Spoken after 初めまして when introducing yourself, at the start of collaborative projects, or at the end of business emails.', kanjiNotes: 'Contains N3 kanji 願 in お願いします.', pos: ['expression'], seq: 1000230 },
    { kanji: '先生', kana: 'せんせい', romaji: 'sensei', meanings: ['teacher', 'instructor', 'professor', 'doctor'], naturalMeaning: 'Teacher / Professor', literalMeaning: 'Born before (先 = before, 生 = life/birth)', register: 'Respectful / Polite', nuance: 'Honorific title used when addressing instructors, professors, and medical doctors.', pos: ['noun'], seq: 1381330 },
    { kanji: '失礼します', kana: 'しつれいします', romaji: 'shitsurei shimasu', meanings: ['Excuse me (entering/leaving)', 'Goodbye (polite)'], naturalMeaning: 'Excuse me / Goodbye (polite)', literalMeaning: 'I am committing a rudeness / impoliteness (失礼)', register: 'Polite / Formal', nuance: 'Essential phrase used when entering or leaving a teacher’s office, stepping out of a meeting room, or hanging up a formal phone call.', pos: ['expression'], seq: 1307130 },
  ];

  const l7VocabDocs = [];
  for (const v of l7Vocab) {
    const doc = await VocabEntry.findOneAndUpdate(
      { kana: v.kana, lessonId: lessonDocs[7]._id },
      {
        $set: {
          kanji: v.kanji,
          meanings: v.meanings,
          partOfSpeech: v.pos,
          jmdictSeq: v.seq,
          romaji: v.romaji,
          naturalMeaning: v.naturalMeaning,
          literalMeaning: v.literalMeaning,
          register: v.register,
          nuance: v.nuance,
          commonMistakes: v.commonMistakes,
          kanjiNotes: v.kanjiNotes,
          thematicCategory: 'greetings',
          jlptLevel: 'N5',
          courseLevel: 'N5 Foundation',
        },
      },
      { upsert: true, new: true }
    );
    l7VocabDocs.push(doc);
  }

  const s1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 10101 },
    {
      $set: {
        japanese: '田中先生、おはようございます。',
        furigana: 'たなかせんせい、おはようございます。',
        romaji: 'Tanaka-sensei, ohayou gozaimasu.',
        english: 'Good morning, Professor Tanaka.',
        naturalEnglish: 'Good morning, Professor Tanaka.',
        breakdown: [
          { japanese: '田中先生', reading: 'たなかせんせい', romaji: 'Tanaka-sensei', english: 'Professor Tanaka', role: 'Addressee' },
          { japanese: 'おはようございます', reading: 'おはようございます', romaji: 'ohayou gozaimasu', english: 'good morning (polite)', role: 'Polite greeting' },
        ],
        grammarNote: 'Always use the polite ございます form when greeting teachers, superiors, or seniors.',
        relatedGrammarId: l7Grammar._id,
        relatedVocabIds: [l7VocabDocs[1]._id, l7VocabDocs[14]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 10102 },
    {
      $set: {
        japanese: 'すみません、駅はどこですか。',
        furigana: 'すみません、えきは どこですか。',
        romaji: 'Sumimasen, eki wa doko desu ka.',
        english: 'Excuse me, where is the station?',
        naturalEnglish: 'Excuse me, where is the station?',
        breakdown: [
          { japanese: 'すみません', reading: 'すみません', romaji: 'sumimasen', english: 'excuse me', role: 'Polite approach' },
          { japanese: '駅', reading: 'えき', romaji: 'eki', english: 'station', role: 'Topic noun' },
          { japanese: 'は', reading: 'わ', romaji: 'wa', english: 'as for', role: 'Topic particle' },
          { japanese: 'どこ', reading: 'どこ', romaji: 'doko', english: 'where', role: 'Interrogative pronoun' },
          { japanese: 'ですか', reading: 'ですか', romaji: 'desu ka', english: 'is it?', role: 'Polite question predicate' },
        ],
        grammarNote: 'すみません politely cushions your presence before asking a stranger for directions.',
        relatedGrammarId: l7Grammar._id,
        relatedVocabIds: [l7VocabDocs[8]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s3 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 10103 },
    {
      $set: {
        japanese: '初めまして、スミスです。よろしくお願いします。',
        furigana: 'はじめまして、スミスです。よろしく おねがいします。',
        romaji: 'Hajimemashite, Sumisu desu. Yoroshiku onegaishimasu.',
        english: 'Nice to meet you, I am Smith. I look forward to working with you.',
        naturalEnglish: 'Nice to meet you, I am Smith. I look forward to working with you.',
        breakdown: [
          { japanese: '初めまして', reading: 'はじめまして', romaji: 'hajimemashite', english: 'nice to meet you (first time)', role: 'Self-introduction opener' },
          { japanese: 'スミスです', reading: 'スミスです', romaji: 'Sumisu desu', english: 'I am Smith', role: 'Identity predicate' },
          { japanese: 'よろしくお願いします', reading: 'よろしくおねがいします', romaji: 'yoroshiku onegaishimasu', english: 'please treat me favorably', role: 'Closing goodwill formula' },
        ],
        grammarNote: 'The standard self-introduction tripartite formula: Opening (初めまして) + Name (〜です) + Closing (よろしくお願いします).',
        relatedGrammarId: l7Grammar._id,
        relatedVocabIds: [l7VocabDocs[12]._id, l7VocabDocs[13]._id],
      },
    },
    { upsert: true, new: true }
  );

  await GrammarPoint.findByIdAndUpdate(l7Grammar._id, {
    $set: { exampleSentenceIds: [s1._id, s2._id, s3._id] },
  });

  // ----------------------------------------------------
  // LESSON 8: Identity & The Topic Marker (だ / です, は, か)
  // ----------------------------------------------------
  const l8g1 = await GrammarPoint.findOneAndUpdate(
    { lessonId: lessonDocs[8]._id, order: 1 },
    {
      $set: {
        categoryType: 'structure',
        title: 'State of Being (だ / です)',
        pattern: '[Noun] + です / ではありません',
        formation: 'Affirmative: Noun + です. Formal Negative: Noun + ではありません. Spoken Negative: Noun + じゃありません.',
        courseLevel: 'N5 Foundation',
        politenessLevel: 'Polite (です) vs. Plain/Casual (だ)',
        literalMeaning: 'State of being / Identity declaration',
        naturalMeaning: 'am / is / are (identity or state)',
        whyItIsUsed: 'Unlike English, Japanese has no true equational verb like "to be" that changes with person (am/is/are). Instead, Japanese sentences declare a state of being at the end of the sentence. Adding です (polite) or だ (casual) completes the grammatical thought and establishes your social relationship with the listener.',
        wordBreakdown: [
          { japanese: '私', reading: 'わたし', romaji: 'watashi', literal: 'I / me', role: 'Speaker pronoun' },
          { japanese: 'は', reading: 'わ', romaji: 'wa', literal: 'As for', role: 'Topic marker' },
          { japanese: '学生', reading: 'がくせい', romaji: 'gakusei', literal: 'Student', role: 'Noun predicate' },
          { japanese: 'です', reading: 'です', romaji: 'desu', literal: 'is / am (polite)', role: 'Formal copula' },
        ],
        explanation: 'Declares what an entity is or is not. Unlike the English verb "to be", です indicates non-past state of being and establishes polite conversational courtesy.\n\n1. Affirmative Identity: [Noun] + です declares identity with standard politeness.\n2. Formal Negation: [Noun] + ではありません ("is not / am not") is standard in writing, formal speeches, and business.\n3. Conversational Negation: In daily conversation, では contracts to じゃ: [Noun] + じゃありません.',
        usage: 'Use です with teachers, coworkers, and acquaintances. Use ではありません in formal contexts.',
        whenToUse: 'Use to state your profession, nationality, identity, or current condition.',
        whenNotToUse: 'Do not attach です directly after い-adjective roots without understanding inflection (e.g. 高いです is polite present, but 高ではありません is ungrammatical; adjectives negate with 〜くない).',
        nuance: 'です conveys respect and neutrality without emotional distance. Casual conversations replace です with だ.',
        beginnerTip: 'Think of です as a courtesy cushion placed at the end of the sentence rather than just the word "is".',
        commonMistakes: [
          { incorrect: '私は学生だです。', correct: '私は学生です。 / 私は学生だ。', explanation: 'だ and です both express state-of-being; they must NEVER be stacked together. Use です for polite speech and だ for casual speech.' },
          { incorrect: '学生ですではありません。', correct: '学生ではありません。', explanation: 'To negate a noun, replace です with ではありません (formal) or じゃありません (conversational). Do not keep です!' },
        ],
        comparison: {
          target: 'Polite (です) vs. Plain (だ) vs. Negation',
          comparisonPoints: [
            { label: 'Affirmative State', itemA: '学生です (Polite: standard courtesy)', itemB: '学生だ (Plain: casual with peers)', explanation: 'です establishes social distance and respect; だ is used with close friends or in inner thoughts.' },
            { label: 'Negative State', itemA: '学生ではありません (Formal / Written)', itemB: '学生じゃありません (Conversational / Spoken)', explanation: 'ではありません is standard in business; では contracts to じゃ in daily dialogue.' },
          ],
        },
        notes: 'ではありません is formal and standard in writing, speeches, and polite business settings. じゃありません is everyday conversational speech.',
        caution: 'Do not use です directly after an い-adjective stem alone (e.g. 高いです is polite, but 高ではありません is ungrammatical; adjectives negate with 〜くない).',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l8g2 = await GrammarPoint.findOneAndUpdate(
    { lessonId: lessonDocs[8]._id, order: 2 },
    {
      $set: {
        categoryType: 'grammar',
        title: 'The Topic Marker Particle (は - wa)',
        pattern: '[Topic] + は',
        formation: 'Noun + は (written with the character は, pronounced "wa")',
        courseLevel: 'N5 Foundation',
        literalMeaning: 'As for [Topic]...',
        naturalMeaning: 'Speaking of [Topic]... (marks the sentence theme)',
        whyItIsUsed: 'Japanese communication prioritizes establishing a shared psychological frame before providing new information. Particle は acts like a spotlight announcing: "Regarding X, let me tell you about it for the rest of this sentence." Contrast this with grammatical subjects: topic は marks what the conversation is about, not necessarily who is performing the physical verb.',
        wordBreakdown: [
          { japanese: '私', reading: 'わたし', romaji: 'watashi', literal: 'I', role: 'Topic entity' },
          { japanese: 'は', reading: 'わ', romaji: 'wa', literal: 'as for', role: 'Topic particle' },
          { japanese: '学生です', reading: 'がくせいです', romaji: 'gakusei desu', literal: 'am student', role: 'Comment / Predicate' },
        ],
        explanation: 'Establishes the conversational theme or frame of reference: "Speaking of [Topic]..." or "As for [Topic]...". Once introduced with は, the topic remains the understood context for subsequent remarks until changed.\n\nDeep Distinction: Topic vs. Subject:\n• は introduces the theme ("As for me...") and the main focus of information is on what follows (the comment).\n• が marks the specific grammatical subject ("I am the one...") and the focus is on the subject itself.',
        usage: 'Use は when introducing who or what you are discussing, or when making a contrast between two known things.',
        whenToUse: 'Use to establish the overarching subject/theme of your discourse.',
        whenNotToUse: 'Do not confuse topic marker は with the English subject verb "is" — は does not mean "is", it simply tags the topic.',
        nuance: 'Remember: particle は is always written with the hiragana character は (ha), but always pronounced as "wa" when acting as a grammatical particle.',
        beginnerTip: 'Read 私は as "Speaking of me..." or "As for me...". This prevents you from mistranslating は as "is".',
        commonMistakes: [
          { incorrect: 'Translating は as the English verb "is"', correct: 'は is a particle marking the topic frame, not a verb.', explanation: 'In 私は学生です, the state of being is expressed by です, not は.' },
          { incorrect: 'Pronouncing topic は as "ha"', correct: 'Pronounce as "wa"', explanation: 'When written as a grammatical particle, the character は is always pronounced "wa".' },
        ],
        comparison: {
          target: 'Topic (は) vs. Subject (が)',
          comparisonPoints: [
            { label: 'Core Function', itemA: '私は学生です (Topic は: "As for me, I am a student")', itemB: '私が学生です (Subject が: "I am the one who is a student")', explanation: 'With は, emphasis is on the predicate (学生です). With が, emphasis is on the subject (私), identifying the student.' },
            { label: 'Conversational Role', itemA: 'Answers: "What do you do?"', itemB: 'Answers: "Who among you is the student?"', explanation: 'が performs exhaustive identification (answers "who/which one"), while は provides a theme for description.' },
          ],
        },
        notes: 'Remember: particle は is always written with the hiragana character は (ha), but always pronounced as "wa" when acting as a grammatical particle.',
        caution: 'Do not confuse topic marker は with the English subject "is" — は does not mean "is", it simply tags the topic.',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l8g3 = await GrammarPoint.findOneAndUpdate(
    { lessonId: lessonDocs[8]._id, order: 3 },
    {
      $set: {
        categoryType: 'grammar',
        title: 'Question Particle (か)',
        pattern: '[Sentence] + か',
        formation: 'Polite sentence ending + か (e.g. ですか / ますか)',
        courseLevel: 'N5 Foundation',
        literalMeaning: 'Question marker (verbal "?")',
        naturalMeaning: 'Turns statement into a question',
        whyItIsUsed: 'English questions invert word order or require auxiliary helping verbs ("You are a student" → "Are you a student?"). Japanese preserves the exact same grammatical word order and simply appends particle か to the end of the sentence, acting as an audible spoken question mark.',
        wordBreakdown: [
          { japanese: '学生', reading: 'がくせい', romaji: 'gakusei', literal: 'student', role: 'Noun' },
          { japanese: 'です', reading: 'です', romaji: 'desu', literal: 'is / am', role: 'Copula' },
          { japanese: 'か', reading: 'か', romaji: 'ka', literal: '?', role: 'Question particle' },
        ],
        explanation: 'Turns any declarative statement into an inquiry without inverting word order or requiring auxiliary helping verbs. It effectively functions as a spoken audible question mark.\n\nIn standard formal Japanese, questions end with a period (。) followed by か, though modern informal writing often adds a question mark (？).',
        usage: 'Attach to です or ます with rising intonation to ask polite questions.',
        whenToUse: 'Use at the end of sentences when seeking information, confirmation, or clarification.',
        whenNotToUse: 'In casual speech between close peers, drop か and use rising intonation directly (e.g. 学生？ instead of 学生だか).',
        nuance: 'Adding か to casual だ (だか) sounds harsh or blunt; peers ask questions with rising intonation alone.',
        beginnerTip: 'Japanese word order never changes when forming questions — just add か at the end!',
        commonMistakes: [
          { incorrect: '学生だか？ (in casual speech)', correct: '学生？ (with rising intonation)', explanation: 'In casual speech, do not add か after だ. Simply say the noun with rising intonation.' },
        ],
        comparison: {
          target: 'Polite Question vs. Casual Question',
          comparisonPoints: [
            { label: 'Polite Register', itemA: '学生ですか。 (Standard polite question)', itemB: '学生？ (Casual question with rising tone)', explanation: 'Polite questions take ですか; casual speech drops です and か completely.' },
          ],
        },
        notes: 'In standard formal Japanese, questions end with a period (。) followed by か, though modern informal writing often adds a question mark (？).',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l8Vocab = [
    { kanji: '私', kana: 'わたし', meanings: ['I', 'me'], pos: ['pronoun'], seq: 1587310 },
    { kanji: 'あなた', kana: 'あなた', meanings: ['you'], pos: ['pronoun'], seq: 1000840 },
    { kanji: '彼', kana: 'かれ', meanings: ['he', 'boyfriend'], pos: ['pronoun'], seq: 1475710 },
    { kanji: '彼女', kana: 'かのじょ', meanings: ['she', 'girlfriend'], pos: ['pronoun'], seq: 1475750 },
    { kanji: '学生', kana: 'がくせい', meanings: ['student'], pos: ['noun'], seq: 1205370 },
    { kanji: '先生', kana: 'せんせい', meanings: ['teacher', 'professor', 'doctor'], pos: ['noun'], seq: 1381330 },
    { kanji: '会社員', kana: 'かいしゃいん', meanings: ['company employee', 'office worker'], pos: ['noun'], seq: 1201530 },
    { kanji: '日本人', kana: 'にほんじん', meanings: ['Japanese person'], pos: ['noun'], seq: 1459460 },
    { kanji: 'アメリカ人', kana: 'あめりかじん', meanings: ['American person'], pos: ['noun'], seq: 1018900 },
    { kanji: '友達', kana: 'ともだち', meanings: ['friend'], pos: ['noun'], seq: 1476020 },
    { kanji: '誰', kana: 'だれ', meanings: ['who'], pos: ['pronoun'], seq: 1008080 },
    { kanji: '何', kana: 'なに', meanings: ['what'], pos: ['pronoun'], seq: 1195610 },
    { kanji: '名前', kana: 'なまえ', meanings: ['name', 'full name'], pos: ['noun'], seq: 1530260 },
  ];

  const l8VocabDocs = [];
  for (const v of l8Vocab) {
    const doc = await VocabEntry.findOneAndUpdate(
      { kana: v.kana, lessonId: lessonDocs[8]._id },
      {
        $set: {
          kanji: v.kanji,
          meanings: v.meanings,
          partOfSpeech: v.pos,
          jmdictSeq: v.seq,
          thematicCategory: 'people',
          jlptLevel: 'N5',
        },
      },
      { upsert: true, new: true }
    );
    l8VocabDocs.push(doc);
  }

  // L8.1 Examples: Affirmative です AND Formal Negative ではありません
  const s81_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 10201 },
    {
      $set: {
        japanese: '私は学生です。',
        furigana: 'わたしは がくせいです。',
        english: 'I am a student.',
        relatedGrammarId: l8g1._id,
        relatedVocabIds: [l8VocabDocs[0]._id, l8VocabDocs[4]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s81_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 10202 },
    {
      $set: {
        japanese: 'スミスさんは日本人ではありません。',
        furigana: 'スミスさんは にほんじんでは ありません。',
        english: 'Mr. Smith is not Japanese.',
        relatedGrammarId: l8g1._id,
        relatedVocabIds: [l8VocabDocs[7]._id],
      },
    },
    { upsert: true, new: true }
  );

  // L8.2 Examples: Topic Marker は
  const s82_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 10203 },
    {
      $set: {
        japanese: '田中さんは先生です。',
        furigana: 'たなかさんは せんせいです。',
        english: 'As for Mr. Tanaka, he is a teacher.',
        relatedGrammarId: l8g2._id,
        relatedVocabIds: [l8VocabDocs[5]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s82_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 10204 },
    {
      $set: {
        japanese: '彼は会社員です。',
        furigana: 'かれは かいしゃいんです。',
        english: 'As for him, he is a company employee.',
        relatedGrammarId: l8g2._id,
        relatedVocabIds: [l8VocabDocs[2]._id, l8VocabDocs[6]._id],
      },
    },
    { upsert: true, new: true }
  );

  // L8.3 Examples: Question Particle か
  const s83_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 10205 },
    {
      $set: {
        japanese: '田中さんは先生ですか。',
        furigana: 'たなかさんは せんせいですか。',
        english: 'Is Mr. Tanaka a teacher?',
        relatedGrammarId: l8g3._id,
        relatedVocabIds: [l8VocabDocs[5]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s83_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 10206 },
    {
      $set: {
        japanese: 'お名前は何ですか。',
        furigana: 'おなまえは なんですか。',
        english: 'What is your name?',
        relatedGrammarId: l8g3._id,
        relatedVocabIds: [l8VocabDocs[11]._id, l8VocabDocs[12]._id],
      },
    },
    { upsert: true, new: true }
  );

  await GrammarPoint.findByIdAndUpdate(l8g1._id, { $set: { exampleSentenceIds: [s81_1._id, s81_2._id] } });
  await GrammarPoint.findByIdAndUpdate(l8g2._id, { $set: { exampleSentenceIds: [s82_1._id, s82_2._id] } });
  await GrammarPoint.findByIdAndUpdate(l8g3._id, { $set: { exampleSentenceIds: [s83_1._id, s83_2._id] } });

  // ----------------------------------------------------
  // LESSON 9: Demonstratives & Subject Marker (これ/それ/あれ, が vs は)
  // ----------------------------------------------------
  const l9g1 = await GrammarPoint.findOneAndUpdate(
    { lessonId: lessonDocs[9]._id, order: 1 },
    {
      $set: {
        title: 'Demonstrative Pronouns (これ・それ・あれ・どれ)',
        pattern: 'これ / それ / あれ / どれ + は',
        formation: 'Demonstrative Pronoun + は / が',
        explanation: 'Distance-based spatial pointers (the Ko-So-A-Do system) that stand alone as independent noun replacements: これ refers to an object close to the speaker ("this one"); それ refers to an object near the listener ("that one"); あれ refers to an object far from both speaker and listener ("that one over there"); and どれ asks "which one?" among three or more items.',
        notes: 'Because they are pronouns, they stand completely on their own without needing an attached noun.',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l9g2 = await GrammarPoint.findOneAndUpdate(
    { lessonId: lessonDocs[9]._id, order: 2 },
    {
      $set: {
        title: 'Demonstrative Adjectives (この・その・あの・どの)',
        pattern: 'この / その / あの / どの + [Noun]',
        formation: 'Demonstrative Adjective + Noun (never used alone)',
        explanation: 'Must directly precede and modify a specific noun: この本 (this book near me), その傘 (that umbrella near you), あの車 (that car over there), どの鍵 (which key?). They cannot stand independently as standalone subjects or objects.',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l9g3 = await GrammarPoint.findOneAndUpdate(
    { lessonId: lessonDocs[9]._id, order: 3 },
    {
      $set: {
        title: 'The Subject Identifier Particle (が)',
        pattern: '[Subject] が [Predicate] vs [Topic] は',
        formation: 'Noun + が',
        explanation: 'Marks the grammatical subject, specifically identifying WHO or WHAT performs an action or fulfills a condition. While topic marker は brings a known subject into the background frame ("As for X..."), が places assertive focus on the subject itself ("It is X that..."). Question words like 誰 (who) and どれ (which) can never take は when asking for the subject — they must always take が.',
        notes: 'In question-and-answer pairs: Question: "どれがあなたの車ですか。" (Which one is your car?) -> Answer: "これが私の車です。" (THIS one is my car).',
        caution: 'In contrast to は (topic / background), が places focus on the subject itself.',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l9Vocab = [
    { kanji: 'これ', kana: 'これ', meanings: ['this one (near speaker)'], pos: ['pronoun'], seq: 1007200 },
    { kanji: 'それ', kana: 'それ', meanings: ['that one (near listener)'], pos: ['pronoun'], seq: 1007620 },
    { kanji: 'あれ', kana: 'あれ', meanings: ['that one over there'], pos: ['pronoun'], seq: 1001380 },
    { kanji: 'どれ', kana: 'どれ', meanings: ['which one'], pos: ['pronoun'], seq: 1008980 },
    { kanji: 'この', kana: 'この', meanings: ['this (+ noun)'], pos: ['adjective'], seq: 1007210 },
    { kanji: 'その', kana: 'その', meanings: ['that (+ noun)'], pos: ['adjective'], seq: 1007630 },
    { kanji: 'あの', kana: 'あの', meanings: ['that (+ noun) over there'], pos: ['adjective'], seq: 1001390 },
    { kanji: 'どの', kana: 'どの', meanings: ['which (+ noun)'], pos: ['adjective'], seq: 1008990 },
    { kanji: '本', kana: 'ほん', meanings: ['book'], pos: ['noun'], seq: 1515900 },
    { kanji: '辞書', kana: 'じしょ', meanings: ['dictionary'], pos: ['noun'], seq: 1308310 },
    { kanji: '傘', kana: 'かさ', meanings: ['umbrella'], pos: ['noun'], seq: 1207160 },
    { kanji: '鍵', kana: 'かぎ', meanings: ['key'], pos: ['noun'], seq: 1207790 },
    { kanji: '車', kana: 'くるま', meanings: ['car', 'vehicle'], pos: ['noun'], seq: 1319710 },
    { kanji: '時計', kana: 'とけい', meanings: ['watch', 'clock'], pos: ['noun'], seq: 1445710 },
  ];

  const l9VocabDocs = [];
  for (const v of l9Vocab) {
    const doc = await VocabEntry.findOneAndUpdate(
      { kana: v.kana, lessonId: lessonDocs[9]._id },
      {
        $set: {
          kanji: v.kanji,
          meanings: v.meanings,
          partOfSpeech: v.pos,
          jmdictSeq: v.seq,
          thematicCategory: 'objects',
          jlptLevel: 'N5',
        },
      },
      { upsert: true, new: true }
    );
    l9VocabDocs.push(doc);
  }

  // L9.1 Examples: Demonstrative Pronouns これ, あれ, どれ
  const s91_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 10301 },
    {
      $set: {
        japanese: 'これは私の辞書です。',
        furigana: 'これは わたしの じしょです。',
        english: 'This is my dictionary.',
        relatedGrammarId: l9g1._id,
        relatedVocabIds: [l9VocabDocs[0]._id, l9VocabDocs[9]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s91_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 10302 },
    {
      $set: {
        japanese: 'あれは誰の車ですか。',
        furigana: 'あれは だれの くるまですか。',
        english: 'Whose car is that over there?',
        relatedGrammarId: l9g1._id,
        relatedVocabIds: [l9VocabDocs[2]._id, l9VocabDocs[12]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s91_3 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 10303 },
    {
      $set: {
        japanese: '田中さんの本はどれですか。',
        furigana: 'たなかさんの ほんは どれですか。',
        english: "Which one is Mr. Tanaka's book?",
        relatedGrammarId: l9g1._id,
        relatedVocabIds: [l9VocabDocs[3]._id, l9VocabDocs[8]._id],
      },
    },
    { upsert: true, new: true }
  );

  // L9.2 Examples: Demonstrative Adjectives その, この
  const s92_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 10304 },
    {
      $set: {
        japanese: 'その傘は誰のですか。',
        furigana: 'その かさは だれのですか。',
        english: 'Whose umbrella is that?',
        relatedGrammarId: l9g2._id,
        relatedVocabIds: [l9VocabDocs[5]._id, l9VocabDocs[10]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s92_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 10305 },
    {
      $set: {
        japanese: 'この車は私のです。',
        furigana: 'この くるまは わたしの です。',
        english: 'This car is mine.',
        relatedGrammarId: l9g2._id,
        relatedVocabIds: [l9VocabDocs[4]._id, l9VocabDocs[12]._id],
      },
    },
    { upsert: true, new: true }
  );

  // L9.3 Examples: Subject Marker が vs は
  const s93_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 10306 },
    {
      $set: {
        japanese: 'どれがあなたの車ですか。',
        furigana: 'どれが あなたの くるまですか。',
        english: 'Which one is your car? (identifying subject with が)',
        relatedGrammarId: l9g3._id,
        relatedVocabIds: [l9VocabDocs[3]._id, l9VocabDocs[12]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s93_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 10307 },
    {
      $set: {
        japanese: 'これが私の鍵です。',
        furigana: 'これが わたしの かぎです。',
        english: 'THIS is my key (asserting identity with が).',
        relatedGrammarId: l9g3._id,
        relatedVocabIds: [l9VocabDocs[0]._id, l9VocabDocs[11]._id],
      },
    },
    { upsert: true, new: true }
  );

  await GrammarPoint.findByIdAndUpdate(l9g1._id, { $set: { exampleSentenceIds: [s91_1._id, s91_2._id, s91_3._id] } });
  await GrammarPoint.findByIdAndUpdate(l9g2._id, { $set: { exampleSentenceIds: [s92_1._id, s92_2._id] } });
  await GrammarPoint.findByIdAndUpdate(l9g3._id, { $set: { exampleSentenceIds: [s93_1._id, s93_2._id] } });

  // ----------------------------------------------------
  // LESSON 10: Belonging & Inclusions (の, も, Numbers 1-100)
  // ----------------------------------------------------
  const l10g1 = await GrammarPoint.findOneAndUpdate(
    { lessonId: lessonDocs[10]._id, order: 1 },
    {
      $set: {
        title: 'The Modifier & Possessive Particle (の)',
        pattern: '[Noun 1] + の + [Noun 2]',
        formation: 'Noun 1 + の + Noun 2',
        explanation: 'Noun 1 modifies, specifies, or owns Noun 2. Can indicate possession (私の本 = my book), affiliation (大学の先生 = university teacher), or country of origin (日本の車 = Japanese car). In Japanese, the modifier always precedes the modified noun.',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l10g2 = await GrammarPoint.findOneAndUpdate(
    { lessonId: lessonDocs[10]._id, order: 2 },
    {
      $set: {
        title: 'The Inclusive Particle (も - "Also, Too")',
        pattern: '[Noun] + も',
        formation: 'Noun + も',
        explanation: 'Replaces topic marker は or subject marker が to state that the same predicate applies to an additional entity ("also", "too"). When repeated across two items (A も B も), it translates to "both A and B".',
        notes: '田中さんは学生です。私も学生です。(Tanaka is a student. I am also a student.)',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l10g3 = await GrammarPoint.findOneAndUpdate(
    { lessonId: lessonDocs[10]._id, order: 3 },
    {
      $set: {
        title: 'Counting Numbers 1–100 & Age Counter (〜歳)',
        pattern: '[Number] + 歳 (さい)',
        formation: 'Digit + 歳 / 才',
        explanation: 'Japanese counts in tens and hundreds. Age takes the counter 歳 (sai). Note the special irregular pronunciation for twenty years old: はたち (二十歳), which does not use the suffix さい.',
        notes: 'Special age pronunciation: 20歳 is はたち (twenty years old).',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l10Vocab = [
    { kanji: '一', kana: 'いち', meanings: ['one'], pos: ['noun'], seq: 1157170 },
    { kanji: '二', kana: 'に', meanings: ['two'], pos: ['noun'], seq: 1459220 },
    { kanji: '三', kana: 'さん', meanings: ['three'], pos: ['noun'], seq: 1297590 },
    { kanji: '四', kana: 'よん', meanings: ['four'], pos: ['noun'], seq: 1314990 },
    { kanji: '五', kana: 'ご', meanings: ['five'], pos: ['noun'], seq: 1276070 },
    { kanji: '六', kana: 'ろく', meanings: ['six'], pos: ['noun'], seq: 1551690 },
    { kanji: '七', kana: 'なな', meanings: ['seven'], pos: ['noun'], seq: 1358990 },
    { kanji: '八', kana: 'はち', meanings: ['eight'], pos: ['noun'], seq: 1478200 },
    { kanji: '九', kana: 'きゅう', meanings: ['nine'], pos: ['noun'], seq: 1227180 },
    { kanji: '十', kana: 'じゅう', meanings: ['ten'], pos: ['noun'], seq: 1324830 },
    { kanji: '百', kana: 'ひゃく', meanings: ['hundred'], pos: ['noun'], seq: 1489430 },
    { kanji: '歳', kana: 'さい', meanings: ['years old (age counter)'], pos: ['suffix'], seq: 1290370 },
    { kanji: '財布', kana: 'さいふ', meanings: ['wallet', 'purse'], pos: ['noun'], seq: 1290480 },
    { kanji: '家族', kana: 'かぞく', meanings: ['family'], pos: ['noun'], seq: 1209350 },
    { kanji: '父', kana: 'ちち', meanings: ['father (humble / own)'], pos: ['noun'], seq: 1496920 },
    { kanji: '母', kana: 'はは', meanings: ['mother (humble / own)'], pos: ['noun'], seq: 1486790 },
  ];

  const l10VocabDocs = [];
  for (const v of l10Vocab) {
    const doc = await VocabEntry.findOneAndUpdate(
      { kana: v.kana, lessonId: lessonDocs[10]._id },
      {
        $set: {
          kanji: v.kanji,
          meanings: v.meanings,
          partOfSpeech: v.pos,
          jmdictSeq: v.seq,
          thematicCategory: 'numbers',
          jlptLevel: 'N5',
        },
      },
      { upsert: true, new: true }
    );
    l10VocabDocs.push(doc);
  }

  // L10.1 Examples: Modifier & Possessive の
  const s101_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 10401 },
    {
      $set: {
        japanese: 'これは私の父の車です。',
        furigana: 'これは わたしの ちちの くるまです。',
        english: "This is my father's car (possession).",
        relatedGrammarId: l10g1._id,
        relatedVocabIds: [l10VocabDocs[14]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s101_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 10402 },
    {
      $set: {
        japanese: '田中さんは大学の先生です。',
        furigana: 'たなかさんは だいがくの せんせいです。',
        english: 'Mr. Tanaka is a university teacher (affiliation).',
        relatedGrammarId: l10g1._id,
        relatedVocabIds: [],
      },
    },
    { upsert: true, new: true }
  );

  // L10.2 Examples: Inclusive も ("Also, Too")
  const s102_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 10403 },
    {
      $set: {
        japanese: '私も日本語の学生です。',
        furigana: 'わたしも にほんごの がくせいです。',
        english: 'I am also a Japanese language student.',
        relatedGrammarId: l10g2._id,
        relatedVocabIds: [l10VocabDocs[0]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s102_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 10404 },
    {
      $set: {
        japanese: '父も母も元気です。',
        furigana: 'ちちも ははも げんきです。',
        english: 'Both my father and my mother are well.',
        relatedGrammarId: l10g2._id,
        relatedVocabIds: [l10VocabDocs[14]._id, l10VocabDocs[15]._id],
      },
    },
    { upsert: true, new: true }
  );

  // L10.3 Examples: Numbers & Age Counter 〜歳
  const s103_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 10405 },
    {
      $set: {
        japanese: '妹は二十歳です。',
        furigana: 'いもうとは はたちです。',
        english: 'My younger sister is twenty years old.',
        relatedGrammarId: l10g3._id,
        relatedVocabIds: [l10VocabDocs[11]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s103_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 10406 },
    {
      $set: {
        japanese: '田中さんは三十五歳です。',
        furigana: 'たなかさんは さんじゅうごさいです。',
        english: 'Mr. Tanaka is thirty-five years old.',
        relatedGrammarId: l10g3._id,
        relatedVocabIds: [l10VocabDocs[11]._id],
      },
    },
    { upsert: true, new: true }
  );

  await GrammarPoint.findByIdAndUpdate(l10g1._id, { $set: { exampleSentenceIds: [s101_1._id, s101_2._id] } });
  await GrammarPoint.findByIdAndUpdate(l10g2._id, { $set: { exampleSentenceIds: [s102_1._id, s102_2._id] } });
  await GrammarPoint.findByIdAndUpdate(l10g3._id, { $set: { exampleSentenceIds: [s103_1._id, s103_2._id] } });

  console.log('✓ Unit 1 lessons, grammar points, and Tatoeba pairs seeded successfully.');
}


// Seed Unit 2: Action, Time, & Basic Movement (Lessons 11-14)
async function seedUnit2(lessonDocs) {
  console.log('Seeding Unit 2: Lessons 11, 12, 13, 14...');
  const getLesson = (order) => lessonDocs[order];

  // ====================================================
  // LESSON 11: Action, Object, & Venue (を, で, へ/に)
  // ====================================================
  const l11 = getLesson(11);
  const l11g1 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l11._id, order: 1 },
    {
      $set: {
        title: 'Direct Object Particle (を - wo)',
        pattern: '[Noun] + を + [Transitive Verb]',
        formation: 'Noun + を + Verb (written with を, pronounced "o")',
        explanation: 'Designates the direct object or receiver of an action. It identifies what is being physically or mentally acted upon by a transitive verb (e.g. お茶を飲む = drink tea; 本を読む = read a book).',
        notes: 'Pronounced exactly as the vowel "o", but always written with the special particle hiragana を.',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l11g2 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l11._id, order: 2 },
    {
      $set: {
        title: 'Venue of Action Particle (で)',
        pattern: '[Location] + で + [Action Verb]',
        formation: 'Location + で + Verb',
        explanation: 'Marks the setting, environment, or venue where an active physical event or behavior takes place (e.g. 図書館で勉強する = study at the library).',
        caution: 'Contrast with に: で indicates active events taking place (eating, studying), whereas に marks static presence (ある / いる) or movement destinations.',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l11g3 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l11._id, order: 3 },
    {
      $set: {
        title: 'Movement Direction & Goal (へ / に)',
        pattern: '[Destination] + へ / に + 行く / 来る / 帰る',
        formation: 'Destination + へ (direction: "heading towards") / に (endpoint: "arriving at") + Motion Verb',
        explanation: 'Indicates the direction or destination of motion verbs (行く, 来る, 帰る). Particle へ (pronounced "e") emphasizes the physical orientation and heading toward a direction (like English "towards"). Particle に pinpoints the exact final destination or target of arrival (like English "to/at"). Both particles are widely used with motion verbs.',
        notes: 'Particle へ is written with the character へ (he), but pronounced "e".',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l11Vocab = [
    { kanji: '食べる', kana: 'たべる', meanings: ['to eat'], pos: ['ichidan verb'], seq: 1358280, cat: 'verbs' },
    { kanji: '飲む', kana: 'のむ', meanings: ['to drink'], pos: ['godan verb'], seq: 1184340, cat: 'verbs' },
    { kanji: '読む', kana: 'よむ', meanings: ['to read'], pos: ['godan verb'], seq: 1545620, cat: 'verbs' },
    { kanji: '書く', kana: 'かく', meanings: ['to write', 'to draw'], pos: ['godan verb'], seq: 1582960, cat: 'verbs' },
    { kanji: '聞く', kana: 'きく', meanings: ['to hear', 'to listen', 'to ask'], pos: ['godan verb'], seq: 1526420, cat: 'verbs' },
    { kanji: '見る', kana: 'みる', meanings: ['to see', 'to look', 'to watch'], pos: ['ichidan verb'], seq: 1251970, cat: 'verbs' },
    { kanji: '行く', kana: 'いく', meanings: ['to go'], pos: ['godan verb'], seq: 1272050, cat: 'verbs' },
    { kanji: '来る', kana: 'くる', meanings: ['to come'], pos: ['irregular verb'], seq: 1581400, cat: 'verbs' },
    { kanji: '帰る', kana: 'かえる', meanings: ['to return', 'to go back home'], pos: ['godan verb'], seq: 1208920, cat: 'verbs' },
    { kanji: 'ご飯', kana: 'ごはん', meanings: ['cooked rice', 'meal'], pos: ['noun'], seq: 1278140, cat: 'food' },
    { kanji: '水', kana: 'みず', meanings: ['water (cold)'], pos: ['noun'], seq: 1385590, cat: 'food' },
    { kanji: 'お茶', kana: 'おちゃ', meanings: ['tea', 'Japanese green tea'], pos: ['noun'], seq: 1435210, cat: 'food' },
    { kanji: '家', kana: 'いえ', meanings: ['house', 'home'], pos: ['noun'], seq: 1208750, cat: 'places' },
    { kanji: '学校', kana: 'がっこう', meanings: ['school'], pos: ['noun'], seq: 1205160, cat: 'places' },
    { kanji: '図書館', kana: 'としょかん', meanings: ['library'], pos: ['noun'], seq: 1445940, cat: 'places' },
    { kanji: '駅', kana: 'えき', meanings: ['railway station'], pos: ['noun'], seq: 1172460, cat: 'places' },
  ];

  const l11VocabDocs = [];
  for (const v of l11Vocab) {
    const doc = await VocabEntry.findOneAndUpdate(
      { kana: v.kana, lessonId: l11._id },
      {
        $set: {
          kanji: v.kanji,
          meanings: v.meanings,
          partOfSpeech: v.pos,
          jmdictSeq: v.seq,
          thematicCategory: v.cat,
          jlptLevel: 'N5',
        },
      },
      { upsert: true, new: true }
    );
    l11VocabDocs.push(doc);
  }

  // L11.1 Examples: Direct Object を
  const s111_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11101 },
    {
      $set: {
        japanese: '私は毎日お茶を飲みます。',
        furigana: 'わたしは まいにち おちゃを のみます。',
        english: 'I drink green tea every day.',
        relatedGrammarId: l11g1._id,
        relatedVocabIds: [l11VocabDocs[1]._id, l11VocabDocs[11]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s111_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11102 },
    {
      $set: {
        japanese: '図書館で日本語の本を読みます。',
        furigana: 'としょかんで にほんごの ほんを よみます。',
        english: 'I read Japanese books at the library.',
        relatedGrammarId: l11g1._id,
        relatedVocabIds: [l11VocabDocs[2]._id, l11VocabDocs[14]._id],
      },
    },
    { upsert: true, new: true }
  );

  // L11.2 Examples: Venue of Action で
  const s112_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11103 },
    {
      $set: {
        japanese: '学校で日本語を勉強します。',
        furigana: 'がっこうで にほんごを べんきょうします。',
        english: 'I study Japanese at school.',
        relatedGrammarId: l11g2._id,
        relatedVocabIds: [l11VocabDocs[13]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s112_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11104 },
    {
      $set: {
        japanese: '家でご飯を食べます。',
        furigana: 'いえで ごはんを たべます。',
        english: 'I eat meals at home.',
        relatedGrammarId: l11g2._id,
        relatedVocabIds: [l11VocabDocs[0]._id, l11VocabDocs[9]._id, l11VocabDocs[12]._id],
      },
    },
    { upsert: true, new: true }
  );

  // L11.3 Examples: Direction へ AND Goal に
  const s113_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11105 },
    {
      $set: {
        japanese: '田中さんは明日学校へ行きます。',
        furigana: 'たなかさんは あした がっこうへ いきます。',
        english: 'Mr. Tanaka goes toward school tomorrow (direction with へ).',
        relatedGrammarId: l11g3._id,
        relatedVocabIds: [l11VocabDocs[6]._id, l11VocabDocs[13]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s113_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11106 },
    {
      $set: {
        japanese: '午後六時に家に帰ります。',
        furigana: 'ごご ろくじに いえに かえります。',
        english: 'I return home at 6:00 PM (destination endpoint with に).',
        relatedGrammarId: l11g3._id,
        relatedVocabIds: [l11VocabDocs[8]._id, l11VocabDocs[12]._id],
      },
    },
    { upsert: true, new: true }
  );

  await GrammarPoint.findByIdAndUpdate(l11g1._id, { $set: { exampleSentenceIds: [s111_1._id, s111_2._id] } });
  await GrammarPoint.findByIdAndUpdate(l11g2._id, { $set: { exampleSentenceIds: [s112_1._id, s112_2._id] } });
  await GrammarPoint.findByIdAndUpdate(l11g3._id, { $set: { exampleSentenceIds: [s113_1._id, s113_2._id] } });

  // ====================================================
  // LESSON 12: Time & Polite Verb Conjugation (〜ます, 〜ました, 〜ません, に)
  // ====================================================
  const l12 = getLesson(12);
  const l12g1 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l12._id, order: 1 },
    {
      $set: {
        title: 'Polite Verb Conjugation: Present (〜ます / 〜ません)',
        pattern: 'Verb stem + ます / ません',
        formation: 'Affirmative: Verb stem + ます. Negative: Verb stem + ません.',
        explanation: 'Standard polite non-past verbal predicate. Used for habitual actions or future intentions. Attach ます for affirmative statements ("I do / I will do") and ません for negative statements ("I do not / I will not do").',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l12g2 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l12._id, order: 2 },
    {
      $set: {
        title: 'Polite Verb Conjugation: Past (〜ました / 〜ませんでした)',
        pattern: 'Verb stem + ました / ませんでした',
        formation: 'Past Affirmative: Verb stem + ました. Past Negative: Verb stem + ませんでした.',
        explanation: 'Expresses completed historical events or past negative non-occurrences in polite speech. Attach ました for past affirmative actions ("did / completed") and ませんでした for past negative ("did not do").',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l12g3 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l12._id, order: 3 },
    {
      $set: {
        title: 'Specific Time Marker (に) vs Relative Time',
        pattern: '[Specific Time] + に',
        formation: 'Clock hour / Calendar date / Day of week + に. (Relative words take NO に)',
        explanation: 'Marks precise numerical points in time (e.g. 7時に = at 7:00, 日曜日に = on Sunday). In contrast, relative time expressions defined by the present moment (今日, 明日, 毎日, 今, 朝) do not take particle に.',
        notes: 'Rule of thumb: If it contains a specific number or weekday name, attach に. If it shifts depending on today, use no particle.',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l12Vocab = [
    { kanji: '起きる', kana: 'おきる', meanings: ['to get up', 'to wake up'], pos: ['ichidan verb'], seq: 1204090, cat: 'verbs' },
    { kanji: '寝る', kana: 'ねる', meanings: ['to sleep', 'to go to bed'], pos: ['ichidan verb'], seq: 1419730, cat: 'verbs' },
    { kanji: '勉強する', kana: 'べんきょうする', meanings: ['to study'], pos: ['suru verb'], seq: 1507720, cat: 'verbs' },
    { kanji: 'する', kana: 'する', meanings: ['to do'], pos: ['irregular verb'], seq: 1157170, cat: 'verbs' },
    { kanji: '今日', kana: 'きょう', meanings: ['today'], pos: ['noun', 'adverb'], seq: 1243160, cat: 'time' },
    { kanji: '明日', kana: 'あした', meanings: ['tomorrow'], pos: ['noun', 'adverb'], seq: 1521740, cat: 'time' },
    { kanji: '昨日', kana: 'きのう', meanings: ['yesterday'], pos: ['noun', 'adverb'], seq: 1289130, cat: 'time' },
    { kanji: '毎日', kana: 'まいにち', meanings: ['every day'], pos: ['noun', 'adverb'], seq: 1525620, cat: 'time' },
    { kanji: '今', kana: 'いま', meanings: ['now'], pos: ['noun', 'adverb'], seq: 1243760, cat: 'time' },
    { kanji: '朝', kana: 'あさ', meanings: ['morning'], pos: ['noun'], seq: 1415250, cat: 'time' },
    { kanji: '昼', kana: 'ひる', meanings: ['noon', 'daytime'], pos: ['noun'], seq: 1478790, cat: 'time' },
    { kanji: '夜', kana: 'よる', meanings: ['night', 'evening'], pos: ['noun'], seq: 1546740, cat: 'time' },
    { kanji: '時', kana: 'じ', meanings: ["o'clock (hour counter)"], pos: ['suffix'], seq: 1324830, cat: 'time' },
    { kanji: '分', kana: 'ふん', meanings: ['minute (counter)'], pos: ['suffix'], seq: 1489430, cat: 'time' },
    { kanji: '午前', kana: 'ごぜん', meanings: ['morning', 'A.M.'], pos: ['noun'], seq: 1276070, cat: 'time' },
    { kanji: '午後', kana: 'ごご', meanings: ['afternoon', 'P.M.'], pos: ['noun'], seq: 1276080, cat: 'time' },
  ];

  const l12VocabDocs = [];
  for (const v of l12Vocab) {
    const doc = await VocabEntry.findOneAndUpdate(
      { kana: v.kana, lessonId: l12._id },
      {
        $set: {
          kanji: v.kanji,
          meanings: v.meanings,
          partOfSpeech: v.pos,
          jmdictSeq: v.seq,
          thematicCategory: v.cat,
          jlptLevel: 'N5',
        },
      },
      { upsert: true, new: true }
    );
    l12VocabDocs.push(doc);
  }

  // L12.1 Examples: Affirmative 〜ます AND Negative 〜ません
  const s121_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11201 },
    {
      $set: {
        japanese: '私は毎朝七時に起きます。',
        furigana: 'わたしは まいあさ ななじに おきます。',
        english: "I get up at seven o'clock every morning (affirmative ます).",
        relatedGrammarId: l12g1._id,
        relatedVocabIds: [l12VocabDocs[0]._id, l12VocabDocs[7]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s121_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11202 },
    {
      $set: {
        japanese: '夜はお茶を飲みません。',
        furigana: 'よるは おちゃを のみません。',
        english: 'I do not drink tea at night (negative ません).',
        relatedGrammarId: l12g1._id,
        relatedVocabIds: [l12VocabDocs[11]._id],
      },
    },
    { upsert: true, new: true }
  );

  // L12.2 Examples: Past Affirmative 〜ました AND Past Negative 〜ませんでした
  const s122_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11203 },
    {
      $set: {
        japanese: '昨日は日本語を勉強しました。',
        furigana: 'きのうは にほんごを べんきょうしました。',
        english: 'I studied Japanese yesterday (past affirmative ました).',
        relatedGrammarId: l12g2._id,
        relatedVocabIds: [l12VocabDocs[2]._id, l12VocabDocs[6]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s122_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11204 },
    {
      $set: {
        japanese: '昨日は本を読みませんでした。',
        furigana: 'きのうは ほんを よみませんでした。',
        english: 'I did not read books yesterday (past negative ませんでした).',
        relatedGrammarId: l12g2._id,
        relatedVocabIds: [l12VocabDocs[6]._id],
      },
    },
    { upsert: true, new: true }
  );

  // L12.3 Examples: Specific Time に vs Relative Time (no に)
  const s123_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11205 },
    {
      $set: {
        japanese: '午後九時半に寝ました。',
        furigana: 'ごご くじはんに ねました。',
        english: 'I went to bed at 9:30 PM (specific time with に).',
        relatedGrammarId: l12g3._id,
        relatedVocabIds: [l12VocabDocs[1]._id, l12VocabDocs[15]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s123_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11206 },
    {
      $set: {
        japanese: '明日、学校へ行きます。',
        furigana: 'あした、がっこうへ いきます。',
        english: 'Tomorrow, I go to school (relative time without に).',
        relatedGrammarId: l12g3._id,
        relatedVocabIds: [l12VocabDocs[5]._id],
      },
    },
    { upsert: true, new: true }
  );

  await GrammarPoint.findByIdAndUpdate(l12g1._id, { $set: { exampleSentenceIds: [s121_1._id, s121_2._id] } });
  await GrammarPoint.findByIdAndUpdate(l12g2._id, { $set: { exampleSentenceIds: [s122_1._id, s122_2._id] } });
  await GrammarPoint.findByIdAndUpdate(l12g3._id, { $set: { exampleSentenceIds: [s123_1._id, s123_2._id] } });

  // ====================================================
  // LESSON 13: Existence & Location (ある vs いる, に)
  // ====================================================
  const l13 = getLesson(13);
  const l13g1 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l13._id, order: 1 },
    {
      $set: {
        title: 'Animate vs. Inanimate Existence (ある / いる)',
        pattern: '[Inanimate] が あります / [Animate] が います',
        formation: 'Things/Plants/Events + が あります, People/Animals + が います',
        explanation: 'Japanese distinguishes verbs of existence strictly based on animacy and autonomous movement: いる is reserved exclusively for humans and living creatures; ある is used for inanimate physical objects, buildings, plants, and abstract occurrences.',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l13g2 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l13._id, order: 2 },
    {
      $set: {
        title: 'Location of Existence (に あります / に います)',
        pattern: '[Location] に [Entity] が あります / います',
        formation: 'Location + に + Subject + が + あります / います',
        explanation: 'Particle に marks the physical coordinate where an entity is situated or present. When emphasizing the entity rather than the location, the word order inverts: [Entity] は [Location] に あります / います (As for [Entity], it is at [Location]).',
        notes: 'Contrast with で: に marks static presence (where something is), while で marks where an active event takes place.',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l13g3 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l13._id, order: 3 },
    {
      $set: {
        title: 'Spatial Position Nouns (上・下・前・後ろ・中)',
        pattern: '[Noun 1] の [Spatial Position] に',
        formation: 'Noun + の + 上 / 下 / 前 / 後ろ / 中 / 隣 + に',
        explanation: 'In Japanese, spatial relations (above, below, front, behind, inside) are relational nouns linked to the reference object by particle の: 机の上 (on top of the desk), 部屋の中 (inside the room), 車の後ろ (behind the car).',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l13Vocab = [
    { kanji: 'ある', kana: 'ある', meanings: ['to exist (inanimate)', 'to be found'], pos: ['godan verb'], seq: 1585860, cat: 'verbs' },
    { kanji: 'いる', kana: 'いる', meanings: ['to exist (animate)', 'to stay'], pos: ['ichidan verb'], seq: 1577980, cat: 'verbs' },
    { kanji: '人', kana: 'ひと', meanings: ['person', 'human beings'], pos: ['noun'], seq: 1459460, cat: 'people' },
    { kanji: '男の人', kana: 'おとこのひと', meanings: ['man', 'adult male'], pos: ['noun'], seq: 1424930, cat: 'people' },
    { kanji: '女の人', kana: 'おんなのひと', meanings: ['woman', 'adult female'], pos: ['noun'], seq: 1346380, cat: 'people' },
    { kanji: '子供', kana: 'こども', meanings: ['child', 'children'], pos: ['noun'], seq: 1274530, cat: 'people' },
    { kanji: '犬', kana: 'いぬ', meanings: ['dog'], pos: ['noun'], seq: 1215440, cat: 'animals' },
    { kanji: '猫', kana: 'ねこ', meanings: ['cat'], pos: ['noun'], seq: 1461940, cat: 'animals' },
    { kanji: '机', kana: 'つくえ', meanings: ['desk'], pos: ['noun'], seq: 1412030, cat: 'objects' },
    { kanji: '椅子', kana: 'いす', meanings: ['chair', 'seat'], pos: ['noun'], seq: 1163450, cat: 'objects' },
    { kanji: '部屋', kana: 'へや', meanings: ['room'], pos: ['noun'], seq: 1489620, cat: 'places' },
    { kanji: '上', kana: 'うえ', meanings: ['above', 'on top', 'upper'], pos: ['noun'], seq: 1339670, cat: 'positions' },
    { kanji: '下', kana: 'した', meanings: ['below', 'under', 'beneath'], pos: ['noun'], seq: 1208920, cat: 'positions' },
    { kanji: '前', kana: 'まえ', meanings: ['in front', 'before'], pos: ['noun'], seq: 1496920, cat: 'positions' },
    { kanji: '後ろ', kana: 'うしろ', meanings: ['behind', 'rear'], pos: ['noun'], seq: 1289130, cat: 'positions' },
    { kanji: '中', kana: 'なか', meanings: ['inside', 'middle'], pos: ['noun'], seq: 1445710, cat: 'positions' },
  ];

  const l13VocabDocs = [];
  for (const v of l13Vocab) {
    const doc = await VocabEntry.findOneAndUpdate(
      { kana: v.kana, lessonId: l13._id },
      {
        $set: {
          kanji: v.kanji,
          meanings: v.meanings,
          partOfSpeech: v.pos,
          jmdictSeq: v.seq,
          thematicCategory: v.cat,
          jlptLevel: 'N5',
        },
      },
      { upsert: true, new: true }
    );
    l13VocabDocs.push(doc);
  }

  // L13.1 Examples: Inanimate あります AND Animate います
  const s131_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11301 },
    {
      $set: {
        japanese: '机の上に本があります。',
        furigana: 'つくえの うえに ほんが あります。',
        english: 'There is a book on the desk (inanimate あります).',
        relatedGrammarId: l13g1._id,
        relatedVocabIds: [l13VocabDocs[0]._id, l13VocabDocs[8]._id, l13VocabDocs[11]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s131_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11302 },
    {
      $set: {
        japanese: '部屋の中に猫がいます。',
        furigana: 'へやの なかに ねこが います。',
        english: 'There is a cat inside the room (animate います).',
        relatedGrammarId: l13g1._id,
        relatedVocabIds: [l13VocabDocs[1]._id, l13VocabDocs[7]._id, l13VocabDocs[10]._id],
      },
    },
    { upsert: true, new: true }
  );

  // L13.2 Examples: Location of Existence に
  const s132_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11303 },
    {
      $set: {
        japanese: '駅の前に図書館があります。',
        furigana: 'えきの まえに としょかんが あります。',
        english: 'There is a library in front of the station.',
        relatedGrammarId: l13g2._id,
        relatedVocabIds: [l13VocabDocs[0]._id, l13VocabDocs[13]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s132_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11304 },
    {
      $set: {
        japanese: '公園に犬がいます。',
        furigana: 'こうえんに いぬが います。',
        english: 'There is a dog at the park.',
        relatedGrammarId: l13g2._id,
        relatedVocabIds: [l13VocabDocs[1]._id, l13VocabDocs[6]._id],
      },
    },
    { upsert: true, new: true }
  );

  // L13.3 Examples: Spatial Position Nouns
  const s133_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11305 },
    {
      $set: {
        japanese: '椅子の下に鍵があります。',
        furigana: 'いすの したに かぎが あります。',
        english: 'There is a key under the chair.',
        relatedGrammarId: l13g3._id,
        relatedVocabIds: [l13VocabDocs[9]._id, l13VocabDocs[12]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s133_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11306 },
    {
      $set: {
        japanese: '駅の前に男の人がいます。',
        furigana: 'えきの まえに おとこのひとが います。',
        english: 'There is a man in front of the station.',
        relatedGrammarId: l13g3._id,
        relatedVocabIds: [l13VocabDocs[1]._id, l13VocabDocs[3]._id, l13VocabDocs[13]._id],
      },
    },
    { upsert: true, new: true }
  );

  await GrammarPoint.findByIdAndUpdate(l13g1._id, { $set: { exampleSentenceIds: [s131_1._id, s131_2._id] } });
  await GrammarPoint.findByIdAndUpdate(l13g2._id, { $set: { exampleSentenceIds: [s132_1._id, s132_2._id] } });
  await GrammarPoint.findByIdAndUpdate(l13g3._id, { $set: { exampleSentenceIds: [s133_1._id, s133_2._id] } });

  // ====================================================
  // LESSON 14: Companions & Interpersonal Actions (と, や, に)
  // THEMATIC SET: Social Plans, Outings & Communication
  // ====================================================
  const l14 = getLesson(14);
  const l14g1 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l14._id, order: 1 },
    {
      $set: {
        title: 'Accompaniment / Companion Particle (と)',
        pattern: '[Person] + と (一緒に) + [Action]',
        formation: 'Noun + と + (一緒に) + Verb',
        explanation: 'Marks a partner or companion who participates in the same action together ("with [Person]"). It is frequently paired with the adverb 一緒に (together) for stylistic emphasis.',
        notes: 'Often paired with 一緒に (いっしょに - together) for clarity.',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l14g2 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l14._id, order: 2 },
    {
      $set: {
        title: 'Exhaustive (と) vs Non-Exhaustive Listing (や)',
        pattern: '[Noun 1] と [Noun 2] vs [Noun 1] や [Noun 2]',
        formation: 'A と B (exhaustive: "A and B, only"), A や B (non-exhaustive: "A and B, among other things")',
        explanation: 'Particle と creates an exhaustive, closed list containing only the explicitly named items ("A and B, nothing else"). In contrast, particle や introduces an open-ended, representative list suggesting that additional unmentioned items of the same category exist (frequently concluded with など, "and so on").',
        notes: 'や is frequently followed by など ("and so on").',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l14g3 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l14._id, order: 3 },
    {
      $set: {
        title: 'Interaction Target / Recipient (に)',
        pattern: '[Person] + に + 会う / 話す / 聞く / 電話する',
        formation: 'Person + に + Verb of interactive engagement',
        explanation: 'Designates the counterparty or recipient of bilateral mutual engagement: meeting someone (人に会う), talking to someone (人に話す), asking a teacher (先生に聞く), or telephoning someone (母に電話する).',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  // Thematically Cohesive Vocab Set: Social Plans, Outings & Communication
  const l14Vocab = [
    { kanji: '会う', kana: 'あう', meanings: ['to meet', 'to encounter'], pos: ['godan verb'], seq: 1157170, cat: 'verbs' },
    { kanji: '話す', kana: 'はなす', meanings: ['to talk', 'to speak'], pos: ['godan verb'], seq: 1486790, cat: 'verbs' },
    { kanji: '待つ', kana: 'まつ', meanings: ['to wait'], pos: ['godan verb'], seq: 1525620, cat: 'verbs' },
    { kanji: '買う', kana: 'かう', meanings: ['to buy', 'to purchase'], pos: ['godan verb'], seq: 1204090, cat: 'verbs' },
    { kanji: '電話する', kana: 'でんわする', meanings: ['to make a phone call'], pos: ['suru verb'], seq: 1445710, cat: 'verbs' },
    { kanji: '誰か', kana: 'だれか', meanings: ['someone', 'somebody'], pos: ['pronoun'], seq: 1008080, cat: 'people' },
    { kanji: '一緒に', kana: 'いっしょに', meanings: ['together'], pos: ['adverb'], seq: 1163450, cat: 'adverbs' },
    { kanji: '一人で', kana: 'ひとりで', meanings: ['alone', 'by oneself'], pos: ['adverb'], seq: 1459460, cat: 'adverbs' },
    { kanji: '約束', kana: 'やくそく', meanings: ['promise', 'appointment', 'plan'], pos: ['noun', 'suru verb'], seq: 1540950, cat: 'plans' },
    { kanji: '手紙', kana: 'てがみ', meanings: ['letter'], pos: ['noun'], seq: 1381980, cat: 'communication' },
    { kanji: '映画', kana: 'えいが', meanings: ['movie', 'film'], pos: ['noun'], seq: 1162480, cat: 'entertainment' },
    { kanji: '店', kana: 'みせ', meanings: ['shop', 'store'], pos: ['noun'], seq: 1464450, cat: 'places' },
    { kanji: '週末', kana: 'しゅうまつ', meanings: ['weekend'], pos: ['noun'], seq: 1324880, cat: 'time' },
    { kanji: 'カフェ', kana: 'カフェ', meanings: ['cafe', 'coffee shop'], pos: ['noun'], seq: 1032480, cat: 'places' },
    { kanji: '買い物', kana: 'かいもの', meanings: ['shopping', 'purchases'], pos: ['noun', 'suru verb'], seq: 1204080, cat: 'actions' },
    { kanji: '公園', kana: 'こうえん', meanings: ['public park'], pos: ['noun'], seq: 1276530, cat: 'places' },
  ];

  const l14VocabDocs = [];
  for (const v of l14Vocab) {
    const doc = await VocabEntry.findOneAndUpdate(
      { kana: v.kana, lessonId: l14._id },
      {
        $set: {
          kanji: v.kanji,
          meanings: v.meanings,
          partOfSpeech: v.pos,
          jmdictSeq: v.seq,
          thematicCategory: v.cat,
          jlptLevel: 'N5',
        },
      },
      { upsert: true, new: true }
    );
    l14VocabDocs.push(doc);
  }

  // Remove any obsolete vocab in Lesson 14 not in the current cohesive set
  await VocabEntry.deleteMany({
    lessonId: l14._id,
    kanji: { $nin: l14Vocab.map((v) => v.kanji) },
  });

  // L14.1 Examples: Accompaniment と
  const s141_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11401 },
    {
      $set: {
        japanese: '週末に友達と一緒に映画を見ます。',
        furigana: 'しゅうまつに ともだちと いっしょに えいがを みます。',
        english: 'I watch a movie together with my friend on the weekend.',
        relatedGrammarId: l14g1._id,
        relatedVocabIds: [l14VocabDocs[6]._id, l14VocabDocs[10]._id, l14VocabDocs[12]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s141_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11402 },
    {
      $set: {
        japanese: '一人で店へ行きます。',
        furigana: 'ひとりで みせへ いきます。',
        english: 'I go to the shop alone (contrasting accompaniment).',
        relatedGrammarId: l14g1._id,
        relatedVocabIds: [l14VocabDocs[7]._id, l14VocabDocs[11]._id],
      },
    },
    { upsert: true, new: true }
  );

  // L14.2 Examples: Exhaustive と AND Non-Exhaustive や
  const s142_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11403 },
    {
      $set: {
        japanese: '机の上に本と辞書があります。',
        furigana: 'つくえの うえに ほんと じしょが あります。',
        english: 'There are a book and a dictionary on the desk (exhaustive と).',
        relatedGrammarId: l14g2._id,
        relatedVocabIds: [],
      },
    },
    { upsert: true, new: true }
  );

  const s142_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11404 },
    {
      $set: {
        japanese: '店で手紙や切符を買いました。',
        furigana: 'みせで てがみや きっぷを かいました。',
        english: 'I bought letters, tickets, and other things at the shop (non-exhaustive や).',
        relatedGrammarId: l14g2._id,
        relatedVocabIds: [l14VocabDocs[3]._id, l14VocabDocs[9]._id, l14VocabDocs[11]._id],
      },
    },
    { upsert: true, new: true }
  );

  // L14.3 Examples: Interaction Target に
  const s143_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11405 },
    {
      $set: {
        japanese: '明日、駅で友達に会います。',
        furigana: 'あした、えきで ともだちに あいます。',
        english: 'I will meet a friend at the station tomorrow.',
        relatedGrammarId: l14g3._id,
        relatedVocabIds: [l14VocabDocs[0]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s143_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11406 },
    {
      $set: {
        japanese: '週末に母に電話します。',
        furigana: 'しゅうまつに ははに でんわします。',
        english: 'I will make a phone call to my mother on the weekend.',
        relatedGrammarId: l14g3._id,
        relatedVocabIds: [l14VocabDocs[4]._id, l14VocabDocs[12]._id],
      },
    },
    { upsert: true, new: true }
  );

  await GrammarPoint.findByIdAndUpdate(l14g1._id, { $set: { exampleSentenceIds: [s141_1._id, s141_2._id] } });
  await GrammarPoint.findByIdAndUpdate(l14g2._id, { $set: { exampleSentenceIds: [s142_1._id, s142_2._id] } });
  await GrammarPoint.findByIdAndUpdate(l14g3._id, { $set: { exampleSentenceIds: [s143_1._id, s143_2._id] } });

  console.log('✓ Unit 2 lessons (11-14), grammar points, and Tatoeba pairs seeded successfully.');
}


// Seed Unit 3: Adjectives & Descriptive Language (Lessons 15-17)
async function seedUnit3(lessonDocs) {
  console.log('Seeding Unit 3: Lessons 15, 16, 17...');
  const getLesson = (order) => lessonDocs[order];

  // ====================================================
  // LESSON 15: True Adjectives (い-Adjectives)
  // ====================================================
  const l15 = getLesson(15);
  const l15g1 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l15._id, order: 1 },
    {
      $set: {
        title: 'い-Adjective Non-Past Forms (Affirmative & Negative)',
        pattern: '[い-Adj stem] + いです / [い-Adj stem] + くないです',
        formation: 'Affirmative: Standard form + です (e.g. 新しいです). Negative: Drop 〜い + くないです / くありません (e.g. 新しくないです).',
        explanation: 'Japanese い-adjectives conjugate directly like verbs. In polite speech, the non-past affirmative appends です to the dictionary form. To form the negative, drop the final い and attach くないです (or more formal くありません). Note the important irregular adjective: いい (good) conjugates on its historical root stem よ-, becoming よくないです.',
        notes: 'Negative forms: 大きくないです (is not big), 新しくないです (is not new).',
        caution: 'Never say 新しいではありません — ではありません belongs strictly to nouns and な-adjectives, never い-adjectives!',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l15g2 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l15._id, order: 2 },
    {
      $set: {
        title: 'い-Adjective Past Forms (Past Affirmative & Past Negative)',
        pattern: '[い-Adj stem] + かったです / [い-Adj stem] + くなかったです',
        formation: 'Past Affirmative: Drop 〜い + かったです. Past Negative: Drop 〜い + くなかったです.',
        explanation: 'To express a past state with an い-adjective, drop the final い and attach かったです for affirmative past ("was..."). For past negative, drop い and attach くなかったです ("was not..."). The adjective いい (good) becomes よかったです (was good) and よくなかったです (was not good).',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l15g3 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l15._id, order: 3 },
    {
      $set: {
        title: 'Direct Noun Modification with い-Adjectives',
        pattern: '[い-Adjective] + [Noun]',
        formation: 'Standard dictionary form い-Adjective + Noun (no intervening particle)',
        explanation: 'Unlike English adjectives that are static, Japanese い-adjectives directly modify following nouns in their standard dictionary form without requiring any connecting particle like の or な (e.g. おいしいお茶 = delicious tea; 古い本 = old book).',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l15Vocab = [
    { kanji: '大きい', kana: 'おおきい', meanings: ['big', 'large'], pos: ['i-adjective'], seq: 1382480, cat: 'adjectives' },
    { kanji: '小さい', kana: 'ちいさい', meanings: ['small', 'little'], pos: ['i-adjective'], seq: 1327170, cat: 'adjectives' },
    { kanji: '高い', kana: 'たかい', meanings: ['high', 'tall', 'expensive'], pos: ['i-adjective'], seq: 1287980, cat: 'adjectives' },
    { kanji: '安い', kana: 'やすい', meanings: ['cheap', 'inexpensive'], pos: ['i-adjective'], seq: 1153120, cat: 'adjectives' },
    { kanji: '新しい', kana: 'あたらしい', meanings: ['new', 'fresh'], pos: ['i-adjective'], seq: 1382020, cat: 'adjectives' },
    { kanji: '古い', kana: 'ふるい', meanings: ['old (not of people)'], pos: ['i-adjective'], seq: 1249760, cat: 'adjectives' },
    { kanji: '良い', kana: 'いい', meanings: ['good', 'fine', 'nice'], pos: ['i-adjective'], seq: 1596540, cat: 'adjectives' },
    { kanji: '悪い', kana: 'わるい', meanings: ['bad', 'poor', 'undesirable'], pos: ['i-adjective'], seq: 1156820, cat: 'adjectives' },
    { kanji: '暑い', kana: 'あつい', meanings: ['hot (weather)'], pos: ['i-adjective'], seq: 1332820, cat: 'adjectives' },
    { kanji: '寒い', kana: 'さむい', meanings: ['cold (weather)'], pos: ['i-adjective'], seq: 1292020, cat: 'adjectives' },
    { kanji: '熱い', kana: 'あつい', meanings: ['hot (thing, drink)'], pos: ['i-adjective'], seq: 1475710, cat: 'adjectives' },
    { kanji: '冷たい', kana: 'つめたい', meanings: ['cold (to touch)'], pos: ['i-adjective'], seq: 1485630, cat: 'adjectives' },
    { kanji: '美味しい', kana: 'おいしい', meanings: ['delicious', 'tasty'], pos: ['i-adjective'], seq: 1002340, cat: 'adjectives' },
    { kanji: '楽しい', kana: 'たのしい', meanings: ['enjoyable', 'fun'], pos: ['i-adjective'], seq: 1234760, cat: 'adjectives' },
    { kanji: '面白い', kana: 'おもしろい', meanings: ['interesting', 'amusing'], pos: ['i-adjective'], seq: 1507740, cat: 'adjectives' },
    { kanji: '忙しい', kana: 'いそがしい', meanings: ['busy', 'occupied'], pos: ['i-adjective'], seq: 1501720, cat: 'adjectives' },
  ];

  const l15VocabDocs = [];
  for (const v of l15Vocab) {
    const doc = await VocabEntry.findOneAndUpdate(
      { kana: v.kana, kanji: v.kanji, lessonId: l15._id },
      {
        $set: {
          kanji: v.kanji,
          meanings: v.meanings,
          partOfSpeech: v.pos,
          jmdictSeq: v.seq,
          thematicCategory: v.cat,
          jlptLevel: 'N5',
        },
      },
      { upsert: true, new: true }
    );
    l15VocabDocs.push(doc);
  }

  // L15.1 Examples: Affirmative 〜いです AND Negative 〜くないです
  const s151_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11501 },
    {
      $set: {
        japanese: 'この部屋はとても広くて新しいです。',
        furigana: 'このへやは とても ひろくて あたらしいです。',
        english: 'This room is very spacious and new (affirmative いです).',
        relatedGrammarId: l15g1._id,
        relatedVocabIds: [l15VocabDocs[4]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s151_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11502 },
    {
      $set: {
        japanese: 'この辞書は高くありません。',
        furigana: 'この じしょは たかくありません。',
        english: 'This dictionary is not expensive (negative くない / くありません).',
        relatedGrammarId: l15g1._id,
        relatedVocabIds: [l15VocabDocs[2]._id],
      },
    },
    { upsert: true, new: true }
  );

  // L15.2 Examples: Past Affirmative 〜かったです AND Past Negative 〜くなかったです
  const s152_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11503 },
    {
      $set: {
        japanese: '昨日の映画はとても面白かったです。',
        furigana: 'きのうの えいがは とても おもしろかったです。',
        english: "Yesterday's movie was very interesting (past affirmative かったです).",
        relatedGrammarId: l15g2._id,
        relatedVocabIds: [l15VocabDocs[14]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s152_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11504 },
    {
      $set: {
        japanese: '昨日は天気が良くなかったです。',
        furigana: 'きのうは てんきが よくなかったです。',
        english: 'The weather was not good yesterday (past negative くなかったです).',
        relatedGrammarId: l15g2._id,
        relatedVocabIds: [l15VocabDocs[6]._id],
      },
    },
    { upsert: true, new: true }
  );

  // L15.3 Examples: Direct Noun Modification
  const s153_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11505 },
    {
      $set: {
        japanese: 'おいしいお茶を飲みました。',
        furigana: 'おいしい おちゃを のみました。',
        english: 'I drank delicious Japanese green tea.',
        relatedGrammarId: l15g3._id,
        relatedVocabIds: [l15VocabDocs[12]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s153_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11506 },
    {
      $set: {
        japanese: '古い本を読みます。',
        furigana: 'ふるい ほんを よみます。',
        english: 'I read an old book.',
        relatedGrammarId: l15g3._id,
        relatedVocabIds: [l15VocabDocs[5]._id],
      },
    },
    { upsert: true, new: true }
  );

  await GrammarPoint.findByIdAndUpdate(l15g1._id, { $set: { exampleSentenceIds: [s151_1._id, s151_2._id] } });
  await GrammarPoint.findByIdAndUpdate(l15g2._id, { $set: { exampleSentenceIds: [s152_1._id, s152_2._id] } });
  await GrammarPoint.findByIdAndUpdate(l15g3._id, { $set: { exampleSentenceIds: [s153_1._id, s153_2._id] } });

  // ====================================================
  // LESSON 16: Adjectival Nouns (な-Adjectives)
  // ====================================================
  const l16 = getLesson(16);
  const l16g1 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l16._id, order: 1 },
    {
      $set: {
        title: 'な-Adjectives as Clause Predicates (です / でした)',
        pattern: '[Noun] は [な-Adj stem] です / ではありません / でした',
        formation: 'Non-past affirmative: [Stem] です. Non-past negative: [Stem] ではありません / じゃありません. Past affirmative: [Stem] でした. Past negative: [Stem] ではありませんでした.',
        explanation: 'Adjectival nouns (な-adjectives) lack internal verb-like inflections. When serving as the predicate of a clause, their tense and polarity are carried entirely by the copula (です, ではありません / じゃありません, でした, ではありませんでした), conjugating identically to regular nouns.',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l16g2 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l16._id, order: 2 },
    {
      $set: {
        title: 'Direct Noun Modification with な-Adjectives (〜な + Noun)',
        pattern: '[な-Adj stem] + な + [Noun]',
        formation: 'Stem + な + Noun',
        explanation: 'When a な-adjective precedes and modifies a noun, the connector な must be inserted between the adjectival stem and the following noun (e.g. 静かな町 = quiet town, 有名な人 = famous person).',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l16g3 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l16._id, order: 3 },
    {
      $set: {
        title: 'Expressing Likes & Dislikes (好き / 嫌い)',
        pattern: '[Person] は [Target] が 好きです / 嫌いです',
        formation: 'Topic + は + Target Object + が + 好き / 嫌い + です',
        explanation: 'Because 好き (fond of) and 嫌い (averse to) are な-adjectives describing psychological states rather than transitive action verbs, the target being liked or disliked is marked by the subject particle が rather than を. To politely soften a negative feeling, say あまり好きではありません ("I do not like it very much") rather than blunt 嫌いです.',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l16Vocab = [
    { kanji: '静か', kana: 'しずか', meanings: ['quiet', 'peaceful'], pos: ['na-adjective'], seq: 1374520, cat: 'adjectives' },
    { kanji: '賑やか', kana: 'にぎやか', meanings: ['lively', 'bustling'], pos: ['na-adjective'], seq: 1470470, cat: 'adjectives' },
    { kanji: '有名', kana: 'ゆうめい', meanings: ['famous', 'well-known'], pos: ['na-adjective'], seq: 1544060, cat: 'adjectives' },
    { kanji: '親切', kana: 'しんせつ', meanings: ['kind', 'gentle', 'considerate'], pos: ['na-adjective'], seq: 1377850, cat: 'adjectives' },
    { kanji: '元気', kana: 'げんき', meanings: ['healthy', 'energetic', 'in good spirits'], pos: ['na-adjective'], seq: 1260670, cat: 'adjectives' },
    { kanji: '暇', kana: 'ひま', meanings: ['free time', 'not busy'], pos: ['na-adjective'], seq: 1517430, cat: 'adjectives' },
    { kanji: '便利', kana: 'べんり', meanings: ['convenient', 'handy'], pos: ['na-adjective'], seq: 1508680, cat: 'adjectives' },
    { kanji: '不便', kana: 'ふべん', meanings: ['inconvenient'], pos: ['na-adjective'], seq: 1501170, cat: 'adjectives' },
    { kanji: '綺麗', kana: 'きれい', meanings: ['pretty', 'clean', 'neat'], pos: ['na-adjective'], seq: 1598970, cat: 'adjectives' },
    { kanji: '好き', kana: 'すき', meanings: ['liked', 'favorite'], pos: ['na-adjective'], seq: 1309830, cat: 'adjectives' },
    { kanji: '嫌い', kana: 'きらい', meanings: ['disliked', 'hated'], pos: ['na-adjective'], seq: 1248060, cat: 'adjectives' },
    { kanji: '大好き', kana: 'だいすき', meanings: ['very fond of', 'beloved'], pos: ['na-adjective'], seq: 1385410, cat: 'adjectives' },
    { kanji: '大切', kana: 'たいせつ', meanings: ['important', 'precious', 'valuable'], pos: ['na-adjective'], seq: 1384070, cat: 'adjectives' },
    { kanji: '大丈夫', kana: 'だいじょうぶ', meanings: ['all right', 'okay', 'safe'], pos: ['na-adjective'], seq: 1384750, cat: 'adjectives' },
    { kanji: '簡単', kana: 'かんたん', meanings: ['simple', 'easy'], pos: ['na-adjective'], seq: 1201580, cat: 'adjectives' },
    { kanji: '大変', kana: 'たいへん', meanings: ['tough', 'difficult', 'hard'], pos: ['na-adjective'], seq: 1386220, cat: 'adjectives' },
  ];

  const l16VocabDocs = [];
  for (const v of l16Vocab) {
    const doc = await VocabEntry.findOneAndUpdate(
      { kana: v.kana, kanji: v.kanji, lessonId: l16._id },
      {
        $set: {
          kanji: v.kanji,
          meanings: v.meanings,
          partOfSpeech: v.pos,
          jmdictSeq: v.seq,
          thematicCategory: v.cat,
          jlptLevel: 'N5',
        },
      },
      { upsert: true, new: true }
    );
    l16VocabDocs.push(doc);
  }

  // L16.1 Examples: Affirmative です, Negative ではありません, and Past でした
  const s161_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11601 },
    {
      $set: {
        japanese: 'この町はとても静かです。',
        furigana: 'このまちは とても しずかです。',
        english: 'This town is very quiet (non-past affirmative です).',
        relatedGrammarId: l16g1._id,
        relatedVocabIds: [l16VocabDocs[0]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s161_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11602 },
    {
      $set: {
        japanese: 'この町は賑やかではありません。',
        furigana: 'このまちは にぎやかでは ありません。',
        english: 'This town is not bustling (non-past negative ではありません).',
        relatedGrammarId: l16g1._id,
        relatedVocabIds: [l16VocabDocs[1]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s161_3 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11603 },
    {
      $set: {
        japanese: '昨日のテストは簡単でした。',
        furigana: 'きのうの テストは かんたんでした。',
        english: "Yesterday's test was simple and easy (past でした).",
        relatedGrammarId: l16g1._id,
        relatedVocabIds: [l16VocabDocs[14]._id],
      },
    },
    { upsert: true, new: true }
  );

  // L16.2 Examples: Direct Noun Modification (〜な + Noun)
  const s162_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11604 },
    {
      $set: {
        japanese: '京都の有名な寺を訪れました。',
        furigana: 'きょうとの ゆうめいな てらを おとずれました。',
        english: 'I visited a famous temple in Kyoto.',
        relatedGrammarId: l16g2._id,
        relatedVocabIds: [l16VocabDocs[2]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s162_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11605 },
    {
      $set: {
        japanese: '親切な友達に会いました。',
        furigana: 'しんせつな ともだちに あいました。',
        english: 'I met a kind friend.',
        relatedGrammarId: l16g2._id,
        relatedVocabIds: [l16VocabDocs[3]._id],
      },
    },
    { upsert: true, new: true }
  );

  // L16.3 Examples: Likes 好きです AND Dislikes 嫌いです
  const s163_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11606 },
    {
      $set: {
        japanese: '私は日本のアニメが好きです。',
        furigana: 'わたしは にほんの アニメが すきです。',
        english: 'I like Japanese anime (好きです).',
        relatedGrammarId: l16g3._id,
        relatedVocabIds: [l16VocabDocs[9]._id, l16VocabDocs[11]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s163_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11607 },
    {
      $set: {
        japanese: '弟は野菜が嫌いです。',
        furigana: 'おとうとは やさいが きらいです。',
        english: 'My younger brother dislikes vegetables (嫌いです).',
        relatedGrammarId: l16g3._id,
        relatedVocabIds: [l16VocabDocs[10]._id],
      },
    },
    { upsert: true, new: true }
  );

  await GrammarPoint.findByIdAndUpdate(l16g1._id, { $set: { exampleSentenceIds: [s161_1._id, s161_2._id, s161_3._id] } });
  await GrammarPoint.findByIdAndUpdate(l16g2._id, { $set: { exampleSentenceIds: [s162_1._id, s162_2._id] } });
  await GrammarPoint.findByIdAndUpdate(l16g3._id, { $set: { exampleSentenceIds: [s163_1._id, s163_2._id] } });

  // ====================================================
  // LESSON 17: Comparisons & Degree (より, のほうが, 一番)
  // THEMATIC SET: 4 Seasons, Scope Nouns & Comparative Adverbs
  // ====================================================
  const l17 = getLesson(17);
  const l17g1 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l17._id, order: 1 },
    {
      $set: {
        title: 'Comparatives with より and のほうが (A is more ... than B)',
        pattern: '[Option A] のほうが [Option B] より [Adjective] です',
        formation: 'A + のほうが + B + より + Adjective + です (or B + より + A + のほうが...)',
        explanation: 'In Japanese comparisons, のほうが attaches to the side possessing greater intensity of the characteristic ("A is the one that is more..."), while より marks the benchmark of comparison ("than B"). The phrases may be reordered without changing meaning: [B] より [A] のほうが ...',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l17g2 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l17._id, order: 2 },
    {
      $set: {
        title: 'Comparison Inquiries (Between A and B, which is more ...?)',
        pattern: '[A] と [B] と どちらのほうが [Adjective] ですか',
        formation: 'A + と + B + と + どちらのほうが + Adjective + ですか',
        explanation: 'When asking a listener to compare two candidates, list each option with particle と, followed by the two-choice interrogative pronoun どちら (or informal どっち) and のほうが. The expected reply selects one side: [Chosen Option] のほうが [Adjective] です.',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l17g3 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l17._id, order: 3 },
    {
      $set: {
        title: 'Superlatives with 一番 and Degree Modifiers',
        pattern: '[Category / Scope] の中で [Option] が 一番 [Adjective] です',
        formation: 'Scope + の中で + Option + が + 一番 (ichiban) + Adjective + です',
        explanation: 'To declare the highest ranking member within a group or category of three or more, designate the domain using の中で ("within / among") and place 一番 directly before the adjective. Degree adverbs such as とても (very), 少し (a little), ずっと (by far), and 全然 / あまり (not at all / not very) modify the descriptive force.',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  // Thematically Cohesive Vocab: All 4 Seasons (春, 夏, 秋, 冬), Scope Nouns (日本, 世界, 季節), and Comparative Words
  const l17Vocab = [
    { kanji: 'より', kana: 'より', meanings: ['than', 'rather than'], pos: ['particle'], seq: 1549420, cat: 'grammar-words' },
    { kanji: 'どちら', kana: 'どちら', meanings: ['which (of two)', 'which way'], pos: ['pronoun'], seq: 1008680, cat: 'question-words' },
    { kanji: '一番', kana: 'いちばん', meanings: ['most', 'first', 'number one'], pos: ['adverb'], seq: 1157140, cat: 'adverbs' },
    { kanji: '日本', kana: 'にほん', meanings: ['Japan'], pos: ['noun'], seq: 1459460, cat: 'nouns' },
    { kanji: 'とても', kana: 'とても', meanings: ['very', 'exceedingly'], pos: ['adverb'], seq: 1008640, cat: 'adverbs' },
    { kanji: '少し', kana: 'すこし', meanings: ['a little', 'a few', 'slightly'], pos: ['adverb'], seq: 1329610, cat: 'adverbs' },
    { kanji: 'ずっと', kana: 'ずっと', meanings: ['by far', 'much more', 'all along'], pos: ['adverb'], seq: 1006740, cat: 'adverbs' },
    { kanji: 'あまり', kana: 'あまり', meanings: ['not very (with neg)', 'not much'], pos: ['adverb'], seq: 1000310, cat: 'adverbs' },
    { kanji: '全然', kana: 'ぜんぜん', meanings: ['not at all (with neg)', 'completely'], pos: ['adverb'], seq: 1376820, cat: 'adverbs' },
    { kanji: 'どちらも', kana: 'どちらも', meanings: ['both', 'either'], pos: ['pronoun'], seq: 1008690, cat: 'grammar-words' },
    { kanji: '世界', kana: 'せかい', meanings: ['world', 'society'], pos: ['noun'], seq: 1371070, cat: 'nouns' },
    { kanji: '季節', kana: 'きせつ', meanings: ['season'], pos: ['noun'], seq: 1213030, cat: 'nouns' },
    { kanji: '春', kana: 'はる', meanings: ['spring', 'springtime'], pos: ['noun'], seq: 1325170, cat: 'time' },
    { kanji: '夏', kana: 'なつ', meanings: ['summer'], pos: ['noun'], seq: 1174620, cat: 'time' },
    { kanji: '秋', kana: 'あき', meanings: ['autumn', 'fall'], pos: ['noun'], seq: 1325160, cat: 'time' },
    { kanji: '冬', kana: 'ふゆ', meanings: ['winter'], pos: ['noun'], seq: 1478230, cat: 'time' },
  ];

  const l17VocabDocs = [];
  for (const v of l17Vocab) {
    const doc = await VocabEntry.findOneAndUpdate(
      { kana: v.kana, kanji: v.kanji, lessonId: l17._id },
      {
        $set: {
          kanji: v.kanji,
          meanings: v.meanings,
          partOfSpeech: v.pos,
          jmdictSeq: v.seq,
          thematicCategory: v.cat,
          jlptLevel: 'N5',
        },
      },
      { upsert: true, new: true }
    );
    l17VocabDocs.push(doc);
  }

  // Remove any obsolete vocab in Lesson 17 not in the current cohesive set
  await VocabEntry.deleteMany({
    lessonId: l17._id,
    kanji: { $nin: l17Vocab.map((v) => v.kanji) },
  });

  // L17.1 Examples: Comparatives with より and のほうが
  const s171_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11701 },
    {
      $set: {
        japanese: '飛行機のほうが電車よりずっと速いです。',
        furigana: 'ひこうきの ほうが でんしゃより ずっと はやいです。',
        english: 'Airplanes are much faster than trains.',
        relatedGrammarId: l17g1._id,
        relatedVocabIds: [l17VocabDocs[0]._id, l17VocabDocs[6]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s171_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11702 },
    {
      $set: {
        japanese: '今日は昨日より少し寒いです。',
        furigana: 'きょうは きのうより すこし さむいです。',
        english: 'Today is a little colder than yesterday.',
        relatedGrammarId: l17g1._id,
        relatedVocabIds: [l17VocabDocs[0]._id, l17VocabDocs[5]._id],
      },
    },
    { upsert: true, new: true }
  );

  // L17.2 Examples: Comparison Inquiries (Question AND Answer)
  const s172_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11703 },
    {
      $set: {
        japanese: '夏と冬と、どちらのほうが好きですか。',
        furigana: 'なつと ふゆと、どちらの ほうが すきですか。',
        english: 'Between summer and winter, which do you like more? (inquiry)',
        relatedGrammarId: l17g2._id,
        relatedVocabIds: [l17VocabDocs[1]._id, l17VocabDocs[13]._id, l17VocabDocs[15]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s172_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11704 },
    {
      $set: {
        japanese: '冬のほうが好きです。',
        furigana: 'ふゆの ほうが すきです。',
        english: 'I like winter more (response).',
        relatedGrammarId: l17g2._id,
        relatedVocabIds: [l17VocabDocs[15]._id],
      },
    },
    { upsert: true, new: true }
  );

  // L17.3 Examples: Superlatives with 一番
  const s173_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11705 },
    {
      $set: {
        japanese: '一年の中で春が一番好きです。',
        furigana: 'いちねんの なかで はるが いちばん すきです。',
        english: 'Within the entire year, I like spring the best.',
        relatedGrammarId: l17g3._id,
        relatedVocabIds: [l17VocabDocs[2]._id, l17VocabDocs[12]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s173_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11706 },
    {
      $set: {
        japanese: '世界の中で日本が一番面白いです。',
        furigana: 'せかいの なかで にほんが いちばん おもしろいです。',
        english: 'In the world, Japan is the most interesting.',
        relatedGrammarId: l17g3._id,
        relatedVocabIds: [l17VocabDocs[2]._id, l17VocabDocs[3]._id, l17VocabDocs[10]._id],
      },
    },
    { upsert: true, new: true }
  );

  await GrammarPoint.findByIdAndUpdate(l17g1._id, { $set: { exampleSentenceIds: [s171_1._id, s171_2._id] } });
  await GrammarPoint.findByIdAndUpdate(l17g2._id, { $set: { exampleSentenceIds: [s172_1._id, s172_2._id] } });
  await GrammarPoint.findByIdAndUpdate(l17g3._id, { $set: { exampleSentenceIds: [s173_1._id, s173_2._id] } });

  console.log('✓ Unit 3 lessons (15-17), grammar points, and Tatoeba pairs seeded successfully.');
}

// Unit 4: The Linking Engine (て-Form) (Lessons 18-21)
async function seedUnit4(lessonDocs) {
  console.log('Seeding Unit 4 (Lessons 18-21: Verb Groups, Te-Form, Te-Iru, Requests/Permissions)...');

  const l18 = lessonDocs[18];
  const l19 = lessonDocs[19];
  const l20 = lessonDocs[20];
  const l21 = lessonDocs[21];

  // ==========================================
  // LESSON 18: Verb Classification & Dictionary Roots
  // ==========================================
  const l18g1 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l18._id, order: 1 },
    {
      $set: {
        title: 'The 3 Verb Groups (Ichidan, Godan, and Irregular)',
        pattern: '[Ichidan (-iru/-eru)] / [Godan (non-る, -aru/-uru/-oru, or exceptions)] / [Irregular (する/くる)]',
        formation: 'Group 1 (Godan): ends in non-る or -aru/-uru/-oru + 5 sneaky -iru/-eru exceptions (帰る, 入る, 走る, 知る, 切る). Group 2 (Ichidan): ends in -iru or -eru. Group 3 (Irregular): する and くる.',
        explanation: 'Japanese verbs are classified into three distinct inflectional categories that dictate every subsequent conjugation rule (polite stems, te-form, past tense, and negative forms).\\n\\n1. Group 1 (Godan / U-verbs): The largest verb group.\\n- Every verb that ends in a syllable other than る (う, く, ぐ, す, つ, ぬ, ぶ, む) is ALWAYS (100%) a Godan verb (e.g. 飲む, 書く, 話す, 待つ, 買う, 呼ぶ, 泳ぐ).\\n- Any verb ending in る preceded by an /a/, /u/, or /o/ vowel sound (あ・う・お段 + る) is also 100% Godan (e.g. わかる /wak-a-ru/, 作る /tsukur-u/, 取る /t-o-ru/).\\n- Sneaky exceptions: A small list of common verbs end in an /i/ or /e/ sound before る, but conjugate as Godan. The 5 most essential to memorize are: 帰る (かえる - to return/go home), 入る (はいる - to enter), 走る (はしる - to run), 知る (しる - to know), and 切る (きる - to cut).\\n\\n2. Group 2 (Ichidan / Ru-verbs):\\n- Verbs ending in -iru or -eru (い・え段 + る) such as 食べる (たべる), 見る (みる), 起きる (おきる), 寝る (ねる), 覚える (おぼえる). Their base stem is completely stable (drop る to conjugate).\\n\\n3. Group 3 (Irregular Verbs):\\n- There are only two irregular verbs in the entire Japanese language: する (to do) and 来る (くる - to come). Compound verbs built with する (e.g. 勉強する, 散歩する, 結婚する) also follow Group 3.',
        notes: 'Foolproof identification flowchart:\\nStep 1: Does the dictionary form end in る?\\n  -> NO: 100% Godan (u-verb).\\n  -> YES: Look at the vowel sound directly before る.\\nStep 2: Is the preceding vowel /a/, /u/, or /o/?\\n  -> YES: 100% Godan (u-verb).\\n  -> NO (it is /i/ or /e/): It is Ichidan (ru-verb), UNLESS it is one of the 5 sneaky exceptions (帰る, 入る, 走る, 知る, 切る).',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l18g2 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l18._id, order: 2 },
    {
      $set: {
        title: 'Dictionary Form (辞書形) vs. Polite Stem (ます形)',
        pattern: '[Ichidan]: Root (drop る) + ます / ません | [Godan]: Final -u → -i + ます / ません | [Irregular]: する → します / くる → きます',
        formation: 'Ichidan: drop る + ます. Godan: shift final syllable from u-row to i-row (う→い, く→き, す→し, つ→ち, ぬ→に, む→み, る→り) + ます. Irregular: する→します, くる→きます.',
        explanation: 'The dictionary form (辞書形) is the plain, uninflected root found in dictionaries and used in casual speech. The polite ます-form is constructed systematically from the verb stem based on its group:\\n- For Ichidan verbs, the root never changes: simply delete the final る and attach ます (affirmative) or ません (negative). Example: 食べる → 食べます / 食べません.\\n- For Godan verbs, the final consonant takes the "i" vowel row: 書く → 書きます, 飲む → 飲みます, 話す → 話します, 買う → 買います.\\n- Irregular verbs change stems: する becomes し (します / しません), and 来る (くる) shifts its vowel to き (きます / きません).',
        notes: 'Common mistake: Do not add り to an Ichidan verb (*食べります is wrong) and do not drop the final consonant of a Godan verb (*飲ます is wrong).',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l18Vocab = [
    { kanji: '食べる', kana: 'たべる', meanings: ['to eat'], pos: ['ichidan verb'], seq: 1358280, cat: 'verbs' },
    { kanji: '見る', kana: 'みる', meanings: ['to see', 'to watch', 'to look'], pos: ['ichidan verb'], seq: 1539210, cat: 'verbs' },
    { kanji: '起きる', kana: 'おきる', meanings: ['to get up', 'to wake up'], pos: ['ichidan verb'], seq: 1204090, cat: 'verbs' },
    { kanji: '寝る', kana: 'ねる', meanings: ['to sleep', 'to go to bed'], pos: ['ichidan verb'], seq: 1419730, cat: 'verbs' },
    { kanji: '飲む', kana: 'のむ', meanings: ['to drink'], pos: ['godan verb'], seq: 1464600, cat: 'verbs' },
    { kanji: '書く', kana: 'かく', meanings: ['to write', 'to draw'], pos: ['godan verb'], seq: 1324460, cat: 'verbs' },
    { kanji: '読む', kana: 'よむ', meanings: ['to read'], pos: ['godan verb'], seq: 1500210, cat: 'verbs' },
    { kanji: '話す', kana: 'はなす', meanings: ['to speak', 'to talk'], pos: ['godan verb'], seq: 1539190, cat: 'verbs' },
    { kanji: '聞く', kana: 'きく', meanings: ['to listen', 'to hear', 'to ask'], pos: ['godan verb'], seq: 1538390, cat: 'verbs' },
    { kanji: '行く', kana: 'いく', meanings: ['to go'], pos: ['godan verb'], seq: 1224210, cat: 'verbs' },
    { kanji: '買う', kana: 'かう', meanings: ['to buy', 'to purchase'], pos: ['godan verb'], seq: 1300950, cat: 'verbs' },
    { kanji: '待つ', kana: 'まつ', meanings: ['to wait'], pos: ['godan verb'], seq: 1512400, cat: 'verbs' },
    { kanji: '帰る', kana: 'かえる', meanings: ['to return', 'to go home'], pos: ['godan verb'], seq: 1207600, cat: 'verbs' },
    { kanji: '入る', kana: 'はいる', meanings: ['to enter', 'to go into'], pos: ['godan verb'], seq: 1459200, cat: 'verbs' },
    { kanji: 'する', kana: 'する', meanings: ['to do'], pos: ['irregular verb'], seq: 1157170, cat: 'verbs' },
    { kanji: '来る', kana: 'くる', meanings: ['to come'], pos: ['irregular verb'], seq: 1547400, cat: 'verbs' },
  ];

  const l18VocabDocs = [];
  for (const v of l18Vocab) {
    const doc = await VocabEntry.findOneAndUpdate(
      { kana: v.kana, kanji: v.kanji, lessonId: l18._id },
      {
        $set: {
          kanji: v.kanji,
          meanings: v.meanings,
          partOfSpeech: v.pos,
          jmdictSeq: v.seq,
          thematicCategory: v.cat,
          jlptLevel: 'N5',
        },
      },
      { upsert: true, new: true }
    );
    l18VocabDocs.push(doc);
  }

  await VocabEntry.deleteMany({
    lessonId: l18._id,
    kanji: { $nin: l18Vocab.map((v) => v.kanji) },
  });

  // L18.1 Examples: Verb Classification (Ichidan, Godan, and Irregular/Exception)
  const s181_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11801 },
    {
      $set: {
        japanese: '朝ご飯にパンと卵を食べます。',
        furigana: 'あさごはんに パンと たまごを たべます。',
        english: 'I eat bread and eggs for breakfast (Ichidan verb 食べる: drop る → 食べます).',
        relatedGrammarId: l18g1._id,
        relatedVocabIds: [l18VocabDocs[0]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s181_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11802 },
    {
      $set: {
        japanese: '図書館で友だちに手紙を書きます。',
        furigana: 'としょかんで ともだちに てがみを かきます。',
        english: 'I write letters to a friend at the library (Godan verb 書く: stem く → き).',
        relatedGrammarId: l18g1._id,
        relatedVocabIds: [l18VocabDocs[5]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s181_3 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11803 },
    {
      $set: {
        japanese: '夕方五時に家へ帰ります。',
        furigana: 'ゆうがた ごじに いえへ かえります。',
        english: 'I return home at 5:00 in the evening (Sneaky Godan exception 帰る: かえる → かえります).',
        relatedGrammarId: l18g1._id,
        relatedVocabIds: [l18VocabDocs[12]._id],
      },
    },
    { upsert: true, new: true }
  );

  // L18.2 Examples: Dictionary vs. Masu Stems
  const s182_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11804 },
    {
      $set: {
        japanese: '夜十時半に寝ます。',
        furigana: 'よる じゅうじはんに ねます。',
        english: 'I go to bed at 10:30 at night (Ichidan stem: 寝る → 寝ます).',
        relatedGrammarId: l18g2._id,
        relatedVocabIds: [l18VocabDocs[3]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s182_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11805 },
    {
      $set: {
        japanese: '日本語の新聞を読みます。',
        furigana: 'にほんごの しんぶんを よみます。',
        english: 'I read Japanese newspapers (Godan stem: 読む → 読みます).',
        relatedGrammarId: l18g2._id,
        relatedVocabIds: [l18VocabDocs[6]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s182_3 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11806 },
    {
      $set: {
        japanese: '明日、友だちがうちに遊びに来ます。',
        furigana: 'あした、ともだちが うちに あそびに きます。',
        english: 'Tomorrow, a friend is coming over to my house to hang out (Irregular stem: 来る → 来ます).',
        relatedGrammarId: l18g2._id,
        relatedVocabIds: [l18VocabDocs[15]._id],
      },
    },
    { upsert: true, new: true }
  );

  await GrammarPoint.findByIdAndUpdate(l18g1._id, { $set: { exampleSentenceIds: [s181_1._id, s181_2._id, s181_3._id] } });
  await GrammarPoint.findByIdAndUpdate(l18g2._id, { $set: { exampleSentenceIds: [s182_1._id, s182_2._id, s182_3._id] } });

  // ==========================================
  // LESSON 19: The Conjunctive て-Form
  // ==========================================
  const l19g1 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l19._id, order: 1 },
    {
      $set: {
        title: 'The て-Form Conjugation Rules (Sound Changes by Ending)',
        pattern: '[Ichidan]: drop る + て | [Godan う・つ・る]: って | [Godan む・ぶ・ぬ]: んで | [Godan く・ぐ]: いて / いで (行く→行って) | [Godan す]: して | [Irregular]: して / きて',
        formation: 'Detailed sound changes: (1) Ichidan: -る → -て. (2) Godan -う/-つ/-る → -って. (3) Godan -む/-ぶ/-ぬ → -んで. (4) Godan -く → -いて (Exception: 行く → 行って). (5) Godan -ぐ → -いで. (6) Godan -す → -して. (7) Irregular: する → して, くる → きて.',
        explanation: 'The て-form is Japanese\'s central verbal connector. Because pronouncing rapid consecutive consonants was phonetically difficult, classical Japanese underwent sound smoothing (音便 onbin). Each verb ending follows a distinct rule:\\n1. Ichidan: effortless drop る + て (食べる → 食べて, 見る → 見て, 借りる → 借りて).\\n2. Godan ending in う, つ, or る: compress into a small tsu glottal stop って (会う → 会って, 待つ → 待って, 取る → 取って, 立つ → 立って, 座る → 座って).\\n3. Godan ending in nasal む, ぶ, or ぬ: become voiced んで (飲む → 飲んで, 遊ぶ → 游んで, 呼ぶ → 呼んで, 死ぬ → 死んで).\\n4. Godan ending in く: becomes いて (書く → 書いて, 歩く → 歩いて). CRITICAL EXCEPTION: The verb 行く (to go) does not become *いいて; it becomes 行って (いって).\\n5. Godan ending in ぐ: voiced counterpart of く, becomes voiced いで (泳ぐ → 泳いで, 急ぐ → 急いで).\\n6. Godan ending in す: becomes して (話す → 話して, 貸す → 貸して, 出す → 出して).\\n7. Irregular verbs: する becomes して, and 来る (くる) becomes 来て (きて).',
        notes: 'Crucial memory rule: Remember that 行く (iku) is an irregular phonetic exception and always becomes 行って (itte), never *いいて. Also remember that む and ぶ endings produce voiced んで, not って.',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l19g2 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l19._id, order: 2 },
    {
      $set: {
        title: 'Connecting Sequential Actions with 〜て (V1-て + V2)',
        pattern: '[Verb 1 て-form]、[Verb 2 て-form]、... [Final Predicate]',
        formation: 'Verb 1 (て-form) + Verb 2 (て-form) + Verb 3 (carries sentence tense and politeness).',
        explanation: 'The て-form connects multiple verbal clauses in chronological succession ("did V1, and then did V2"). Only the very final verb of the entire sentence receives conjugation for tense (past/present) and politeness (plain/polite). All preceding verbs remain in their invariant neutral て-form. It also expresses causal connections where the first action naturally leads to the second.',
        notes: 'Common mistake: Do not put earlier verbs in past tense with と or そして (*起きましたそして朝ご飯を食べました is unnatural and incorrect). Preceding verbs must be in て-form.',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l19Vocab = [
    { kanji: '洗う', kana: 'あらう', meanings: ['to wash'], pos: ['godan verb'], seq: 1391920, cat: 'verbs' },
    { kanji: '会う', kana: 'あう', meanings: ['to meet', 'to see (a person)'], pos: ['godan verb'], seq: 1215230, cat: 'verbs' },
    { kanji: '立つ', kana: 'たつ', meanings: ['to stand up', 'to rise'], pos: ['godan verb'], seq: 1503710, cat: 'verbs' },
    { kanji: '座る', kana: 'すわる', meanings: ['to sit down'], pos: ['godan verb'], seq: 1319770, cat: 'verbs' },
    { kanji: '取る', kana: 'とる', meanings: ['to take', 'to pick up', 'to pass'], pos: ['godan verb'], seq: 1324700, cat: 'verbs' },
    { kanji: '呼ぶ', kana: 'よぶ', meanings: ['to call out', 'to summon', 'to invite'], pos: ['godan verb'], seq: 1251910, cat: 'verbs' },
    { kanji: '遊ぶ', kana: 'あそぶ', meanings: ['to play', 'to hang out', 'to enjoy oneself'], pos: ['godan verb'], seq: 1532130, cat: 'verbs' },
    { kanji: '歩く', kana: 'あるく', meanings: ['to walk'], pos: ['godan verb'], seq: 1503250, cat: 'verbs' },
    { kanji: '泳ぐ', kana: 'およぐ', meanings: ['to swim'], pos: ['godan verb'], seq: 1438960, cat: 'verbs' },
    { kanji: '急ぐ', kana: 'いそぐ', meanings: ['to hurry', 'to rush'], pos: ['godan verb'], seq: 1216650, cat: 'verbs' },
    { kanji: '出す', kana: 'だす', meanings: ['to take out', 'to hand in', 'to submit'], pos: ['godan verb'], seq: 1324540, cat: 'verbs' },
    { kanji: '借りる', kana: 'かりる', meanings: ['to borrow'], pos: ['ichidan verb'], seq: 1301980, cat: 'verbs' },
    { kanji: '貸す', kana: 'かす', meanings: ['to lend'], pos: ['godan verb'], seq: 1301990, cat: 'verbs' },
    { kanji: '開ける', kana: 'あける', meanings: ['to open (transitive)'], pos: ['ichidan verb'], seq: 1205310, cat: 'verbs' },
    { kanji: '閉める', kana: 'しめる', meanings: ['to close (transitive)'], pos: ['ichidan verb'], seq: 1396340, cat: 'verbs' },
    { kanji: 'そして', kana: 'そして', meanings: ['and then', 'and'], pos: ['conjunction'], seq: 1007130, cat: 'conjunctions' },
  ];

  const l19VocabDocs = [];
  for (const v of l19Vocab) {
    const doc = await VocabEntry.findOneAndUpdate(
      { kana: v.kana, kanji: v.kanji, lessonId: l19._id },
      {
        $set: {
          kanji: v.kanji,
          meanings: v.meanings,
          partOfSpeech: v.pos,
          jmdictSeq: v.seq,
          thematicCategory: v.cat,
          jlptLevel: 'N5',
        },
      },
      { upsert: true, new: true }
    );
    l19VocabDocs.push(doc);
  }

  await VocabEntry.deleteMany({
    lessonId: l19._id,
    kanji: { $nin: l19Vocab.map((v) => v.kanji) },
  });

  // L19.1 Examples: Te-form Sound Shifts
  const s191_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11901 },
    {
      $set: {
        japanese: '急いで駅へ行って、電車を待った。',
        furigana: 'いそいで えきへ いって、でんしゃを まった。',
        english: 'I hurried to the station and waited for the train (ぐ→いで, く-exception→って, つ→って).',
        relatedGrammarId: l19g1._id,
        relatedVocabIds: [l19VocabDocs[9]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s191_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11902 },
    {
      $set: {
        japanese: '公園で友だちと遊んで、カフェでお茶を飲んだ。',
        furigana: 'こうえんで ともだちと あそんで、カフェで おちゃを のんだ。',
        english: 'I hung out with friends at the park and drank tea at the cafe (ぶ→んで, む→んで).',
        relatedGrammarId: l19g1._id,
        relatedVocabIds: [l19VocabDocs[6]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s191_3 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11903 },
    {
      $set: {
        japanese: '先生と教室で話して、宿題を出しました。',
        furigana: 'せんせいと きょうしつで はなして、しゅくだいを だしました。',
        english: 'I spoke with the teacher in the classroom and handed in homework (す→して).',
        relatedGrammarId: l19g1._id,
        relatedVocabIds: [l19VocabDocs[10]._id],
      },
    },
    { upsert: true, new: true }
  );

  // L19.2 Examples: Sequential Actions
  const s192_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11904 },
    {
      $set: {
        japanese: '今朝は六時に起きて、顔を洗って、学校へ行きました。',
        furigana: 'けさは ろくじに おきて、かおを あらって、がっこうへ いきました。',
        english: 'This morning I woke up at 6:00, washed my face, and went to school (chronological sequence).',
        relatedGrammarId: l19g2._id,
        relatedVocabIds: [l19VocabDocs[0]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s192_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 11905 },
    {
      $set: {
        japanese: '図書館で本を借りて、家でゆっくり読みます。',
        furigana: 'としょかんで ほんを かりて、いえで ゆっくり よみます。',
        english: 'I will borrow a book from the library and read it leisurely at home.',
        relatedGrammarId: l19g2._id,
        relatedVocabIds: [l19VocabDocs[11]._id],
      },
    },
    { upsert: true, new: true }
  );

  await GrammarPoint.findByIdAndUpdate(l19g1._id, { $set: { exampleSentenceIds: [s191_1._id, s191_2._id, s191_3._id] } });
  await GrammarPoint.findByIdAndUpdate(l19g2._id, { $set: { exampleSentenceIds: [s192_1._id, s192_2._id] } });

  // ==========================================
  // LESSON 20: Ongoing Actions & Resulting States
  // ==========================================
  const l20g1 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l20._id, order: 1 },
    {
      $set: {
        title: 'Action in Progress (〜ている with Dynamic Action Verbs)',
        pattern: '[Action Verb て-form] + いる (Plain) / います (Polite) / いない (Plain Neg) / いません (Polite Neg)',
        formation: 'Dynamic Action Verb (て-form) + いる / います / いない / いません',
        explanation: 'When 〜ている attaches to dynamic action verbs that take time to perform (動作動詞, such as 食べる, 飲む, 読む, 書く, 勉強する, 働く), it describes an ongoing progressive activity occurring right at the reference moment ("is currently doing...").\\n- Affirmative: 読んでいます (is reading) / 食べています (is eating).\\n- Negative: 読んでいません (is not reading) / 食べていません (is not eating).',
        notes: 'Distinction: Only use this progressive meaning for actions with continuous duration. Do not use the dictionary form to describe what someone is actively doing right now.',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l20g2 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l20._id, order: 2 },
    {
      $set: {
        title: 'Resulting State & Durable Condition (〜ている with Change-of-State Verbs)',
        pattern: '[Change-of-State Verb て-form] + いる (Plain) / います (Polite)',
        formation: 'Instantaneous/Punctual Verb (て-form) + いる / います',
        explanation: 'When 〜ている attaches to verbs that describe a momentary change of state or instantaneous transition (変化動詞 / 瞬間動詞), it DOES NOT mean the action is currently taking place. Instead, it signifies that the change occurred in the past and the resulting state persists continuously in the present:\\n- 住む (to take up residence) → 住んでいる (lives / resides, resulting state of having moved in).\\n- 知る (to come to know) → 知っている (knows, state of possessing knowledge).\\n- 持つ (to take hold of) → 持っている (has / owns, state of possession).\\n- 結婚する (to wed) → 結婚している (is married, state of being wed).\\n- 着る (to put on clothes) → 着ている (is wearing, state of having dressed).',
        notes: 'Common mistake: Translating 住んでいる as "is living right now" or 結婚している as "is getting married right now". Also critical: The negative of 知っています is 知りません (NEVER *知っていません).',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l20Vocab = [
    { kanji: '住む', kana: 'すむ', meanings: ['to live', 'to reside', 'to inhabit'], pos: ['godan verb'], seq: 1322040, cat: 'verbs' },
    { kanji: '知る', kana: 'しる', meanings: ['to know', 'to be aware of'], pos: ['godan verb'], seq: 1403210, cat: 'verbs' },
    { kanji: '持つ', kana: 'もつ', meanings: ['to hold', 'to possess', 'to carry'], pos: ['godan verb'], seq: 1324900, cat: 'verbs' },
    { kanji: '働く', kana: 'はたらく', meanings: ['to work', 'to labor'], pos: ['godan verb'], seq: 1475730, cat: 'verbs' },
    { kanji: '覚える', kana: 'おぼえる', meanings: ['to memorize', 'to remember'], pos: ['ichidan verb'], seq: 1202860, cat: 'verbs' },
    { kanji: '忘れる', kana: 'わすれる', meanings: ['to forget', 'to leave behind'], pos: ['ichidan verb'], seq: 1544430, cat: 'verbs' },
    { kanji: '着る', kana: 'きる', meanings: ['to wear (upper body)', 'to put on'], pos: ['ichidan verb'], seq: 1361530, cat: 'verbs' },
    { kanji: '履く', kana: 'はく', meanings: ['to wear (lower body/shoes)'], pos: ['godan verb'], seq: 1478050, cat: 'verbs' },
    { kanji: '結婚', kana: 'けっこん', meanings: ['marriage', 'wedding'], pos: ['noun', 'suru verb'], seq: 1247070, cat: 'nouns' },
    { kanji: '独身', kana: 'どくしん', meanings: ['single', 'unmarried'], pos: ['noun'], seq: 1441710, cat: 'nouns' },
    { kanji: '住所', kana: 'じゅうしょ', meanings: ['address', 'residence'], pos: ['noun'], seq: 1322060, cat: 'nouns' },
    { kanji: '電話', kana: 'でんわ', meanings: ['telephone', 'phone call'], pos: ['noun', 'suru verb'], seq: 1435270, cat: 'nouns' },
    { kanji: '番号', kana: 'ばんごう', meanings: ['number', 'series of digits'], pos: ['noun'], seq: 1481970, cat: 'nouns' },
    { kanji: '会社', kana: 'かいしゃ', meanings: ['company', 'workplace'], pos: ['noun'], seq: 1215160, cat: 'nouns' },
    { kanji: 'アパート', kana: 'アパート', meanings: ['apartment', 'flat'], pos: ['noun'], seq: 1017360, cat: 'loanwords' },
    { kanji: 'まだ', kana: 'まだ', meanings: ['still', 'as yet (with neg: not yet)'], pos: ['adverb'], seq: 1012350, cat: 'adverbs' },
  ];

  const l20VocabDocs = [];
  for (const v of l20Vocab) {
    const doc = await VocabEntry.findOneAndUpdate(
      { kana: v.kana, kanji: v.kanji, lessonId: l20._id },
      {
        $set: {
          kanji: v.kanji,
          meanings: v.meanings,
          partOfSpeech: v.pos,
          jmdictSeq: v.seq,
          thematicCategory: v.cat,
          jlptLevel: 'N5',
        },
      },
      { upsert: true, new: true }
    );
    l20VocabDocs.push(doc);
  }

  await VocabEntry.deleteMany({
    lessonId: l20._id,
    kanji: { $nin: l20Vocab.map((v) => v.kanji) },
  });

  // L20.1 Examples: Progressive Actions (Affirmative & Negative)
  const s201_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 12001 },
    {
      $set: {
        japanese: '田中さんは今、部屋で日本語を勉強しています。',
        furigana: 'たなかさんは いま、へやで にほんごを べんきょうしています。',
        english: 'Tanaka-san is studying Japanese in the room right now (affirmative progressive 〜ています).',
        relatedGrammarId: l20g1._id,
        relatedVocabIds: [l20VocabDocs[3]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s201_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 12002 },
    {
      $set: {
        japanese: '山田さんはまだ昼ご飯を食べていません。',
        furigana: 'やまださんは まだ ひるごはんを たべていません。',
        english: 'Yamada-san is not eating lunch yet (negative progressive 〜ていません).',
        relatedGrammarId: l20g1._id,
        relatedVocabIds: [l20VocabDocs[15]._id],
      },
    },
    { upsert: true, new: true }
  );

  // L20.2 Examples: Resulting States vs Negative Knowledge
  const s202_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 12003 },
    {
      $set: {
        japanese: '私は東京のアパートに住んでいて、車を持っています。',
        furigana: 'わたしは とうきょうの アパートに すんでいて、くるまを もっています。',
        english: 'I live in an apartment in Tokyo and have a car (persistent resulting states of residence and ownership).',
        relatedGrammarId: l20g2._id,
        relatedVocabIds: [l20VocabDocs[0]._id, l20VocabDocs[2]._id, l20VocabDocs[14]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s202_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 12004 },
    {
      $set: {
        japanese: 'あの人の名前を知っていますが、電話番号は知りません。',
        furigana: 'あのひとの なまえを しっていますが、でんわばんごうは しりません。',
        english: 'I know that person\'s name, but I do not know their phone number (contrast: 知っています vs negative 知りません).',
        relatedGrammarId: l20g2._id,
        relatedVocabIds: [l20VocabDocs[1]._id, l20VocabDocs[11]._id, l20VocabDocs[12]._id],
      },
    },
    { upsert: true, new: true }
  );

  await GrammarPoint.findByIdAndUpdate(l20g1._id, { $set: { exampleSentenceIds: [s201_1._id, s201_2._id] } });
  await GrammarPoint.findByIdAndUpdate(l20g2._id, { $set: { exampleSentenceIds: [s202_1._id, s202_2._id] } });

  // ==========================================
  // LESSON 21: Requests, Permissions & Prohibitions
  // ==========================================
  const l21g1 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l21._id, order: 1 },
    {
      $set: {
        title: 'Polite Requests with 〜てください (Affirmative & Negative)',
        pattern: '[Verb て-form] + ください (Affirmative) / [Verb ない-form] + でください (Negative)',
        formation: 'Affirmative: Verb (て-form) + ください. Negative: Verb (ない-form) + でください.',
        explanation: 'The polite, courteous way to ask or instruct someone to do something is [Verb て-form] + ください ("Please do...").\\nWhen asking someone NOT to perform an action, take the plain negative verb stem (〜ない) and add でください ("Please do not...").\\n- Affirmative: 書いてください (Please write), 開けてください (Please open).\\n- Negative: 入らないでください (Please do not enter), 忘れないでください (Please do not forget).',
        notes: 'Do not attach ください directly to dictionary form or stem (*書くください is incorrect; must be 書いてください).',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l21g2 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l21._id, order: 2 },
    {
      $set: {
        title: 'Asking & Granting Permission (〜てもいいですか / 〜てもいいです)',
        pattern: '[Inquiry]: [Verb て-form] + もいいですか | [Granting]: [Verb て-form] + もいいです (よ)',
        formation: 'Verb (て-form) + も + いいですか (May I...?) / も + いいです (You may...).',
        explanation: 'Literally means "even if [action] is performed, is it good?".\\n- To politely request permission to do something, use 〜てもいいですか ("May I / is it alright if I...?").\\n- To grant permission, respond with 〜てもいいです (often with particle よ: 〜てもいいですよ, "Yes, you may / feel free to...").',
        notes: 'Do not omit particle も (*座っていいですか is casual; in polite speech always include も: 座ってもいいですか).',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l21g3 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l21._id, order: 3 },
    {
      $set: {
        title: 'Prohibitions & Rules (〜てはいけません / 〜てはだめです)',
        pattern: '[Verb て-form] + はいけません (Polite) / はいけない (Plain) / はだめです (Conversational)',
        formation: 'Verb (て-form) + は (pronounced wa) + いけません / だめです.',
        explanation: 'Literally "as for doing [action], it cannot go forward / is improper". This expresses an authoritative prohibition, public regulation, or strict rule indicating that an action is forbidden ("must not / cannot / are not allowed to"):\\n- Polite standard: 話してはいけません (must not talk).\\n- Plain form: 吸ってはいけない (must not smoke).\\n- Conversational spoken form: 捨ててはだめです (no, you cannot throw that away here).',
        notes: 'Pronunciation: The particle は following て is pronounced "wa", not "ha". Also, because this pattern expresses strong authority or formal rules, use polite negative requests (〜ないでください) instead when asking someone gently.',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l21Vocab = [
    { kanji: 'お願い', kana: 'おねがい', meanings: ['request', 'favor', 'wish'], pos: ['noun', 'polite'], seq: 1207880, cat: 'polite' },
    { kanji: '写真', kana: 'しゃしん', meanings: ['photograph', 'picture'], pos: ['noun'], seq: 1318020, cat: 'nouns' },
    { kanji: '撮る', kana: 'とる', meanings: ['to take (a photo)'], pos: ['godan verb'], seq: 1324710, cat: 'verbs' },
    { kanji: 'タバコ', kana: 'タバコ', meanings: ['tobacco', 'cigarettes'], pos: ['noun'], seq: 1007880, cat: 'loanwords' },
    { kanji: '吸う', kana: 'すう', meanings: ['to smoke', 'to inhale', 'to suck'], pos: ['godan verb'], seq: 1251900, cat: 'verbs' },
    { kanji: '入口', kana: 'いりぐち', meanings: ['entrance', 'entryway'], pos: ['noun'], seq: 1459240, cat: 'nouns' },
    { kanji: '出口', kana: 'でぐち', meanings: ['exit', 'gateway'], pos: ['noun'], seq: 1324570, cat: 'nouns' },
    { kanji: '病院', kana: 'びょういん', meanings: ['hospital', 'clinic'], pos: ['noun'], seq: 1494630, cat: 'nouns' },
    { kanji: '美術館', kana: 'びじゅつかん', meanings: ['art museum', 'art gallery'], pos: ['noun'], seq: 1491740, cat: 'nouns' },
    { kanji: '静か', kana: 'しずか', meanings: ['quiet', 'peaceful'], pos: ['na-adjective'], seq: 1381370, cat: 'adjectives' },
    { kanji: '大声', kana: 'おおごえ', meanings: ['loud voice'], pos: ['noun'], seq: 1424750, cat: 'nouns' },
    { kanji: '窓', kana: 'まど', meanings: ['window'], pos: ['noun'], seq: 1414410, cat: 'nouns' },
    { kanji: 'ドア', kana: 'ドア', meanings: ['door (Western style)'], pos: ['noun'], seq: 1008770, cat: 'loanwords' },
    { kanji: '席', kana: 'せき', meanings: ['seat', 'place'], pos: ['noun'], seq: 1378350, cat: 'nouns' },
    { kanji: '荷物', kana: 'にもつ', meanings: ['luggage', 'baggage', 'package'], pos: ['noun'], seq: 1214050, cat: 'nouns' },
    { kanji: 'どうぞ', kana: 'どうぞ', meanings: ['please', 'go ahead', 'by all means'], pos: ['adverb'], seq: 1008580, cat: 'adverbs' },
  ];

  const l21VocabDocs = [];
  for (const v of l21Vocab) {
    const doc = await VocabEntry.findOneAndUpdate(
      { kana: v.kana, kanji: v.kanji, lessonId: l21._id },
      {
        $set: {
          kanji: v.kanji,
          meanings: v.meanings,
          partOfSpeech: v.pos,
          jmdictSeq: v.seq,
          thematicCategory: v.cat,
          jlptLevel: 'N5',
        },
      },
      { upsert: true, new: true }
    );
    l21VocabDocs.push(doc);
  }

  await VocabEntry.deleteMany({
    lessonId: l21._id,
    kanji: { $nin: l21Vocab.map((v) => v.kanji) },
  });

  // L21.1 Examples: Requests
  const s211_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 12101 },
    {
      $set: {
        japanese: 'ここに住所と電話番号を書いてください。',
        furigana: 'ここに じゅうしょと でんわばんごうを かいてください。',
        english: 'Please write your address and phone number here (affirmative request 〜てください).',
        relatedGrammarId: l21g1._id,
        relatedVocabIds: [l21VocabDocs[0]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s211_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 12102 },
    {
      $set: {
        japanese: 'この部屋には入らないでください。',
        furigana: 'この へやには はいらないでください。',
        english: 'Please do not enter this room (negative request 〜ないでください).',
        relatedGrammarId: l21g1._id,
        relatedVocabIds: [l21VocabDocs[5]._id],
      },
    },
    { upsert: true, new: true }
  );

  // L21.2 Examples: Permissions
  const s212_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 12103 },
    {
      $set: {
        japanese: 'この席に座ってもいいですか。',
        furigana: 'この せきに すわっても いいですか。',
        english: 'May I sit in this seat? (asking permission with 〜てもいいですか).',
        relatedGrammarId: l21g2._id,
        relatedVocabIds: [l21VocabDocs[13]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s212_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 12104 },
    {
      $set: {
        japanese: 'はい、どうぞ。ここで写真を撮ってもいいですよ。',
        furigana: 'はい、どうぞ。ここで しゃしんを とっても いいですよ。',
        english: 'Yes, go ahead. You may take photographs here (granting permission with 〜てもいいですよ).',
        relatedGrammarId: l21g2._id,
        relatedVocabIds: [l21VocabDocs[1]._id, l21VocabDocs[2]._id, l21VocabDocs[15]._id],
      },
    },
    { upsert: true, new: true }
  );

  // L21.3 Examples: Prohibitions
  const s213_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 12105 },
    {
      $set: {
        japanese: '美術館の中で大声で話してはいけません。',
        furigana: 'びじゅつかんの なかで おおごえで はなしてはいけません。',
        english: 'You must not speak in a loud voice inside the art museum (formal rule/prohibition).',
        relatedGrammarId: l21g3._id,
        relatedVocabIds: [l21VocabDocs[8]._id, l21VocabDocs[10]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s213_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 12106 },
    {
      $set: {
        japanese: '病院の中でタバコを吸ってはだめです。',
        furigana: 'びょういんの なかで タバコを すってはだめです。',
        english: 'You cannot smoke inside the hospital (conversational prohibition 〜てはだめです).',
        relatedGrammarId: l21g3._id,
        relatedVocabIds: [l21VocabDocs[3]._id, l21VocabDocs[4]._id, l21VocabDocs[7]._id],
      },
    },
    { upsert: true, new: true }
  );

  await GrammarPoint.findByIdAndUpdate(l21g1._id, { $set: { exampleSentenceIds: [s211_1._id, s211_2._id] } });
  await GrammarPoint.findByIdAndUpdate(l21g2._id, { $set: { exampleSentenceIds: [s212_1._id, s212_2._id] } });
  await GrammarPoint.findByIdAndUpdate(l21g3._id, { $set: { exampleSentenceIds: [s213_1._id, s213_2._id] } });

  console.log('✓ Unit 4 lessons (18-21), grammar points, and Tatoeba pairs seeded successfully.');
}

// Unit 5: Casual Register & Complex Sentences (Lessons 22-24)
async function seedUnit5(lessonDocs) {
  console.log('Seeding Unit 5 (Lessons 22-24: Plain Register, Quoting/Thoughts, Noun Modification)...');

  const l22 = lessonDocs[22];
  const l23 = lessonDocs[23];
  const l24 = lessonDocs[24];

  // ==========================================
  // LESSON 22: The Plain / Informal Speech Register
  // ==========================================
  const l22g1 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l22._id, order: 1 },
    {
      $set: {
        title: 'Plain Present: Affirmative & Negative (辞書形 vs. 〜ない形)',
        pattern: '[Ichidan]: Root + ない | [Godan]: Final -u → -a + ない (う→わ) | [Irregular]: する → しない / くる → こない | [ある]: ない',
        formation: 'Affirmative: Dictionary form (辞書形: 食べる, 飲む, 行く, する, くる). Negative: Ichidan: drop る + ない (食べない, 見ない). Godan: shift final -u syllable to -a row + ない (書かない, 飲まない, 話さない, 待たない, 買わない [note: う→わ, never う→あ], 行かない). Irregular: する→しない, くる→こない. Special exception: ある→ない.',
        explanation: 'The plain form (普通体) strips away polite social distance markers (です/ます). It is used for casual conversation with friends, family, and peers, as well as the internal language of thoughts and diary writing. Most importantly, plain forms are the foundational building blocks required to form complex Japanese sentences: quotations, relative clauses, and conditions.\\n\\n1. Plain Present Affirmative (辞書形):\\n- Use the standard dictionary form directly without any suffix: 今晩友達とご飯を食べる (I will eat a meal with a friend tonight).\\n\\n2. Plain Present Negative (〜ない形):\\n- Ichidan: drop る and attach ない: 食べる → 食べない, 見る → 見ない, 起きる → 起きない.\\n- Godan: shift the final consonant to the "a" row and add ない: 飲む → 飲まない, 待つ → 待たない, 聞く → 聞かない. Crucial rule: verbs ending in bare う change to わ, not あ (買う → 買わない, 会う → 会わない).\\n- Irregular: する becomes しない; 来る (くる) changes pronunciation to こない.\\n- The negative of the existence verb ある is simply ない (never *あらない).',
        notes: 'Common pitfalls:\\n1. Godan verbs ending in bare う become わない (e.g. 買わない, 習わない), never *買あない.\\n2. The negative of ある is just ない.\\n3. 来る (くる) shifts reading to こない.',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l22g2 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l22._id, order: 2 },
    {
      $set: {
        title: 'Plain Past: Affirmative & Negative (〜た形 vs. 〜なかった形)',
        pattern: '[Plain Past Affirmative]: 〜た / 〜だ (exact same shifts as 〜て/〜で) | [Plain Past Negative]: 〜なかった (〜ない drop い + かった)',
        formation: 'Affirmative (〜た/〜だ): Conjugate identically to te-form, replacing て/で with た/だ (食べた, 飲んだ, 行った, 話した, した, きた). Negative (〜なかった): Take the plain negative (〜ない), drop final い, and add かった (食べなかった, 飲まなかった, 行かなかった, しなかった, こなかった, なかった).',
        explanation: 'The plain past expresses completed past actions in casual speech and subordinate clauses. Both affirmative and negative forms follow completely predictable rules once previous building blocks are mastered:\\n\\n1. Plain Past Affirmative (〜た / 〜だ):\\n- Follows the exact sound shifts as the te-form (Lesson 19):\\n  - Ichidan: drop る + た (食べた, 見た).\\n  - Godan: う/つ/る → った (買った, 待った, 帰った); む/ぶ/ぬ → んだ (飲んだ, 遊んだ, 死んだ); く → いた (書いた); ぐ → いだ (泳いだ); す → した (話した); exception: 行く → 行った.\\n  - Irregular: する → した; 来る (くる) → 来た (きた).\\n\\n2. Plain Past Negative (〜なかった):\\n- Every negative plain verb ends in the auxiliary adjective 〜ない. Because 〜ない inflects like an い-adjective, you drop the final い and attach かった (e.g. 食べない → 食べなかった, 行かない → 行かなかった, しない → しなかった).\\n- The negative of ある (ない) becomes なかった.',
        notes: 'Common mistake: Do not attempt to attach た to the polite negative (*食べませんた is invalid; casual past negative is strictly 〜なかった). Also remember: いい (good) becomes よかった in the past affirmative and よくなかった in the past negative.',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l22g3 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l22._id, order: 3 },
    {
      $set: {
        title: 'Casual Conversational Particles (Rising Intonation, ね, よ, and だ Dropping)',
        pattern: '[Casual Question]: [Plain Form]? (rising intonation) | [Agreement/Shared Feeling]: [Plain Form] + ね | [Information/Emphasis]: [Plain Form] + よ',
        formation: 'Question: Plain form + rising intonation (omit か). Confirmation / Empathy: Plain form + ね. Assertive Info: Plain form + よ. Nouns / Na-Adjectives: だ is often omitted before rising questions (本当? not *本当だ?) and before ね (綺麗ね / 綺麗だね).',
        explanation: 'In casual conversation between close friends or family, dialogue does not end with です or ます. Instead, speakers use sentence-ending particles or pitch intonation to shape conversational nuance:\\n\\n1. Casual Questions (Rising Intonation):\\n- In polite Japanese, questions always end in か (食べますか). In casual Japanese, adding か to a plain verb (食べるか?) sounds sharp, demanding, or masculine-rough. Standard casual questions simply use the plain form with rising pitch intonation: 明日、来る? (Are you coming tomorrow?).\\n\\n2. Particle ね (Agreement & Empathy):\\n- Placed at the end of a casual statement to invite agreement, similar to "isn\'t it?" or "right?": 今日の授業、すごく難しかったね (Today\'s class was really difficult, wasn\'t it?).\\n\\n3. Particle よ (Informing & Advising):\\n- Placed at the end of a statement to provide new information, give friendly warnings, or state conviction: 来週の月曜日は休みだよ (Next Monday is a day off, you know!).\\n\\n4. Dropping the Copula だ:\\n- In questions and casual feminine/neutral speech, plain copula だ after nouns and な-adjectives is frequently dropped: 大丈夫? (Are you okay?) instead of *大丈夫だ?.',
        notes: 'Common mistake: Do not use か when asking a friendly question in casual speech (e.g. *何をするか? sounds blunt or confrontational; ask 何する? or 何するの? instead).',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l22Vocab = [
    { kanji: 'うん', kana: 'うん', meanings: ['yes (casual)', 'yeah'], pos: ['interjection'], seq: 1001460, cat: 'conversation' },
    { kanji: 'ううん', kana: 'ううん', meanings: ['no (casual)', 'uh-uh'], pos: ['interjection'], seq: 1001450, cat: 'conversation' },
    { kanji: '本当', kana: 'ほんとう', meanings: ['truth', 'reality', 'genuine'], pos: ['noun', 'na-adjective'], seq: 1512720, cat: 'conversation' },
    { kanji: '嘘', kana: 'うそ', meanings: ['lie', 'falsehood'], pos: ['noun'], seq: 1476680, cat: 'conversation' },
    { kanji: '多分', kana: 'たぶん', meanings: ['probably', 'perhaps', 'likely'], pos: ['adverb'], seq: 1404170, cat: 'conversation' },
    { kanji: 'どうして', kana: 'どうして', meanings: ['why', 'for what reason', 'how come'], pos: ['adverb'], seq: 1008680, cat: 'conversation' },
    { kanji: 'なぜ', kana: 'なぜ', meanings: ['why', 'how come'], pos: ['adverb'], seq: 1008630, cat: 'conversation' },
    { kanji: 'いつも', kana: 'いつも', meanings: ['always', 'usually', 'habitually'], pos: ['adverb'], seq: 1001850, cat: 'time' },
    { kanji: '今朝', kana: 'けさ', meanings: ['this morning'], pos: ['noun'], seq: 1272360, cat: 'time' },
    { kanji: '今晩', kana: 'こんばん', meanings: ['this evening', 'tonight'], pos: ['noun'], seq: 1284890, cat: 'time' },
    { kanji: '今週', kana: 'こんしゅう', meanings: ['this week'], pos: ['noun'], seq: 1284980, cat: 'time' },
    { kanji: '来週', kana: 'らいしゅう', meanings: ['next week'], pos: ['noun'], seq: 1543780, cat: 'time' },
    { kanji: '先週', kana: 'せんしゅう', meanings: ['last week'], pos: ['noun'], seq: 1378870, cat: 'time' },
    { kanji: '宿題', kana: 'しゅくだい', meanings: ['homework', 'assignment'], pos: ['noun'], seq: 1326980, cat: 'school' },
    { kanji: '授業', kana: 'じゅぎょう', meanings: ['class', 'lesson', 'schoolwork'], pos: ['noun', 'suru verb'], seq: 1328010, cat: 'school' },
    { kanji: '休み', kana: 'やすみ', meanings: ['rest', 'holiday', 'day off', 'vacation'], pos: ['noun'], seq: 1251930, cat: 'daily' },
  ];

  const l22VocabDocs = [];
  for (const v of l22Vocab) {
    const doc = await VocabEntry.findOneAndUpdate(
      { kana: v.kana, kanji: v.kanji, lessonId: l22._id },
      {
        $set: {
          kanji: v.kanji,
          meanings: v.meanings,
          partOfSpeech: v.pos,
          jmdictSeq: v.seq,
          thematicCategory: v.cat,
          jlptLevel: 'N5',
        },
      },
      { upsert: true, new: true }
    );
    l22VocabDocs.push(doc);
  }

  await VocabEntry.deleteMany({
    lessonId: l22._id,
    kanji: { $nin: l22Vocab.map((v) => v.kanji) },
  });

  // L22.1 Examples: Plain Present Affirmative & Negative
  const s221_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 12201 },
    {
      $set: {
        japanese: '明日は学校が休みだから、宿題をしない。',
        furigana: 'あしたは がっこうが やすみだから、しゅくだいを しない。',
        english: 'Tomorrow school is off, so I will not do homework (plain negative しない).',
        relatedGrammarId: l22g1._id,
        relatedVocabIds: [l22VocabDocs[13]._id, l22VocabDocs[15]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s221_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 12202 },
    {
      $set: {
        japanese: '今朝は忙しいから、朝ご飯を全然食べない。',
        furigana: 'けさは いそがしいから、あさごはんを ぜんぜん たべない。',
        english: 'Because I am busy this morning, I will not eat breakfast at all (plain negative 食べない).',
        relatedGrammarId: l22g1._id,
        relatedVocabIds: [l22VocabDocs[8]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s221_3 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 12203 },
    {
      $set: {
        japanese: '今晩、駅前の新しいカフェでコーヒーを飲む。',
        furigana: 'こんばん、えきまえの あたらしい カフェで コーヒーを のむ。',
        english: 'Tonight, I will drink coffee at the new cafe in front of the station (plain affirmative 飲む).',
        relatedGrammarId: l22g1._id,
        relatedVocabIds: [l22VocabDocs[9]._id],
      },
    },
    { upsert: true, new: true }
  );

  // L22.2 Examples: Plain Past Affirmative & Negative
  const s222_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 12204 },
    {
      $set: {
        japanese: '先週、友達と図書館でたくさん日本語を勉強した。',
        furigana: 'せんしゅう、ともだちと としょかんで たくさん にほんごを べんきょうした。',
        english: 'Last week, I studied Japanese a lot with my friend at the library (plain past affirmative 〜した).',
        relatedGrammarId: l22g2._id,
        relatedVocabIds: [l22VocabDocs[12]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s222_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 12205 },
    {
      $set: {
        japanese: '昨日は時間が全然なくて、宿題を出さなかった。',
        furigana: 'きのうは じかんが ぜんぜん なくて、しゅくだいを ださなかった。',
        english: 'Yesterday I had no time at all and did not submit my homework (plain past negative 〜なかった).',
        relatedGrammarId: l22g2._id,
        relatedVocabIds: [l22VocabDocs[13]._id],
      },
    },
    { upsert: true, new: true }
  );

  // L22.3 Examples: Casual Conversational Particles
  const s223_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 12206 },
    {
      $set: {
        japanese: '「明日、映画を見に行く？」「うん、いいね。行こう！」',
        furigana: '「あした、えいがを みに いく？」「うん、いいね。いこう！」',
        english: '“Are you going to see a movie tomorrow?” “Yeah, sounds good. Let\'s go!” (rising intonation question + informal affirmation うん + ね).',
        relatedGrammarId: l22g3._id,
        relatedVocabIds: [l22VocabDocs[0]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s223_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 12207 },
    {
      $set: {
        japanese: '「来週テストがある？」「ううん、テストはないよ。」',
        furigana: '「らいしゅう テストが ある？」「ううん、テストは ないよ。」',
        english: '“Is there a test next week?” “Uh-uh, there is no test, you know” (casual negative ううん + informative sentence-ending よ).',
        relatedGrammarId: l22g3._id,
        relatedVocabIds: [l22VocabDocs[1]._id, l22VocabDocs[11]._id],
      },
    },
    { upsert: true, new: true }
  );

  await GrammarPoint.findByIdAndUpdate(l22g1._id, { $set: { exampleSentenceIds: [s221_1._id, s221_2._id, s221_3._id] } });
  await GrammarPoint.findByIdAndUpdate(l22g2._id, { $set: { exampleSentenceIds: [s222_1._id, s222_2._id] } });
  await GrammarPoint.findByIdAndUpdate(l22g3._id, { $set: { exampleSentenceIds: [s223_1._id, s223_2._id] } });

  // ==========================================
  // LESSON 23: Quoting & Expressing Thoughts
  // ==========================================
  const l23g1 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l23._id, order: 1 },
    {
      $set: {
        title: 'Expressing Opinions & Beliefs with 〜と思う (I think that...)',
        pattern: '[Plain Verb / い-Adj Clause] + と思う / と思っています | [Noun / な-Adj] + だと思う',
        formation: 'Verb Plain Form (present/past/neg) + と思う. い-Adjective + と思う. Noun / な-Adjective + だ (or じゃない / だった / じゃなかった) + と思う. Ongoing/firm belief: 〜と思っている / 〜と思っています.',
        explanation: 'Japanese discourse culture places high value on social harmony and avoids asserting subjective viewpoints as objective facts. Adding 〜と思う ("I think that...") softens declarations, expresses personal opinions, and marks interpretations.\\n\\n1. Particle と as Clause Quotation Mark:\\n- Particle と marks the exact boundary of what is being thought. The clause directly preceding と must ALWAYS be in the plain form (not polite ます/です).\\n\\n2. Conjugation Before と思う:\\n- Verbs: 明日雨が降ると思う (I think it will rain tomorrow); 彼は来ないと思う (I think he won\'t come).\\n- い-Adjectives: 日本の物価は高いと思う (I think Japanese prices are high).\\n- Nouns and な-Adjectives: You MUST include the plain copula だ! Example: この質問は簡単**だ**と思う (I think this question is simple).\\n\\n3. 〜と思う vs. 〜と思っている:\\n- 〜と思う expresses a spontaneous thought occurring at the current moment of speaking.\\n- 〜思っています (or 思っている) expresses a longstanding opinion, plan, or ongoing conviction that the speaker has held for a while. It is also required when reporting what a third person thinks (e.g. 田中さんはそう思っています).',
        notes: 'Common pitfalls:\\n1. Noun / な-Adjective omission error: Do NOT drop だ before と (*簡単と思う is grammatically incomplete; it must be 簡単**だ**と思う).\\n2. Negative placement: In English we say "I don\'t think he will come." In Japanese, it is much more natural to negate the inner verb (来ないと思う) rather than negating と思う (*来ると思わない).',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l23g2 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l23._id, order: 2 },
    {
      $set: {
        title: 'Quoting Speech: Direct & Indirect with 〜と言う (Said that...)',
        pattern: 'Direct: 「[Verbatim Speech]」 + と言う / と言いました | Indirect: [Plain Form Clause] + と言う / と言いました',
        formation: 'Direct Quote: Enclose exact spoken words in Japanese quotation marks 「...」 + と言いました / と言っていた. Indirect Quote: Convert reported statement into a Plain Form clause (Verbs: plain form; い-Adj: plain form; Noun/な-Adj: + だ) + と言いました / と言っています.',
        explanation: 'Particle と serves as the quotation particle for reported speech, pairing with 言う (to say/tell). Japanese distinguishes between direct (verbatim) and indirect (paraphrased) quotations:\\n\\n1. Direct Quotations (直接引用):\\n- Quotes the exact words spoken, enclosed in brackets 「...」. The speech level inside the quotes is preserved exactly as spoken (including polite です/ます, interjections, and greetings): 先生は「静かにしてください」と言いました (The teacher said, "Please be quiet").\\n\\n2. Indirect Quotations (間接引用):\\n- Reports the substance of what someone said without quotation brackets. The reported clause MUST be normalized into the plain form before attaching と言いました: 田中さんは明日来ると言いました (Tanaka said that he would come tomorrow).\\n\\n3. No Tense Backshifting in Japanese:\\n- Unlike English (where "I am tired" becomes "He said he *was* tired"), Japanese does not shift tenses backwards in reported speech. If the speaker was tired when speaking, Japanese keeps the non-past plain form: 疲れていると言いました (He said [I am tired] that he was tired).\\n\\n4. Ongoing Report: 〜と言っています:\\n- When conveying a message or hearsay currently circulating from a third party, use 〜と言っています ("He/she is saying that...").',
        notes: 'Common pitfalls:\\n1. Forgetting だ for nouns in indirect quotes: 彼はお医者さん**だ**と言いました (He said he was a doctor), not *彼はお医者さんと言いました.\\n2. Unnecessary tense shifting: Do not change present tense into past tense inside the quote if the statement was present tense when spoken.',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l23Vocab = [
    { kanji: '思う', kana: 'おもう', meanings: ['to think', 'to feel', 'to consider'], pos: ['godan verb'], seq: 1208720, cat: 'verbs' },
    { kanji: '言う', kana: 'いう', meanings: ['to say', 'to tell', 'to utter'], pos: ['godan verb'], seq: 1215220, cat: 'verbs' },
    { kanji: '考える', kana: 'かんがえる', meanings: ['to think over', 'to ponder', 'to consider'], pos: ['ichidan verb'], seq: 1259270, cat: 'verbs' },
    { kanji: '話', kana: 'はなし', meanings: ['talk', 'story', 'speech', 'conversation'], pos: ['noun'], seq: 1547850, cat: 'communication' },
    { kanji: '意見', kana: 'いけん', meanings: ['opinion', 'view'], pos: ['noun'], seq: 1158650, cat: 'communication' },
    { kanji: '質問', kana: 'しつもん', meanings: ['question', 'inquiry'], pos: ['noun', 'suru verb'], seq: 1319080, cat: 'communication' },
    { kanji: '答える', kana: 'こたえる', meanings: ['to answer', 'to reply'], pos: ['ichidan verb'], seq: 1515640, cat: 'verbs' },
    { kanji: 'ニュース', kana: 'ニュース', meanings: ['news'], pos: ['noun'], seq: 1098490, cat: 'communication' },
    { kanji: '新聞', kana: 'しんぶん', meanings: ['newspaper'], pos: ['noun'], seq: 1362840, cat: 'communication' },
    { kanji: '雑誌', kana: 'ざっし', meanings: ['magazine', 'journal'], pos: ['noun'], seq: 1303860, cat: 'communication' },
    { kanji: '言葉', kana: 'ことば', meanings: ['word', 'language', 'speech'], pos: ['noun'], seq: 1276850, cat: 'communication' },
    { kanji: '意味', kana: 'いみ', meanings: ['meaning', 'significance'], pos: ['noun'], seq: 1162620, cat: 'communication' },
    { kanji: '文化', kana: 'ぶんか', meanings: ['culture', 'civilization'], pos: ['noun'], seq: 1494970, cat: 'society' },
    { kanji: '社会', kana: 'しゃかい', meanings: ['society', 'the public'], pos: ['noun'], seq: 1317520, cat: 'society' },
    { kanji: '将来', kana: 'しょうらい', meanings: ['future (personal/near)', 'prospects'], pos: ['noun'], seq: 1360150, cat: 'time' },
    { kanji: '天気予報', kana: 'てんきよほう', meanings: ['weather forecast'], pos: ['noun'], seq: 1428280, cat: 'communication' },
  ];

  const l23VocabDocs = [];
  for (const v of l23Vocab) {
    const doc = await VocabEntry.findOneAndUpdate(
      { kana: v.kana, kanji: v.kanji, lessonId: l23._id },
      {
        $set: {
          kanji: v.kanji,
          meanings: v.meanings,
          partOfSpeech: v.pos,
          jmdictSeq: v.seq,
          thematicCategory: v.cat,
          jlptLevel: 'N5',
        },
      },
      { upsert: true, new: true }
    );
    l23VocabDocs.push(doc);
  }

  await VocabEntry.deleteMany({
    lessonId: l23._id,
    kanji: { $nin: l23Vocab.map((v) => v.kanji) },
  });

  // L23.1 Examples: Expressing Opinions with 〜と思う
  const s231_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 12301 },
    {
      $set: {
        japanese: '明日の天気予報を見たけれど、雨は降らないと思う。',
        furigana: 'あしたの てんきよほうを みたけれど、あめは ふらないと おもう。',
        english: 'I looked at tomorrow\'s weather forecast, but I think it will not rain (inner plain negative + と思う).',
        relatedGrammarId: l23g1._id,
        relatedVocabIds: [l23VocabDocs[0]._id, l23VocabDocs[15]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s231_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 12302 },
    {
      $set: {
        japanese: 'この本は日本の伝統文化を理解するために大切だと思います。',
        furigana: 'この ほんは にほんの でんとうぶんかを りかいする ために たいせつだと おもいます。',
        english: 'I think that this book is important for understanding traditional Japanese culture (na-adjective + だと思う).',
        relatedGrammarId: l23g1._id,
        relatedVocabIds: [l23VocabDocs[0]._id, l23VocabDocs[12]._id],
      },
    },
    { upsert: true, new: true }
  );

  // L23.2 Examples: Quoting with 〜と言う
  const s232_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 12303 },
    {
      $set: {
        japanese: '先生は「質問がある人は、いつでも聞いてください」と言いました。',
        furigana: 'せんせいは「しつもんが ある ひとは、いつでも きいて ください」と いいました。',
        english: 'The teacher said, "Anyone who has questions, please ask at any time" (direct quote with quotation marks 「...」).',
        relatedGrammarId: l23g2._id,
        relatedVocabIds: [l23VocabDocs[1]._id, l23VocabDocs[5]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s232_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 12304 },
    {
      $set: {
        japanese: '新聞のニュースによると、大統領は来月日本へ来ると言っています。',
        furigana: 'しんぶんの ニュースによると、だいとうりょうは らいげつ にほんへ くると いっています。',
        english: 'According to the newspaper news, the president says that he will come to Japan next month (indirect quote plain form 来る + と言っています).',
        relatedGrammarId: l23g2._id,
        relatedVocabIds: [l23VocabDocs[1]._id, l23VocabDocs[7]._id, l23VocabDocs[8]._id],
      },
    },
    { upsert: true, new: true }
  );

  await GrammarPoint.findByIdAndUpdate(l23g1._id, { $set: { exampleSentenceIds: [s231_1._id, s231_2._id] } });
  await GrammarPoint.findByIdAndUpdate(l23g2._id, { $set: { exampleSentenceIds: [s232_1._id, s232_2._id] } });

  // ==========================================
  // LESSON 24: Noun Modification (Relative Clauses)
  // ==========================================
  const l24g1 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l24._id, order: 1 },
    {
      $set: {
        title: 'Noun Modification with Plain Verb Clauses ([Plain Clause] + Noun)',
        pattern: '[Plain Form Verb Clause (Present / Past / Neg / Past-Neg)] + [Noun]',
        formation: 'Affirmative Present: [Verb 辞書形] + Noun (行く場所, 作る料理). Negative Present: [Verb 〜ない] + Noun (肉を食べない人). Affirmative Past: [Verb 〜た] + Noun (昨日買った服). Negative Past: [Verb 〜なかった] + Noun (誰も知らなかった町). Polite forms (です/ます) are NEVER allowed inside noun modifiers.',
        explanation: 'In Japanese, any phrase or clause that describes a noun MUST come directly before that noun. Japanese has no relative pronouns corresponding to English "who", "which", "that", or "where". Instead, you simply place a complete plain-form sentence directly in front of the head noun.\\n\\n1. Direct Pre-Nominal Attachment:\\n- In English: "The cake [that I bought yesterday]" (head noun first, modifier follows).\\n- In Japanese: "[昨日買った] ケーキ" (modifier first, head noun last).\\n- The verb at the end of the modifying clause attaches directly to the noun without any connecting particle like の (*買ったの本 is completely ungrammatical; it must be 買った本).\\n\\n2. The Plain Form Requirement:\\n- The verb inside a modifying clause must ALWAYS be in the plain form (辞書形, ない形, た形, なかった形). Polite forms (ます/でした) can NEVER be used inside a noun-modifying clause (*昨日買いました本 is invalid).\\n\\n3. All Tenses and Polarities Apply:\\n- Present Habitual: 毎日この道を通る人 (people who walk this street every day).\\n- Past Completed: 昨日デパートで買った服 (clothes that I bought yesterday at the department store).\\n- Negative: お酒を飲まない大人 (adults who do not drink alcohol).',
        notes: 'Common pitfalls:\\n1. Never use polite ます inside a modifying clause (*作りました料理 is wrong; use 作った料理).\\n2. Never insert の between a modifying verb and its head noun (*作ったの料理 is wrong; use 作った料理).',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l24g2 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l24._id, order: 2 },
    {
      $set: {
        title: 'The Subordinate Subject Shift: Particle が in Relative Clauses',
        pattern: 'Main Sentence: [Subject] は [Predicate] | Embedded Clause: [... [Subject] が [Verb] ...] + Noun',
        formation: 'Inside any noun-modifying clause, the performer of the action MUST take subject marker が, NEVER the topic marker は. Formula: [Actor + が + Action] + Modified Noun.',
        explanation: 'A critical rule of Japanese grammar is the subject marker shift from は to が inside embedded clauses. When an independent main sentence is converted into a noun-modifying relative clause, any topic marker は MUST be replaced with が:\\n\\nWhy は is forbidden inside relative clauses (The Conceptual "Why"):\\n- Particle は is the macro-thematic topic marker for the ENTIRE sentence. When you state "Xは...", you announce: "As for X, here is what the entire sentence is about," and its scope extends all the way to the sentence-ending period.\\n- A relative clause, however, is merely a subordinate descriptor modifying a specific noun inside the sentence. It does not establish the main sentence topic.\\n- Because は carries whole-sentence scope, using は inside a relative clause breaks the clause boundary and hijacks the topic of the main sentence. Therefore, Japanese strictly restricts the internal performer of a subordinate clause to the local subject marker が.\\n\\nContrasting Example Pair 1 (Independent Main Clause vs. Relative Clause Modification):\\n- Independent Main Sentence: 田中さん**は**ケーキを作りました。(As for Tanaka-san, he made a cake. -> Tanaka is the topic of the whole utterance.)\\n- Relative Clause Noun Modification: これは田中さん**が**作ったケーキです。(This is the cake that Tanaka-san made. -> "This" (これ) is the main topic; Tanaka-san is marked with が because he is only the internal subject of the cake-making clause.)\\n\\nContrasting Example Pair 2 (Main Sentence Topic vs. Embedded Clause Performer):\\n- Independent Main Sentence: 母**は**美味しいお弁当を作りました。(Mother made a delicious boxed lunch.)\\n- Combined Sentence: 私**は** [母**が**作ったお弁当] を食べました。(I [topic は] ate the boxed lunch [that mother が made]. -> The speaker 私 is the main sentence topic; the mother is marked with が inside the bracketed relative clause).',
        notes: 'Common mistake: English speakers instinctively translate "the cake Tanaka-san made" using は because Tanaka seems important. Saying *これは田中さんは作ったケーキです is a major grammatical blunder in Japanese. Always use が for the actor inside a noun-modifying clause!',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l24g3 = await GrammarPoint.findOneAndUpdate(
    { lessonId: l24._id, order: 3 },
    {
      $set: {
        title: 'The が → の Subject Substitution (Ga-No Conversion / が・の交代)',
        pattern: '[... [Subject] が [Verb] ...] + Noun ↔ [... [Subject] の [Verb] ...] + Noun',
        formation: 'Inside a relative clause, the subject particle が can optionally be substituted with の without changing the meaning: [Subject] が + Verb + Noun ↔ [Subject] の + Verb + Noun.',
        explanation: 'In noun-modifying relative clauses, native speakers frequently replace the subject particle が with の. This phenomenon is known in Japanese linguistics as "ga-no conversion" (が・の交代):\\n\\n1. The Conceptual "Why":\\n- In Classical Japanese, particle の historically functioned as both a possessive marker ("of") and a nominative subject marker. While Modern Japanese standard language replaced the subject function of の with が in main sentences, the older subject usage was preserved inside noun-modifying clauses.\\n- Native speakers often prefer の in relative clauses because it provides a softer acoustic rhythm and binds the actor even more tightly to the upcoming head noun.\\n\\n2. Examples of Interchangeability:\\n- 私**が**住んでいる町 ↔ 私**の**住んでいる町 (The town where I live).\\n- 母**が**作ったお弁当 ↔ 母**の**作ったお弁当 (The boxed lunch my mother made).\\n- 背**が**高い人 ↔ 背**の**高い人 (A person who is tall).\\n\\n3. Critical Restriction:\\n- Ga-No conversion ONLY occurs inside noun-modifying clauses. You can NEVER replace が with の in an independent main clause (*猫の走ります is completely incorrect).\\n- If a direct object marked with を separates the subject from the verb (e.g. 田中さんが本を読んでいる場所), native speakers avoid converting が to の to prevent confusion with possessive nouns.',
        notes: 'Common mistake: Do not confuse the Ga-No conversion の with the possessive particle の. In 母の作った料理, の does NOT mean "Mother\'s food" directly; it marks 母 as the grammatical subject performing the verb 作った.',
        jlptLevel: 'N5',
      },
    },
    { upsert: true, new: true }
  );

  const l24Vocab = [
    { kanji: '方', kana: 'かた', meanings: ['person (polite)', 'way of doing'], pos: ['noun'], seq: 1540840, cat: 'people' },
    { kanji: '大人', kana: 'おとな', meanings: ['adult'], pos: ['noun'], seq: 1404110, cat: 'people' },
    { kanji: '料理', kana: 'りょうり', meanings: ['cooking', 'cuisine', 'dish'], pos: ['noun', 'suru verb'], seq: 1544490, cat: 'daily' },
    { kanji: 'お弁当', kana: 'おべんとう', meanings: ['boxed lunch', 'bento'], pos: ['noun'], seq: 1500390, cat: 'food' },
    { kanji: 'お菓子', kana: 'おかし', meanings: ['confections', 'sweets', 'candy', 'cake'], pos: ['noun'], seq: 1205040, cat: 'food' },
    { kanji: '服', kana: 'ふく', meanings: ['clothes', 'clothing'], pos: ['noun'], seq: 1492310, cat: 'clothing' },
    { kanji: '靴', kana: 'くつ', meanings: ['shoes', 'footwear'], pos: ['noun'], seq: 1198530, cat: 'clothing' },
    { kanji: '帽子', kana: 'ぼうし', meanings: ['hat', 'cap'], pos: ['noun'], seq: 1510610, cat: 'clothing' },
    { kanji: '眼鏡', kana: 'めがね', meanings: ['glasses', 'spectacles'], pos: ['noun'], seq: 1215160, cat: 'clothing' },
    { kanji: '物', kana: 'もの', meanings: ['thing', 'object', 'article'], pos: ['noun'], seq: 1515270, cat: 'daily' },
    { kanji: '場所', kana: 'ばしょ', meanings: ['place', 'location'], pos: ['noun'], seq: 1410940, cat: 'places' },
    { kanji: '町', kana: 'まち', meanings: ['town', 'neighborhood', 'city'], pos: ['noun'], seq: 1445770, cat: 'places' },
    { kanji: '道', kana: 'みち', meanings: ['road', 'street', 'path', 'way'], pos: ['noun'], seq: 1450280, cat: 'places' },
    { kanji: '作る', kana: 'つくる', meanings: ['to make', 'to produce', 'to prepare (food)'], pos: ['godan verb'], seq: 1318620, cat: 'verbs' },
    { kanji: '脱ぐ', kana: 'ぬぐ', meanings: ['to take off (clothes, shoes)'], pos: ['godan verb'], seq: 1419400, cat: 'verbs' },
    { kanji: '落とす', kana: 'おとす', meanings: ['to drop', 'to lose'], pos: ['godan verb'], seq: 1541300, cat: 'verbs' },
  ];

  const l24VocabDocs = [];
  for (const v of l24Vocab) {
    const doc = await VocabEntry.findOneAndUpdate(
      { kana: v.kana, kanji: v.kanji, lessonId: l24._id },
      {
        $set: {
          kanji: v.kanji,
          meanings: v.meanings,
          partOfSpeech: v.pos,
          jmdictSeq: v.seq,
          thematicCategory: v.cat,
          jlptLevel: 'N5',
        },
      },
      { upsert: true, new: true }
    );
    l24VocabDocs.push(doc);
  }

  await VocabEntry.deleteMany({
    lessonId: l24._id,
    kanji: { $nin: l24Vocab.map((v) => v.kanji) },
  });

  // L24.1 Examples: Noun Modification with Plain Clauses
  const s241_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 12401 },
    {
      $set: {
        japanese: '昨日デパートで買った服を着て、友達と買い物に出かけました。',
        furigana: 'きのう デパートで かった ふくを きて、ともだちと かいものに でかけました。',
        english: 'I wore the clothes that I bought at the department store yesterday and went shopping with my friend (past plain 買った modifying noun 服).',
        relatedGrammarId: l24g1._id,
        relatedVocabIds: [l24VocabDocs[5]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s241_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 12402 },
    {
      $set: {
        japanese: '普段あまり料理を作らない大人でも、この本なら簡単に作れます。',
        furigana: 'ふだん あまり りょうりを つくらない おとなでも、この ほんなら かんたんに つくれます。',
        english: 'Even adults who don\'t usually cook dishes can make them easily with this book (negative plain clause 作らない modifying noun 大人).',
        relatedGrammarId: l24g1._id,
        relatedVocabIds: [l24VocabDocs[1]._id, l24VocabDocs[2]._id, l24VocabDocs[13]._id],
      },
    },
    { upsert: true, new: true }
  );

  // L24.2 Examples: Subordinate Subject Shift (Particle が in Relative Clauses)
  const s242_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 12403 },
    {
      $set: {
        japanese: 'これは田中さんが作ったとても美味しいお菓子です。',
        furigana: 'これは たなかさんが つくった とても おいしい おかしです。',
        english: 'This is the very delicious sweets that Tanaka-san made (subordinate subject marked with が inside modifying clause, contrasting with main sentence 田中さんは...).',
        relatedGrammarId: l24g2._id,
        relatedVocabIds: [l24VocabDocs[4]._id, l24VocabDocs[13]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s242_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 12404 },
    {
      $set: {
        japanese: '私は父が誕生日に買ってくれた帽子を毎日かぶっています。',
        furigana: 'わたしは ちちが たんじょうびに かってくれた ぼうしを まいにち かぶっています。',
        english: 'I wear every day the hat that my father bought me for my birthday (Main sentence topic 私は, embedded clause actor marked with が: 父が).',
        relatedGrammarId: l24g2._id,
        relatedVocabIds: [l24VocabDocs[7]._id],
      },
    },
    { upsert: true, new: true }
  );

  // L24.3 Examples: Ga-No Conversion
  const s243_1 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 12405 },
    {
      $set: {
        japanese: '私の住んでいる町は、静かで緑が多い素晴らしい場所です。',
        furigana: 'わたしの すんでいる まちは、しずかで みどりが おおい すばらしい ばしょです。',
        english: 'The town where I live is a wonderful place that is quiet and has plenty of greenery (Ga-No conversion: 私の住んでいる町 ↔ 私が住んでいる町).',
        relatedGrammarId: l24g3._id,
        relatedVocabIds: [l24VocabDocs[10]._id, l24VocabDocs[11]._id],
      },
    },
    { upsert: true, new: true }
  );

  const s243_2 = await ExampleSentence.findOneAndUpdate(
    { tatoebaId: 12406 },
    {
      $set: {
        japanese: '駅へ向かう途中で、帽子をかぶった眼鏡の方に道を尋ねられました。',
        furigana: 'えきへ むかう とちゅうで、ぼうしを かぶった めがねの かたに みちを たずねられました。',
        english: 'On the way to the station, I was asked directions by a person with glasses wearing a hat (noun-modifying clause + polite noun 方 and 道).',
        relatedGrammarId: l24g3._id,
        relatedVocabIds: [l24VocabDocs[0]._id, l24VocabDocs[7]._id, l24VocabDocs[8]._id, l24VocabDocs[12]._id],
      },
    },
    { upsert: true, new: true }
  );

  await GrammarPoint.findByIdAndUpdate(l24g1._id, { $set: { exampleSentenceIds: [s241_1._id, s241_2._id] } });
  await GrammarPoint.findByIdAndUpdate(l24g2._id, { $set: { exampleSentenceIds: [s242_1._id, s242_2._id] } });
  await GrammarPoint.findByIdAndUpdate(l24g3._id, { $set: { exampleSentenceIds: [s243_1._id, s243_2._id] } });

  console.log('✓ Unit 5 lessons (22-24), grammar points, and Tatoeba pairs seeded successfully.');
}

// Automated Kanji Seeder: Links every unique kanji in Units 0-5 to its first introduction lesson
async function seedKanjiForCourse(lessonDocs) {
  console.log('Seeding Kanji for Course (automated from vocabulary & Lesson 6)...');

  // 1. Load full KANJIDIC2 dataset
  const kanjiPath = path.resolve('data/kanji_jlpt.json');
  const rawData = JSON.parse(fs.readFileSync(kanjiPath, 'utf8'));
  const kanjiDictMap = new Map();

  for (const lvl of ['N5', 'N4', 'N3', 'N2', 'N1']) {
    for (const item of (rawData[lvl] || [])) {
      if (item.kanji && !kanjiDictMap.has(item.kanji)) {
        kanjiDictMap.set(item.kanji, {
          unicode: item.unicode,
          onyomi: item.on_readings || [],
          kunyomi: item.kun_readings || [],
          meanings: item.meanings || [],
          strokeCount: item.stroke_count || 1,
          grade: item.grade || 1,
          jlptLevel: `N${item.jlpt || 5}`,
        });
      }
    }
  }

  // 2. Add supplemental KANJIDIC2 entries for characters missing from base export
  for (const [char, meta] of Object.entries(SUPPLEMENTAL_KANJIDIC)) {
    kanjiDictMap.set(char, meta);
  }

  // 3. Track character -> firstLessonId
  // Start with Lesson 6 foundational characters
  const charFirstLesson = new Map();
  const introChars = ['一', '二', '三', '日', '月', '木', '山', '川', '人', '口'];
  for (const c of introChars) {
    charFirstLesson.set(c, lessonDocs[6]._id);
  }

  // 4. Scan all VocabEntry documents across all 30 lessons in curriculum order (order 7..30)
  const cjkRegex = /[\u4e00-\u9faf\u3400-\u4dbf]/g;
  for (let order = 7; order <= 30; order++) {
    const lDoc = lessonDocs[order];
    if (!lDoc) continue;
    const vocabs = await VocabEntry.find({ lessonId: lDoc._id }).lean();
    for (const v of vocabs) {
      if (!v.kanji) continue;
      const matches = v.kanji.match(cjkRegex);
      if (matches) {
        for (const c of matches) {
          if (!charFirstLesson.has(c)) {
            charFirstLesson.set(c, { lessonId: lDoc._id, order });
          }
        }
      }
    }
  }

  console.log(`Found ${charFirstLesson.size} unique kanji characters across the 30-lesson curriculum.`);

  // Remove any obsolete kanji not present in current curriculum
  await KanjiEntry.deleteMany({ character: { $nin: Array.from(charFirstLesson.keys()) } });

  // 5. Upsert KanjiEntry for each character with its first introduction lessonId and deep understanding fields
  let createdCount = 0;
  for (const [char, meta] of charFirstLesson.entries()) {
    const dict = kanjiDictMap.get(char);
    if (!dict) {
      console.warn(`Warning: Missing KANJIDIC2 definition for '${char}'`);
      continue;
    }

    const coreMeaning = dict.meanings?.[0] || 'Character';
    const primaryReading = dict.onyomi?.[0] || dict.kunyomi?.[0] || '';
    const isN5 = dict.jlptLevel === 'N5';

    await KanjiEntry.findOneAndUpdate(
      { character: char },
      {
        $set: {
          character: char,
          unicode: dict.unicode,
          onyomi: dict.onyomi || dict.on || [],
          kunyomi: dict.kunyomi || dict.kun || [],
          meanings: dict.meanings || [],
          coreMeaning,
          relevantReading: primaryReading,
          whyAppearsHere: `Introduced in Lesson ${meta.order} vocabulary.`,
          courseRelevance: isN5 ? 'N5 Core Required Kanji' : `Encountered in Vocabulary (JLPT ${dict.jlptLevel || 'N4'})`,
          strokeCount: dict.strokeCount || dict.strokes || 1,
          grade: dict.grade || 1,
          jlptLevel: dict.jlptLevel || dict.level || 'N5',
          lessonId: meta.lessonId,
        },
      },
      { upsert: true, new: true }
    );
    createdCount++;
  }

  console.log(`✓ Seeded ${createdCount} KanjiEntry documents with accurate first-introduced lesson IDs.`);
}

async function seedUserAndProgress(lessonDocs) {
  console.log('Seeding Demo User, UserProgress, and active UserCards...');

  const user = await User.findOneAndUpdate(
    { email: 'demo@manabu.app' },
    {
      $set: {
        username: 'demo_student',
        targetLevel: 'N5',
        studyStreak: 3,
      },
    },
    { upsert: true, new: true }
  );

  // User has completed Lessons 1, 2, 3 and is currently on Lesson 4
  const completedIds = [lessonDocs[1]._id, lessonDocs[2]._id, lessonDocs[3]._id];
  await UserProgress.findOneAndUpdate(
    { userId: user._id },
    {
      $set: {
        completedLessonIds: completedIds,
        currentLessonId: lessonDocs[4]._id,
        lastActiveAt: new Date(),
      },
    },
    { upsert: true, new: true }
  );

  // Seed sample active UserCards (some due today for SM-2 review queue testing)
  const now = Date.now();
  const sampleKana = await KanaEntry.find({ lessonId: lessonDocs[1]._id }).limit(5);
  const sampleVocab = await VocabEntry.find({ lessonId: lessonDocs[8]._id }).limit(5);

  // 3 Kana cards due now (nextReviewDate in past)
  for (let i = 0; i < sampleKana.length; i++) {
    const k = sampleKana[i];
    const isDue = i < 3;
    await UserCard.findOneAndUpdate(
      { userId: user._id, cardId: k._id },
      {
        $set: {
          cardType: 'kana',
          cardModel: 'KanaEntry',
          interval: isDue ? 1 : 4,
          easeFactor: 2.5,
          repetitions: isDue ? 1 : 2,
          nextReviewDate: isDue ? new Date(now - 3600000) : new Date(now + 86400000 * 3),
          lastStudiedAt: new Date(now - 86400000),
        },
      },
      { upsert: true }
    );
  }

  // 2 Vocab cards due now
  for (let i = 0; i < sampleVocab.length; i++) {
    const v = sampleVocab[i];
    const isDue = i < 2;
    await UserCard.findOneAndUpdate(
      { userId: user._id, cardId: v._id },
      {
        $set: {
          cardType: 'vocab',
          cardModel: 'VocabEntry',
          interval: isDue ? 1 : 6,
          easeFactor: 2.5,
          repetitions: isDue ? 1 : 3,
          nextReviewDate: isDue ? new Date(now - 7200000) : new Date(now + 86400000 * 5),
          lastStudiedAt: new Date(now - 86400000),
        },
      },
      { upsert: true }
    );
  }

  console.log('✓ Demo User, UserProgress, and SM-2 UserCards configured.');
}

// Main execution function
async function main() {
  console.log('=== MANABU CURRICULUM SEED PIPELINE ===');
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.');

  // 1. Seed all 30 lessons
  const lessonDocs = await seedLessons();

  // 2. Seed Unit 0
  await seedUnit0(lessonDocs);

  // 3. Seed Unit 1
  await seedUnit1(lessonDocs);

  // 4. Seed Unit 2
  await seedUnit2(lessonDocs);

  // 5. Seed Unit 3
  await seedUnit3(lessonDocs);

  // 6. Seed Unit 4
  await seedUnit4(lessonDocs);

  // 7. Seed Unit 5
  await seedUnit5(lessonDocs);

  // 8. Seed Unit 6
  await seedUnit6(lessonDocs);

  // 9. Seed Unit 7
  await seedUnit7(lessonDocs);

  // 10. Seed Kanji for Course (automated from vocabulary & Lesson 6 across all 30 lessons)
  await seedKanjiForCourse(lessonDocs);

  // 11. Seed User, Progress, & SM-2 cards
  await seedUserAndProgress(lessonDocs);

  // 12. Generate and print summary counts table
  console.log('\n======================================================');
  console.log('               PER-LESSON CONTENT COUNTS              ');
  console.log('======================================================');
  const allLessons = await Lesson.find({}).sort({ order: 1 }).lean();

  const summary = [];
  for (const l of allLessons) {
    const kanaCount = await KanaEntry.countDocuments({ lessonId: l._id });
    const grammarCount = await GrammarPoint.countDocuments({ lessonId: l._id });
    const vocabCount = await VocabEntry.countDocuments({ lessonId: l._id });
    const kanjiCount = await KanjiEntry.countDocuments({ lessonId: l._id });

    summary.push({
      Order: l.order,
      Unit: `Unit ${l.unit}`,
      Title: l.title.slice(0, 35),
      Kana: kanaCount,
      Grammar: grammarCount,
      Vocab: vocabCount,
      Kanji: kanjiCount,
      Total: kanaCount + grammarCount + vocabCount + kanjiCount,
    });
  }

  console.table(summary);

  // 13. Comprehensive Curriculum Validation Report (Lessons 1-30)
  console.log('\n======================================================');
  console.log('            CURRICULUM VALIDATION REPORT              ');
  console.log('======================================================');
  let allValid = true;
  for (const l of allLessons) {
    const kCount = await KanaEntry.countDocuments({ lessonId: l._id });
    const gCount = await GrammarPoint.countDocuments({ lessonId: l._id });
    const vCount = await VocabEntry.countDocuments({ lessonId: l._id });
    const kjCount = await KanjiEntry.countDocuments({ lessonId: l._id });
    const totalItems = kCount + gCount + vCount + kjCount;

    // Check for duplicate vocabulary within the same lesson
    const vocabList = await VocabEntry.find({ lessonId: l._id }).lean();
    const vocabKanjiSet = new Set();
    let hasDupeVocab = false;
    for (const v of vocabList) {
      const key = v.kanji || v.kana;
      if (vocabKanjiSet.has(key)) hasDupeVocab = true;
      vocabKanjiSet.add(key);
    }

    const isValid = totalItems > 0 && !hasDupeVocab;
    if (!isValid) allValid = false;
    const status = isValid ? '✓ VALID' : '✗ ISSUE';
    console.log(`Lesson ${String(l.order).padStart(2, ' ')}: ${l.title.padEnd(38, ' ')} [${status}] (G:${gCount}, V:${vCount}, K:${kjCount}, Kana:${kCount})`);
  }
  console.log(`\nOverall Curriculum Status: ${allValid ? 'ALL 30 LESSONS VERIFIED PASSING ✓' : 'SOME LESSONS REQUIRE ATTENTION ✗'}`);
  console.log('======================================================\n');

  const totalUserCards = await UserCard.countDocuments({});
  const dueUserCards = await UserCard.countDocuments({ nextReviewDate: { $lte: new Date() } });
  console.log(`SM-2 Cards in Queue: ${totalUserCards} total, ${dueUserCards} currently due.`);
  console.log('======================================================\n');

  await mongoose.disconnect();
  console.log('Disconnected. Seed process complete.');
}

main().catch(err => {
  console.error('Fatal seed error:', err);
  process.exit(1);
});
