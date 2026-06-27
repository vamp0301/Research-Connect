import mongoose from 'mongoose';

const keywordSchema = new mongoose.Schema(
  {
    keyword: {
      type: String,
      required: [true, 'Keyword is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

// Text Index for keyword searching
keywordSchema.index({ keyword: 'text' });

// Pre-save hook to generate URL slug from keyword
keywordSchema.pre('save', function (next) {
  if (this.isModified('keyword')) {
    this.slug = this.keyword
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s-]+/g, '-');
  }
  next();
});

const Keyword = mongoose.model('Keyword', keywordSchema);
export default Keyword;
