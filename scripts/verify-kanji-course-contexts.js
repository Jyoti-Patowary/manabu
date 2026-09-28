import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import KanjiEntry from '../src/models/KanjiEntry.js';
import VocabEntry from '../src/models/VocabEntry.js';
import Lesson from '../src/models/Lesson.js';
import { KANJI_COURSE_CONTEXTS } from '../src/lib/kanjiContextualReadings.js';

async function verifyKanjiSystem() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB Atlas for Kanji System Audit.\n');

  const kanjiDocs = await KanjiEntry.find().lean();
  const vocabDocs = await VocabEntry.find().lean();
  const lessonDocs = await Lesson.find().lean();

  const lessonMap = new Map();
  lessonDocs.forEach((l) => lessonMap.set(String(l._id), l));

  // Build lookup of valid vocabulary
  const vocabLookup = new Set();
  const vocabReadingMap = new Map();
  for (const v of vocabDocs) {
    if (v.kanji) {
      vocabLookup.add(v.kanji);
      vocabReadingMap.set(v.kanji, v.kana);
    }
  }

  // Foundational L6 kanji
  const L6_CHARS = new Set(['一', '二', '三', '日', '月', '木', '山', '川', '人', '口']);
  for (const c of L6_CHARS) {
    vocabLookup.add(c);
  }

  console.log('==================================================');
  console.log('        KANJI COURSE CONTEXTS AUDIT REPORT        ');
  console.log('==================================================\n');

  // 1. COVERAGE
  const totalCurriculumKanji = kanjiDocs.length;
  const kanjiWithContext = kanjiDocs.filter(
    (k) => (k.courseContexts && k.courseContexts.length > 0) || (KANJI_COURSE_CONTEXTS[k.character]?.length > 0)
  );
  const kanjiWithoutContext = kanjiDocs.filter(
    (k) => (!k.courseContexts || k.courseContexts.length === 0) && (!KANJI_COURSE_CONTEXTS[k.character] || KANJI_COURSE_CONTEXTS[k.character].length === 0)
  );

  console.log('--- 1. COVERAGE ---');
  console.log(`• Total unique curriculum Kanji: ${totalCurriculumKanji}`);
  console.log(`• Kanji with at least one course context: ${kanjiWithContext.length}`);
  console.log(`• Kanji without course context: ${kanjiWithoutContext.length}`);
  if (kanjiWithoutContext.length > 0) {
    console.log(`  Missing: ${kanjiWithoutContext.map((k) => k.character).join(', ')}`);
  }
  console.log('-------------------\n');

  // 2. INTEGRITY
  let missingVocabRef = 0;
  let missingLessonRef = 0;
  let missingReading = 0;
  let missingRomaji = 0;
  let emptyLearnerReadings = 0;
  let duplicateContexts = 0;

  for (const k of kanjiDocs) {
    const contexts = (k.courseContexts && k.courseContexts.length > 0)
      ? k.courseContexts
      : (KANJI_COURSE_CONTEXTS[k.character] || []);

    if (!k.lessonReading || k.lessonReading.trim() === '') {
      emptyLearnerReadings++;
    }

    const seenContexts = new Set();
    for (const ctx of contexts) {
      if (!ctx.vocabulary || ctx.vocabulary.trim() === '') missingVocabRef++;
      if (!ctx.lesson || ctx.lesson < 1 || ctx.lesson > 30) missingLessonRef++;
      if (!ctx.reading || ctx.reading.trim() === '') missingReading++;
      if (!ctx.romaji || ctx.romaji.trim() === '') missingRomaji++;

      const key = `${ctx.lesson}-${ctx.vocabulary}-${ctx.reading}`;
      if (seenContexts.has(key)) {
        duplicateContexts++;
      } else {
        seenContexts.add(key);
      }
    }
  }

  console.log('--- 2. INTEGRITY ---');
  console.log(`• Missing vocabulary reference: ${missingVocabRef}`);
  console.log(`• Missing lesson reference: ${missingLessonRef}`);
  console.log(`• Missing vocabulary reading: ${missingReading}`);
  console.log(`• Missing romaji: ${missingRomaji}`);
  console.log(`• Empty learner-facing readings: ${emptyLearnerReadings}`);
  console.log(`• Duplicate identical contexts: ${duplicateContexts}`);
  console.log('--------------------\n');

  // 3. SUSPICIOUS MAPPINGS CHECK
  const suspiciousTruncated = [];
  const suspiciousUnrelated = [];
  const suspiciousCompoundOnly = [];
  const suspiciousUnsupported = [];
  const suspiciousCollapsedSlashes = [];

  for (const k of kanjiDocs) {
    const contexts = (k.courseContexts && k.courseContexts.length > 0)
      ? k.courseContexts
      : (KANJI_COURSE_CONTEXTS[k.character] || []);

    // Check for collapsed readings (e.g. "なに / なん")
    if (k.lessonReading && k.lessonReading.includes('/')) {
      suspiciousCollapsedSlashes.push({ char: k.character, reading: k.lessonReading });
    }

    for (const ctx of contexts) {
      // Check truncated stem (e.g. 冷 with reading "つめ" instead of "つめたい")
      if (ctx.vocabulary && ctx.vocabulary.length > 1 && ctx.reading) {
        // If the vocabulary is an adjective or verb ending in okurigana (e.g. 冷たい, 忙しい, 入る)
        // and the reading is cut off before the okurigana, flag it.
        const okuriganaMatch = ctx.vocabulary.match(/[ぁ-ん]+$/);
        if (okuriganaMatch) {
          const endingKana = okuriganaMatch[0];
          if (!ctx.reading.endsWith(endingKana) && ctx.reading.length < ctx.vocabulary.length) {
            suspiciousTruncated.push({ char: k.character, vocab: ctx.vocabulary, reading: ctx.reading });
          }
        }
      }

      // Check if vocabulary exists in curriculum
      if (!vocabLookup.has(ctx.vocabulary)) {
        suspiciousUnsupported.push({ char: k.character, vocab: ctx.vocabulary });
      }

      // Check if reading is unsupported by vocabulary reading
      if (vocabReadingMap.has(ctx.vocabulary)) {
        const expectedKana = vocabReadingMap.get(ctx.vocabulary);
        if (ctx.reading !== expectedKana) {
          suspiciousUnsupported.push({
            char: k.character,
            vocab: ctx.vocabulary,
            reading: ctx.reading,
            expected: expectedKana,
          });
        }
      }

      // Check if context claims a full compound word is the reading of a single kanji without vocabulary wrapping
      if (ctx.vocabulary === k.character && ctx.reading.length >= 4 && !L6_CHARS.has(k.character)) {
        suspiciousCompoundOnly.push({ char: k.character, reading: ctx.reading });
      }
    }
  }

  console.log('--- 3. SUSPICIOUS MAPPINGS AUDIT ---');
  console.log(`• Truncated stems: ${suspiciousTruncated.length}`);
  if (suspiciousTruncated.length > 0) {
    console.log('  Flagged:', suspiciousTruncated);
  }
  console.log(`• Collapsed multi-reading slashes (e.g. "x / y"): ${suspiciousCollapsedSlashes.length}`);
  if (suspiciousCollapsedSlashes.length > 0) {
    console.log('  Flagged:', suspiciousCollapsedSlashes);
  }
  console.log(`• Full compound pronunciation assigned to single isolated character: ${suspiciousCompoundOnly.length}`);
  if (suspiciousCompoundOnly.length > 0) {
    console.log('  Flagged:', suspiciousCompoundOnly);
  }
  console.log(`• Readings unsupported by source vocabulary: ${suspiciousUnsupported.length}`);
  if (suspiciousUnsupported.length > 0) {
    console.log('  Flagged:', suspiciousUnsupported);
  }
  console.log(`• Unrelated vocabulary words: ${suspiciousUnrelated.length}`);
  console.log('------------------------------------\n');

  // SPOT CHECKS: Lesson 8, Lesson 15, Lesson 20
  console.log('--- SPOT CHECKS ---');
  const spotCheckChars = ['何', '私', '彼', '女', '冷', '結', '美', '知', '開', '一', '山'];
  for (const c of spotCheckChars) {
    const doc = kanjiDocs.find((k) => k.character === c);
    const ctx = doc?.courseContexts || KANJI_COURSE_CONTEXTS[c] || [];
    console.log(
      `${c} | Primary Vocab: "${doc?.primaryVocabulary}" | Reading: "${doc?.lessonReading}" (${doc?.lessonRomaji}) | Meaning: "${doc?.coreMeaning}" | Contexts count: ${ctx.length}`
    );
  }
  console.log('-------------------\n');

  const allPassed =
    kanjiWithoutContext.length === 0 &&
    missingVocabRef === 0 &&
    missingLessonRef === 0 &&
    missingReading === 0 &&
    missingRomaji === 0 &&
    emptyLearnerReadings === 0 &&
    duplicateContexts === 0 &&
    suspiciousTruncated.length === 0 &&
    suspiciousCollapsedSlashes.length === 0 &&
    suspiciousCompoundOnly.length === 0 &&
    suspiciousUnsupported.length === 0;

  if (allPassed) {
    console.log('✅ ALL KANJI SYSTEM CHECKS PASSED PERFECTLY!\n');
  } else {
    console.log('❌ SOME CHECKS FAILED. See details above.\n');
  }

  await mongoose.disconnect();
}

verifyKanjiSystem().catch((err) => {
  console.error(err);
  process.exit(1);
});
