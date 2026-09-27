import mongoose from 'mongoose';

const { Schema } = mongoose;

export const VocabEntrySchema = new Schema(
  {
    kanji: { type: String, default: '' },
    kana: { type: String, required: true },
    meanings: [{ type: String, required: true }],
    partOfSpeech: [{ type: String }],
    jmdictSeq: { type: Number, index: true },
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true, index: true },
    reviewedInLessonIds: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
    thematicCategory: { type: String, default: '', index: true },
    pitchAccent: { type: String, default: '' },
    jlptLevel: { type: String, enum: ['N5', 'N4', 'N3', 'N2', 'N1', null], default: null },
    exampleSentenceIds: [{ type: Schema.Types.ObjectId, ref: 'ExampleSentence' }],

    // Deep Understanding Educational Fields
    romaji: { type: String, default: '' },
    literalMeaning: { type: String, default: '' },
    naturalMeaning: { type: String, default: '' },
    usage: { type: String, default: '' },
    nuance: { type: String, default: '' },
    register: { type: String, default: '' },
    collocations: [{ type: String }],
    commonMistakes: { type: String, default: '' },
    courseLevel: { type: String, default: 'N5 Foundation' },
    kanjiNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

VocabEntrySchema.index({ kanji: 1, kana: 1 });
VocabEntrySchema.index({ jlptLevel: 1 });

export default mongoose.models.VocabEntry || mongoose.model('VocabEntry', VocabEntrySchema);
