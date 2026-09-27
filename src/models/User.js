import mongoose from 'mongoose';

const { Schema } = mongoose;

export const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, default: '' },
    targetLevel: { type: String, default: 'N5' },
    studyStreak: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);
