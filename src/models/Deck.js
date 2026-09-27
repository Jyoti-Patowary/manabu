import mongoose from 'mongoose';

export const CardSchema = new mongoose.Schema(
  {
    content_type: {
      type: String,
      enum: ["vocab", "kanji", "grammar", "kana"],
      default: "vocab",
    },
    jlpt_level: {
      type: String,
      enum: ["N5", "N4", "N3", "N2", "N1", null],
      default: null,
    },
    relationships: {
      type: [
        {
          card_id: { type: String, required: true },
          relationship_type: {
            type: String,
            enum: ["uses_kanji", "used_in_vocab", "paired_grammar", "prerequisite", "similar_to", "counterpart"],
            required: true,
          },
        },
      ],
      default: [],
    },
    kana_type: {
      type: String,
      enum: ["hiragana", "katakana", ""],
      default: "",
    },
    script_group: {
      type: String,
      enum: ["gojuon", "dakuon", "yoon", ""],
      default: "",
    },
    counterpart: {
      type: String,
      default: "",
    },
    mastered: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: ["vocab", "grammar", "kanji", "hiragana", "katakana", "kana"],
      default: "vocab",
    },
    category: {
      type: String,
      default: "",
    },
    jlpt: {
      type: String,
      enum: ["N5", "N4", "N3", "N2", "N1", "JLPT_N5", "JLPT_N4", "JLPT_N3", "JLPT_N2", "JLPT_N1", ""], 
      default: "", 
    },
    tags: {
      type: [String],
      default: [],
    },
    kanji: { type: String, default: "" },
    reading: { type: String, default: "" },
    romaji: { type: String, default: "" },
    onyomi: { type: String, default: "" },
    kunyomi: { type: String, default: "" },
    strokes: { type: Number, default: 0 },
    kanjiType: { type: String, default: "" },
    usageFrequency: { type: String, default: "" },
    definition: { type: String, default: "" },
    usage: { type: String, default: "" },
    howToUse: { type: String, default: "" },
    meaning: { type: String, required: true },
    partOfSpeech: { type: String, default: "" },
    example: { type: String, default: "" },
    exampleReading: { type: String, default: "" },
    exampleMeaning: { type: String, default: "" },
    examples: { type: [String], default: [] },
    wordExamples: { type: [Object], default: [] },
    sentenceExamples: { type: [Object], default: [] },
    grammar: { type: String, default: "" },
    formation: { type: String, default: "" },
    grammarExamples: [
      {
        japanese: { type: String, default: "" },
        reading: { type: String, default: "" },
        english: { type: String, default: "" },
      },
    ],
    negative: { type: String, default: "" },
    past: { type: String, default: "" },
    pastNegative: { type: String, default: "" },
    commonMistake: { type: String, default: "" },
    formalAlternative: { type: String, default: "" },
    interval: { type: Number, default: 0 },
    repetitions: { type: Number, default: 0 },
    ease_factor: { type: Number, default: 2.5 },
    easeFactor: { type: Number, default: 2.5 },
    next_review_date: { 
      type: Number, 
      default: () => Date.now() 
    },
    dueDate: { 
      type: Number, 
      default: () => Date.now() 
    },
  },
  {
    timestamps: true, 
  }
);

export const DeckSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true 
    },
    cards: [CardSchema],
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.Deck) {
  delete mongoose.models.Deck;
}

const Deck = mongoose.model('Deck', DeckSchema);

export default Deck;