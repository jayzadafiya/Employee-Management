import Review from './review.model';
import { PipelineStage } from 'mongoose';
import AppError from '@utils/appError';
import { ITopPerformer } from '@types';

export const getTopPerformers = async (): Promise<ITopPerformer[]> => {
  try {
    const pipeline: PipelineStage[] = [
      {
        $group: {
          _id: '$employeeId',
          averageRating: { $avg: '$rating' },
          numberOfReviews: { $sum: 1 },
        },
      },
      {
        $match: {
          numberOfReviews: { $gte: 2 },
        },
      },
      {
        $sort: {
          averageRating: -1,
        },
      },
      {
        $limit: 3,
      },
      {
        $lookup: {
          from: 'employees',
          localField: '_id',
          foreignField: '_id',
          as: 'employeeDetails',
        },
      },
      {
        $unwind: '$employeeDetails',
      },
      {
        $project: {
          _id: 1,
          firstName: '$employeeDetails.firstName',
          lastName: '$employeeDetails.lastName',
          department: '$employeeDetails.department',
          averageRating: { $round: ['$averageRating', 2] },
          numberOfReviews: 1,
        },
      },
    ];

    const topPerformers = await Review.aggregate(pipeline);

    return topPerformers;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new AppError(`Failed to fetch top performers: ${errorMessage}`, 500);
  }
};
