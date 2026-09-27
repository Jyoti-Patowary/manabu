import mongoose from 'mongoose';

const { Schema } = mongoose;

export const UserCardSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    cardType: {
      type: String,
      enum: ['vocab', 'kanji', 'grammar', 'kana'],
      required: true,
    },
    cardModel: {
      type: String,
      enum: ['VocabEntry', 'KanjiEntry', 'GrammarPoint', 'KanaEntry'],
      required: true,
    },
    cardId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'cardModel',
    },
    interval: { type: Number, default: 0 },
    easeFactor: { type: Number, default: 2.5 },
    repetitions: { type: Number, default: 0 },
    nextReviewDate: { type: Date, default: Date.now, index: true },
    lastStudiedAt: { type: Date },
  },
  { timestamps: true }
);

// High-performance index for querying user due review queue
UserCardSchema.index({ userId: 1, nextReviewDate: 1 });
// Ensure one unique card state per user and entity
UserCardSchema.index({ userId: 1, cardId: 1 }, { unique: true });

export default mongoose.models.UserCard || mongoose.model('UserCard', UserCardSchema);
