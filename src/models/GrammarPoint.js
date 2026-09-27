import mongoose from 'mongoose';

const { Schema } = mongoose;

export const GrammarPointSchema = new Schema(
  {
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true, index: true },
    order: { type: Number, required: true },
    title: { type: String, required: true },
    pattern: { type: String, required: true },
    formation: { type: String, required: true },
    explanation: { type: String, required: true },
    notes: { type: String, default: '' },
    caution: { type: String, default: '' },
    exampleSentenceIds: [{ type: Schema.Types.ObjectId, ref: 'ExampleSentence' }],
    jlptLevel: { type: String, enum: ['N5', 'N4', 'N3', 'N2', 'N1', null], default: null },

    // Deep Understanding Educational Fields
    categoryType: {
      type: String,
      enum: ['grammar', 'expression', 'usage-pattern', 'structure'],
      default: 'grammar',
    },
    courseLevel: { type: String, default: 'N5 Foundation' },
    whyItIsUsed: { type: String, default: '' },
    wordBreakdown: [
      {
        japanese: { type: String },
        reading: { type: String },
        romaji: { type: String },
        literal: { type: String },
        role: { type: String },
      },
    ],
    literalMeaning: { type: String, default: '' },
    naturalMeaning: { type: String, default: '' },
    usage: { type: String, default: '' },
    usageNotes: { type: String, default: '' },
    politenessLevel: { type: String, default: '' },
    nuance: { type: String, default: '' },
    whenToUse: { type: String, default: '' },
    whenNotToUse: { type: String, default: '' },
    commonMistakes: [
      {
        incorrect: { type: String },
        correct: { type: String },
        explanation: { type: String },
      },
    ],
    comparison: {
      target: { type: String, default: '' },
      comparisonPoints: [
        {
          label: { type: String },
          itemA: { type: String },
          itemB: { type: String },
          explanation: { type: String },
        },
      ],
    },
    beginnerTip: { type: String, default: '' },
  },
  { timestamps: true }
);

GrammarPointSchema.index({ lessonId: 1, order: 1 });
GrammarPointSchema.index({ jlptLevel: 1 });

export default mongoose.models.GrammarPoint || mongoose.model('GrammarPoint', GrammarPointSchema);
