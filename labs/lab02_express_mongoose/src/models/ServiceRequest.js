import mongoose from 'mongoose';

export const PRIORITIES = ['low', 'medium', 'high'];
// Statuses are plain stored values for now; a transition workflow is a later assignment.
export const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];

const serviceRequestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000,
    },
    priority: {
      type: String,
      enum: PRIORITIES,
      default: 'medium',
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'Open',
    },
  },
  { timestamps: true },
);

serviceRequestSchema.index({ category: 1, status: 1 });

const ServiceRequest =
  mongoose.models.ServiceRequest || mongoose.model('ServiceRequest', serviceRequestSchema);

export default ServiceRequest;
