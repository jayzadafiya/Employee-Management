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
export const listEmployeesWithCursor = async (
  cursor: string | null = null,
  limit: number = 10,
  filters: IEmployeeFilters = {}
) => {
  try {
    const matchStage = buildMatchStage(filters);

    if (cursor) {
      try {
        const decodedCursor = Buffer.from(cursor, 'base64').toString('utf-8');
        const cursorData = JSON.parse(decodedCursor);
        matchStage._id = { $lt: cursorData._id };
      } catch (error) {
        throw new AppError('Invalid cursor format', 400);
      }
    }

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
        $sort: { _id: -1 },
      },
      { $limit: limit + 1 },
    ];

    const employees = await Employee.aggregate(pipeline);

    const hasNext = employees.length > limit;
    if (hasNext) {
      employees.pop();
    }

    let nextCursor = null;
    if (hasNext && employees.length > 0) {
      const lastEmployee = employees[employees.length - 1];
      const cursorData = { _id: lastEmployee._id };
      nextCursor = Buffer.from(JSON.stringify(cursorData)).toString('base64');
    }

    return {
      employees,
      pagination: {
        nextCursor,
        prevCursor: cursor,
        hasNext,
        hasPrev: cursor !== null,
        limit,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new AppError(`Failed to fetch employees: ${errorMessage}`, 500);
  }
};
