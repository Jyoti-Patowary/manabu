import mongoose from 'mongoose';

const { Schema } = mongoose;

export const KanjiEntrySchema = new Schema(
  {
    character: { type: String, required: true, unique: true },
    unicode: { type: String, required: true },
    onyomi: [{ type: String }],
    kunyomi: [{ type: String }],
    meanings: [{ type: String, required: true }],
    strokeCount: { type: Number, required: true },
    strokeOrderSvg: { type: String, default: '' },
    radicals: [{ type: String }],
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true, index: true },
    grade: { type: Number },
    jlptLevel: { type: String, enum: ['N5', 'N4', 'N3', 'N2', 'N1', null], default: null },

    // Deep Understanding Course Contexts & Educational Fields
    courseContexts: [
      {
        lesson: { type: Number, required: true },
        lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson' },
        vocabulary: { type: String, required: true },
        reading: { type: String, required: true },
        romaji: { type: String, default: '' },
        meaning: { type: String, default: '' },
      },
    ],
    primaryVocabulary: { type: String, default: '' },
    lessonReading: { type: String, default: '' },
    lessonRomaji: { type: String, default: '' },
    coreMeaning: { type: String, default: '' },
    relevantReading: { type: String, default: '' },
    whyAppearsHere: { type: String, default: '' },
    courseRelevance: { type: String, default: '' },
    exampleWords: [
      {
        word: { type: String },
        reading: { type: String },
        meaning: { type: String },
      },
    ],
  },
  { timestamps: true }
);

KanjiEntrySchema.index({ jlptLevel: 1 });

export default mongoose.models.KanjiEntry || mongoose.model('KanjiEntry', KanjiEntrySchema);
