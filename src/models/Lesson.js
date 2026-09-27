import mongoose from 'mongoose';

const { Schema } = mongoose;

export const LessonSchema = new Schema(
  {
    order: { type: Number, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    unit: { type: Number, required: true },
    title: { type: String, required: true },
    titleJapanese: { type: String, required: true },
    type: {
      type: String,
      enum: ['writing-system', 'grammar', 'vocab-set', 'kanji-intro'],
      required: true,
    },
    prerequisiteLessonIds: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
    description: { type: String, required: true },
    estimatedMinutes: { type: Number, default: 15 },
  },
  { timestamps: true }
);

LessonSchema.index({ unit: 1, order: 1 });

export default mongoose.models.Lesson || mongoose.model('Lesson', LessonSchema);
