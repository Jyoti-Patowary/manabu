import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../src/lib/mongodb.js';
import Lesson from '../src/models/Lesson.js';
import KanjiEntry from '../src/models/KanjiEntry.js';
import VocabEntry from '../src/models/VocabEntry.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function verifyKanji() {
  await connectDB();
  console.log('Connected to MongoDB for Kanji verification.\n');

  const allKanji = await KanjiEntry.find({}).populate('lessonId').lean();
  console.log(`Total KanjiEntry documents in DB: ${allKanji.length}`);

  let withoutReading = 0;
  let withoutRomaji = 0;
  let invalidReadings = 0;
  let invalidRomaji = 0;

  for (const k of allKanji) {
    const reading = k.lessonReading || k.reading || '';
    const romaji = k.lessonRomaji || k.romaji || '';

    if (!reading || typeof reading !== 'string' || reading.trim() === '') {
      withoutReading++;
    } else if (!/[\u3040-\u309F\u30A0-\u30FF]/.test(reading)) {
      invalidReadings++;
    }

    if (!romaji || typeof romaji !== 'string' || romaji.trim() === '') {
      withoutRomaji++;
    } else if (!/^[a-zA-Z\s\(\)\/\,\.\-\'\`]+$/.test(romaji)) {
      invalidRomaji++;
    }
  }

  console.log('--- AUDIT REPORT ---');
  console.log(`Kanji without learner reading: ${withoutReading}`);
  console.log(`Kanji without romaji: ${withoutRomaji}`);
  console.log(`Invalid/empty readings: ${invalidReadings}`);
  console.log(`Invalid romaji: ${invalidRomaji}`);
  console.log('--------------------\n');

  // Verify Lesson 8 Kanji specifically
  const lesson8 = await Lesson.findOne({ order: 8 }).lean();
  if (lesson8) {
    console.log('--- LESSON 8 KANJI VERIFICATION ---');
    // Targeted Lesson 8 characters specified by user
    const l8TargetChars = ['私', '彼', '女', '学', '生', '先', '会', '社', '員', '本', '友', '達', '誰', '何', '名', '前'];
    for (const char of l8TargetChars) {
      const doc = await KanjiEntry.findOne({ character: char }).lean();
      if (doc) {
        const reading = (doc.lessonReading || doc.reading || '').padEnd(10, ' ');
        const romaji = doc.lessonRomaji || doc.romaji || '';
        console.log(`L8 ${char}  → ${reading} → ${romaji}`);
      } else {
        console.log(`L8 ${char}  → [NOT FOUND IN DB]`);
      }
    }
    console.log('-----------------------------------\n');
  }

  // Verify Lesson 6 Foundational Kanji
  const lesson6 = await Lesson.findOne({ order: 6 }).lean();
  if (lesson6) {
    console.log('--- LESSON 6 FOUNDATIONAL KANJI ---');
    const l6Chars = ['一', '二', '三', '日', '月', '木', '山', '川', '人', '口'];
    for (const char of l6Chars) {
      const doc = await KanjiEntry.findOne({ character: char }).lean();
      if (doc) {
        const reading = (doc.lessonReading || doc.reading || '').padEnd(12, ' ');
        const romaji = doc.lessonRomaji || doc.romaji || '';
        console.log(`L6 ${char}  → ${reading} → ${romaji}`);
      }
    }
    console.log('-----------------------------------\n');
  }

  const success = withoutReading === 0 && withoutRomaji === 0 && invalidReadings === 0 && invalidRomaji === 0 && allKanji.length > 0;
  if (!success) {
    console.error('❌ Validation check failed!');
    process.exit(1);
  } else {
    console.log('✅ All Kanji verification checks passed!');
    process.exit(0);
  }
}

verifyKanji().catch((err) => {
  console.error('Validation error:', err);
  process.exit(1);
});
