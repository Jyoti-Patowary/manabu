import mongoose from 'mongoose';

const { Schema } = mongoose;

export const KanaEntrySchema = new Schema(
  {
    character: { type: String, required: true },
    romaji: { type: String, required: true },
    type: { type: String, enum: ['hiragana', 'katakana'], required: true },
    strokeOrderSvg: { type: String, default: '' },
    mnemonic: { type: String, default: '' },
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true, index: true },
  },
  { timestamps: true }
);

KanaEntrySchema.index({ type: 1, romaji: 1 });

export default mongoose.models.KanaEntry || mongoose.model('KanaEntry', KanaEntrySchema);
