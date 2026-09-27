import mongoose from 'mongoose';

const { Schema } = mongoose;

export const ExampleSentenceSchema = new Schema(
  {
    japanese: { type: String, required: true },
    furigana: { type: String, default: '' },
    english: { type: String, required: true },
    tatoebaId: { type: Number, index: true },
    relatedVocabIds: [{ type: Schema.Types.ObjectId, ref: 'VocabEntry' }],
    relatedGrammarId: { type: Schema.Types.ObjectId, ref: 'GrammarPoint', index: true },

    // Deep Understanding Educational Fields
    romaji: { type: String, default: '' },
    naturalEnglish: { type: String, default: '' },
    breakdown: [
      {
        japanese: { type: String },
        reading: { type: String },
        romaji: { type: String },
        english: { type: String },
        role: { type: String },
      },
    ],
    grammarNote: { type: String, default: '' },
  },
  { timestamps: true }
);

ExampleSentenceSchema.index({ relatedVocabIds: 1 });

export default mongoose.models.ExampleSentence || mongoose.model('ExampleSentence', ExampleSentenceSchema);
