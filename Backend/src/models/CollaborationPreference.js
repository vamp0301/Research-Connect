import mongoose from 'mongoose';

const collaborationPreferenceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Collaboration preference must belong to a user'],
      unique: true,
      index: true,
    },
    openForCollaboration: {
      type: Boolean,
      default: true,
    },
    collaborationStatus: {
      type: String,
      enum: ['Open', 'Looking for Co-author', 'Joint Research', 'Industry Collaboration', 'Funded Project'],
      default: 'Open',
      index: true,
    },
    projectType: {
      type: [String],
      default: [],
    },
    preferredCountries: {
      type: [String],
      default: [],
    },
    duration: {
      type: String,
      default: '', // e.g. '3-6 months', '1 year+'
    },
    fundingRequired: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const CollaborationPreference = mongoose.model('CollaborationPreference', collaborationPreferenceSchema);
export default CollaborationPreference;
