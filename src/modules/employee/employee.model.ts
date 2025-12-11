import { Schema, model } from 'mongoose';
import { IEmployee } from '@types';

const employeeSchema = new Schema<IEmployee>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

employeeSchema.index({ department: 1 });
employeeSchema.index({ firstName: 1, lastName: 1 });

const Employee = model<IEmployee>('Employee', employeeSchema);

export default Employee;
