import connectDB from './mongodb.js';
import Lesson from '../models/Lesson.js';
import KanaEntry from '../models/KanaEntry.js';
import GrammarPoint from '../models/GrammarPoint.js';
import VocabEntry from '../models/VocabEntry.js';
import KanjiEntry from '../models/KanjiEntry.js';
import ExampleSentence from '../models/ExampleSentence.js';
import UserCard from '../models/UserCard.js';
import UserProgress from '../models/UserProgress.js';
import User from '../models/User.js';

/**
 * SM-2 Spaced Repetition calculation
 * @param {Object} card Current card state (interval, repetitions, easeFactor)
 * @param {number} rating User grade: 1 (Again), 2 (Hard), 3 (Good), 4 (Easy)
 * @returns {Object} Updated SM-2 fields
 */
export function calculateSM2(card = {}, rating = 3) {
  let repetitions = Number(card.repetitions || 0);
  let interval = Number(card.interval || 0);
  let easeFactor = Number(card.easeFactor || card.ease_factor || 2.5);

  if (rating < 3) {
    repetitions = 0;
    interval = 1;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  } else {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
    easeFactor = Math.max(1.3, easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02)));
  }

  const nextReviewDate = new Date(Date.now() + interval * 86400000);
  const mastered = repetitions >= 2 && interval >= 7;

  return {
    repetitions,
    interval,
    easeFactor: Number(easeFactor.toFixed(2)),
    ease_factor: Number(easeFactor.toFixed(2)),
    nextReviewDate,
    dueDate: nextReviewDate.getTime(),
    mastered,
  };
}

/**
 * Evaluates lesson prerequisite gating logic
 * A lesson is locked if any prerequisite ID is not in completedLessonIds
 */
export function isLessonGated(lesson, completedLessonIds = []) {
  if (!lesson || !Array.isArray(lesson.prerequisiteLessonIds) || lesson.prerequisiteLessonIds.length === 0) {
    return false;
  }

  const completedSet = new Set((completedLessonIds || []).map(id => String(id)));
  return lesson.prerequisiteLessonIds.some(prereqId => !completedSet.has(String(prereqId)));
}

/**
 * Get or create default user & progress for session
 */
export async function getOrCreateDefaultUser() {
  await connectDB();
  let user = await User.findOne({ email: 'demo@manabu.app' });
  if (!user) {
    user = await User.create({
      username: 'demo_student',
      email: 'demo@manabu.app',
      targetLevel: 'N5',
      studyStreak: 1,
    });
  }

  let progress = await UserProgress.findOne({ userId: user._id });
  if (!progress) {
    const firstLesson = await Lesson.findOne({ order: 1 });
    progress = await UserProgress.create({
      userId: user._id,
      completedLessonIds: [],
      currentLessonId: firstLesson?._id,
    });
  }

  return { user, progress };
}

/**
 * Retrieve curriculum lessons with gating & item counts
 */
export async function getCurriculumLessons(userId = null) {
  await connectDB();
  const lessons = await Lesson.find({}).sort({ order: 1 }).lean();

  let completedIds = [];
  let currentId = null;

  if (userId) {
    const progress = await UserProgress.findOne({ userId }).lean();
    if (progress) {
      completedIds = (progress.completedLessonIds || []).map(id => String(id));
      currentId = progress.currentLessonId ? String(progress.currentLessonId) : null;
    }
  }

  // Enrich each lesson with gating and content counts
  const enriched = await Promise.all(
    lessons.map(async (lesson) => {
      const isCompleted = completedIds.includes(String(lesson._id));
      const isLocked = !isCompleted && isLessonGated(lesson, completedIds);
      const isCurrent = currentId ? String(lesson._id) === currentId : (!isLocked && !isCompleted);

      const [kanaCount, grammarCount, vocabCount, kanjiCount] = await Promise.all([
        KanaEntry.countDocuments({ lessonId: lesson._id }),
        GrammarPoint.countDocuments({ lessonId: lesson._id }),
        VocabEntry.countDocuments({ lessonId: lesson._id }),
        KanjiEntry.countDocuments({ lessonId: lesson._id }),
      ]);

      return {
        ...lesson,
        isLocked,
        isCompleted,
        isCurrent,
        itemCount: kanaCount + grammarCount + vocabCount + kanjiCount,
        counts: {
          kana: kanaCount,
          grammar: grammarCount,
          vocab: vocabCount,
          kanji: kanjiCount,
        },
      };
    })
  );

  return enriched;
}

/**
 * Evaluates whether all grammar points of a lesson have been marked as understood
 * @param {Array<string|ObjectId>} lessonGrammarIds All grammar IDs belonging to the lesson
 * @param {Array<string|ObjectId>} enrolledGrammarIds Grammar IDs enrolled in user's SRS
 * @returns {{ canComplete: boolean, remainingCount: number, missingIds: Array }}
 */
export function canCompleteLessonGrammar(lessonGrammarIds = [], enrolledGrammarIds = []) {
  if (!lessonGrammarIds || lessonGrammarIds.length === 0) {
    return { canComplete: true, remainingCount: 0, missingIds: [] };
  }
  const enrolledSet = new Set((enrolledGrammarIds || []).map(id => String(id)));
  const missingIds = lessonGrammarIds.map(id => String(id)).filter(id => !enrolledSet.has(id));
  return {
    canComplete: missingIds.length === 0,
    remainingCount: missingIds.length,
    missingIds,
  };
}

/**
 * Retrieve full lesson detail with grammar, vocab, kanji, kana, and Tatoeba sentences
 */
export async function getLessonDetail(lessonId, userId = null) {
  await connectDB();
  const lesson = await Lesson.findById(lessonId).lean();
  if (!lesson) return null;

  const [grammarPoints, vocabEntries, kanjiEntries, kanaEntries] = await Promise.all([
    GrammarPoint.find({ lessonId: lesson._id }).sort({ order: 1 }).populate('exampleSentenceIds').lean(),
    VocabEntry.find({ lessonId: lesson._id }).populate('exampleSentenceIds').lean(),
    KanjiEntry.find({ lessonId: lesson._id }).lean(),
    KanaEntry.find({ lessonId: lesson._id }).lean(),
  ]);

  let enrolledGrammarPointIds = [];
  if (userId && grammarPoints.length > 0) {
    const enrolledUserCards = await UserCard.find({
      userId,
      cardType: 'grammar',
      cardId: { $in: grammarPoints.map((g) => g._id) },
    }).lean();
    enrolledGrammarPointIds = enrolledUserCards.map((c) => String(c.cardId));
  }

  return {
    lesson,
    grammarPoints,
    vocabEntries,
    kanjiEntries,
    kanaEntries,
    enrolledGrammarPointIds,
  };
}

/**
 * Resolves due review cards for a user by querying UserCard and joining content dynamically
 */
export async function getDueUserCards(userId) {
  await connectDB();
  const now = new Date();

  const dueUserCards = await UserCard.find({
    userId,
    nextReviewDate: { $lte: now },
  }).lean();

  if (dueUserCards.length === 0) {
    return [];
  }

  // Batch IDs by cardModel for single-roundtrip fast resolution
  const groupedIds = {
    VocabEntry: [],
    KanjiEntry: [],
    GrammarPoint: [],
    KanaEntry: [],
  };

  dueUserCards.forEach((c) => {
    if (groupedIds[c.cardModel]) {
      groupedIds[c.cardModel].push(c.cardId);
    }
  });

  const [vocabs, kanjis, grammars, kanas] = await Promise.all([
    VocabEntry.find({ _id: { $in: groupedIds.VocabEntry } }).populate('exampleSentenceIds').lean(),
    KanjiEntry.find({ _id: { $in: groupedIds.KanjiEntry } }).lean(),
    GrammarPoint.find({ _id: { $in: groupedIds.GrammarPoint } }).populate('exampleSentenceIds').lean(),
    KanaEntry.find({ _id: { $in: groupedIds.KanaEntry } }).lean(),
  ]);

  const contentMap = new Map();
  vocabs.forEach((v) => contentMap.set(String(v._id), { ...v, resolvedType: 'vocab' }));
  kanjis.forEach((k) => contentMap.set(String(k._id), { ...k, resolvedType: 'kanji' }));
  grammars.forEach((g) => contentMap.set(String(g._id), { ...g, resolvedType: 'grammar' }));
  kanas.forEach((kn) => contentMap.set(String(kn._id), { ...kn, resolvedType: 'kana' }));

  return dueUserCards
    .map((userCard) => {
      const content = contentMap.get(String(userCard.cardId));
      if (!content) return null;

      return {
        id: String(userCard._id),
        userCardId: String(userCard._id),
        cardId: String(userCard.cardId),
        cardType: userCard.cardType,
        cardModel: userCard.cardModel,
        interval: userCard.interval,
        repetitions: userCard.repetitions,
        easeFactor: userCard.easeFactor,
        nextReviewDate: userCard.nextReviewDate,
        dueDate: new Date(userCard.nextReviewDate).getTime(),
        content,
        // Canonical front/back mappings
        kanji: content.kanji || content.character || content.pattern || '',
        reading: content.kana || content.reading || content.romaji || (content.onyomi?.[0] || ''),
        meaning: Array.isArray(content.meanings) ? content.meanings.join(', ') : (content.explanation || content.title || ''),
        example: content.exampleSentenceIds?.[0]?.japanese || '',
        exampleMeaning: content.exampleSentenceIds?.[0]?.english || '',
        content_type: userCard.cardType,
        jlpt_level: content.jlptLevel || null,
      };
    })
    .filter(Boolean);
}

/**
 * Record review rating for a UserCard, updating SM-2 and next review date
 */
export async function recordUserCardReview(userId, userCardId, rating) {
  await connectDB();
  const userCard = await UserCard.findOne({ _id: userCardId, userId });
  if (!userCard) {
    throw new Error('UserCard not found');
  }

  const sm2Update = calculateSM2(userCard, rating);

  userCard.repetitions = sm2Update.repetitions;
  userCard.interval = sm2Update.interval;
  userCard.easeFactor = sm2Update.easeFactor;
  userCard.nextReviewDate = sm2Update.nextReviewDate;
  userCard.lastStudiedAt = new Date();

  await userCard.save();
  return { success: true, userCard: userCard.toObject(), sm2Update };
}

/**
 * Enroll an individual grammar point into the user's SRS review queue
 */
export async function enrollGrammarPointInSRS(userId, grammarPointId) {
  await connectDB();
  const grammar = await GrammarPoint.findById(grammarPointId);
  if (!grammar) {
    throw new Error('Grammar point not found');
  }

  const userCard = await UserCard.findOneAndUpdate(
    { userId, cardId: grammar._id },
    {
      $setOnInsert: {
        userId,
        cardId: grammar._id,
        cardType: 'grammar',
        cardModel: 'GrammarPoint',
        interval: 0,
        repetitions: 0,
        easeFactor: 2.5,
        nextReviewDate: new Date(),
      },
    },
    { upsert: true, new: true }
  );

  return {
    success: true,
    userCard: userCard.toObject ? userCard.toObject() : userCard,
  };
}

/**
 * Mark a lesson as completed, advance UserProgress, and automatically enqueue lesson items into UserCard
 * Note: Grammar points must be individually enrolled before completion; Vocab, Kana, and Kanji are bulk-enrolled.
 */
export async function markLessonComplete(userId, lessonId) {
  await connectDB();
  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    throw new Error('Lesson not found');
  }

  // Validate that all grammar points of this lesson have been individually marked as understood / enrolled
  const grammars = await GrammarPoint.find({ lessonId: lesson._id });
  if (grammars.length > 0) {
    const enrolledCards = await UserCard.find({
      userId,
      cardType: 'grammar',
      cardId: { $in: grammars.map(g => g._id) },
    }).lean();
    const enrolledIds = enrolledCards.map(c => String(c.cardId));
    const check = canCompleteLessonGrammar(grammars.map(g => g._id), enrolledIds);
    if (!check.canComplete) {
      throw new Error(`Cannot complete lesson: ${check.remainingCount} grammar point(s) must be marked as understood first.`);
    }
  }

  let progress = await UserProgress.findOne({ userId });
  if (!progress) {
    progress = new UserProgress({
      userId,
      completedLessonIds: [],
      currentLessonId: lesson._id,
    });
  }

  const completedSet = new Set(progress.completedLessonIds.map(id => String(id)));
  completedSet.add(String(lesson._id));
  progress.completedLessonIds = Array.from(completedSet);

  // Find next lesson in curriculum order
  const nextLesson = await Lesson.findOne({ order: { $gt: lesson.order } }).sort({ order: 1 });
  if (nextLesson) {
    progress.currentLessonId = nextLesson._id;
  }
  progress.lastActiveAt = new Date();
  await progress.save();

  // Enqueue lesson items into UserCard SRS queue: Vocab, Kana, and Kanji are bulk-enrolled
  const [vocabs, kanas, kanjis] = await Promise.all([
    VocabEntry.find({ lessonId: lesson._id }),
    KanaEntry.find({ lessonId: lesson._id }),
    KanjiEntry.find({ lessonId: lesson._id }),
  ]);

  const cardsToUpsert = [
    ...vocabs.map(v => ({ cardId: v._id, cardType: 'vocab', cardModel: 'VocabEntry' })),
    ...kanas.map(k => ({ cardId: k._id, cardType: 'kana', cardModel: 'KanaEntry' })),
    ...kanjis.map(kj => ({ cardId: kj._id, cardType: 'kanji', cardModel: 'KanjiEntry' })),
  ];

  for (const item of cardsToUpsert) {
    await UserCard.findOneAndUpdate(
      { userId, cardId: item.cardId },
      {
        $setOnInsert: {
          userId,
          cardId: item.cardId,
          cardType: item.cardType,
          cardModel: item.cardModel,
          interval: 0,
          repetitions: 0,
          easeFactor: 2.5,
          nextReviewDate: new Date(), // Due immediately upon completing lesson
        },
      },
      { upsert: true }
    );
  }

  return {
    success: true,
    progress: progress.toObject(),
    enqueuedCount: cardsToUpsert.length + grammars.length,
    nextLesson: nextLesson ? nextLesson.toObject() : null,
  };
}
