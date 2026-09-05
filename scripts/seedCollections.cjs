const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['vocab', 'grammar', 'kanji', 'hiragana', 'katakana'],
      required: true,
    },
    category: { type: String, default: '' },
    jlpt: {
      type: String,
      enum: ['N5', 'N4', 'N3', 'N2', 'N1', 'JLPT_N5', 'JLPT_N4', 'JLPT_N3', 'JLPT_N2', 'JLPT_N1', ''],
      default: '',
    },
    tags: { type: [String], default: [] },
    kanji: { type: String, default: '' },
    reading: { type: String, default: '' },
    romaji: { type: String, default: '' },
    meaning: { type: String, required: true },
    partOfSpeech: { type: String, default: '' },
    example: { type: String, default: '' },
    exampleReading: { type: String, default: '' },
    exampleMeaning: { type: String, default: '' },
    grammar: { type: String, default: '' },
    formation: { type: String, default: '' },
    usage: { type: String, default: '' },
    grammarExamples: [{
      japanese: { type: String, default: '' },
      reading: { type: String, default: '' },
      english: { type: String, default: '' },
    }],
    negative: { type: String, default: '' },
    past: { type: String, default: '' },
    pastNegative: { type: String, default: '' },
    commonMistake: { type: String, default: '' },
    formalAlternative: { type: String, default: '' },
    interval: { type: Number, default: 0 },
    repetitions: { type: Number, default: 0 },
    easeFactor: { type: Number, default: 2.5 },
    dueDate: { type: Number, default: () => Date.now() },
  },
  { timestamps: true }
);

const deckSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    cards: [cardSchema],
  },
  { timestamps: true }
);

const collectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: '' },
    decks: [deckSchema],
  },
  { timestamps: true }
);

const Collection = mongoose.models.Collection || mongoose.model('Collection', collectionSchema);

const MASTER_COLLECTIONS = [
  {
    name: 'Hiragana',
    description: 'Japanese hiragana fundamentals',
    decks: [
      { name: 'Hiragana Basics', cards: [] },
      { name: 'Hiragana Advanced', cards: [] },
    ],
  },
  {
    name: 'Katakana',
    description: 'Japanese katakana fundamentals',
    decks: [
      { name: 'Katakana Basics', cards: [] },
      { name: 'Katakana Advanced', cards: [] },
    ],
  },
  {
    name: 'Vocabs',
    description: 'Vocabulary decks',
    decks: [
      { name: 'People Vocabs', cards: [] },
      { name: 'Daily Life Vocabs', cards: [] },
      { name: 'Travel Vocabs', cards: [] },
    ],
  },
  {
    name: 'Grammar',
    description: 'Japanese grammar decks',
    decks: [
      { name: 'N5 Grammar', cards: [] },
      { name: 'N4 Grammar', cards: [] },
    ],
  },
  {
    name: 'Kanji',
    description: 'Kanji study decks',
    decks: [
      { name: 'N5 Kanji', cards: [] },
      { name: 'N4 Kanji', cards: [] },
    ],
  },
];

async function seedCollections() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not defined. Add it to your .env.local before running the seed script.');
  }

  await mongoose.connect(mongoUri);

  for (const collectionData of MASTER_COLLECTIONS) {
    const existing = await Collection.findOne({ name: collectionData.name });

    if (existing) {
      console.log(`Collection already exists: ${collectionData.name}`);
      continue;
    }

    const result = await Collection.create(collectionData);
    console.log(`Created collection: ${result.name}`);
  }

  await mongoose.disconnect();
  console.log('Collection seed complete.');
}

seedCollections().catch((error) => {
  console.error('Collection seed failed:', error);
  process.exit(1);
});
