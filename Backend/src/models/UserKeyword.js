import mongoose from 'mongoose';

const userKeywordSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    keyword: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Keyword',
      required: [true, 'Keyword is required'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound Index: Enforce uniqueness of user-keyword association
userKeywordSchema.index({ user: 1, keyword: 1 }, { unique: true });

const UserKeyword = mongoose.model('UserKeyword', userKeywordSchema);
export default UserKeyword;
