import mongoose from 'mongoose';

const { Schema } = mongoose;

export const UserProgressSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    completedLessonIds: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }],
    currentLessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
    lessonScores: [
      {
        lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson' },
        score: { type: Number },
        completedAt: { type: Date, default: Date.now },
      },
    ],
    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.UserProgress || mongoose.model('UserProgress', UserProgressSchema);
