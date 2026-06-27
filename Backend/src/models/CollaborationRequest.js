import mongoose from 'mongoose';

const collaborationRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender is required'],
      index: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Receiver is required'],
      index: true,
    },
    message: {
      type: String,
      required: [true, 'Collaboration request message is required'],
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound Index: Enforce fast lookups of requests between specific users
collaborationRequestSchema.index({ sender: 1, receiver: 1 });

const CollaborationRequest = mongoose.model('CollaborationRequest', collaborationRequestSchema);
export default CollaborationRequest;
