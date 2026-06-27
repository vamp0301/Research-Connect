import mongoose from 'mongoose';

const userResearchAreaSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    researchArea: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ResearchArea',
      required: [true, 'Research Area is required'],
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound Index: Enforce uniqueness of user-researchArea association
userResearchAreaSchema.index({ user: 1, researchArea: 1 }, { unique: true });

const UserResearchArea = mongoose.model('UserResearchArea', userResearchAreaSchema);
export default UserResearchArea;
