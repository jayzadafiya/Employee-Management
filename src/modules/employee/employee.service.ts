import Employee from './employee.model';
import { IEmployeeFilters, IEmployeeListResult } from '@types';
import { PipelineStage } from 'mongoose';
import AppError from '@utils/appError';

const buildMatchStage = (filters: IEmployeeFilters): Record<string, unknown> => {
  const matchStage: Record<string, unknown> = {};

  if (filters.department) {
    matchStage.department = filters.department;
  }

  if (filters.firstName) {
    matchStage.firstName = { $regex: filters.firstName, $options: 'i' };
  }

  if (filters.lastName) {
    matchStage.lastName = { $regex: filters.lastName, $options: 'i' };
  }

  return matchStage;
};

export const listEmployees = async (
  page: number = 1,
  limit: number = 10,
  filters: IEmployeeFilters = {}
): Promise<IEmployeeListResult> => {
  try {
    const skip = (page - 1) * limit;
    const matchStage = buildMatchStage(filters);

    const pipeline: PipelineStage[] = [
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'employeeId',
          as: 'reviews',
        },
      },
      {
        $addFields: {
          averageRating: {
            $cond: {
              if: { $gt: [{ $size: '$reviews' }, 0] },
              then: { $round: [{ $avg: '$reviews.rating' }, 2] },
              else: 0,
            },
          },
          numberOfRatings: { $size: '$reviews' },
        },
      },
      {
        $project: {
          reviews: 0,
          __v: 0,
          updatedAt: 0,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ];

    const result = await Employee.aggregate([
      ...pipeline.slice(0, -1),
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [{ $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: limit }],
        },
      },
    ]);

    const total = result[0]?.metadata[0]?.total || 0;
    const employees = result[0]?.data || [];

    return {
      employees,
      total,
      page,
      limit,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new AppError(`Failed to fetch employees: ${errorMessage}`, 500);
  }
};
