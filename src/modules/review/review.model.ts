import { Schema, model } from 'mongoose';
import { IReview } from '@types';

const reviewSchema = new Schema<IReview>(
  {
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      ref: 'Employee',
    },
    reviewerId: {
      type: String,
      required: [true, 'Reviewer ID is required'],
      ref: 'Employee',
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ employeeId: 1 });
reviewSchema.index({ reviewerId: 1 });
reviewSchema.index({ rating: -1 });

const Review = model<IReview>('Review', reviewSchema);

export default Review;
