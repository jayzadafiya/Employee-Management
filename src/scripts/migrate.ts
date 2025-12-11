import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import config from '@config/config';
import Employee from '@modules/employee/employee.model';
import Review from '@modules/review/review.model';

interface MongoExtendedJSON {
  _id?: { $oid: string };
  employeeId?: { $oid: string };
  reviewerId?: { $oid: string };
  createdAt?: { $date: string };
  [key: string]: unknown;
}

interface EmployeeData extends MongoExtendedJSON {
  firstName: string;
  lastName: string;
  department: string;
}

interface ReviewData extends MongoExtendedJSON {
  rating: number;
}

const parseMongoExtendedJSON = (data: MongoExtendedJSON) => {
  const parsed: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === 'object') {
      if ('$oid' in value) {
        parsed[key] = new mongoose.Types.ObjectId((value as { $oid: string }).$oid);
      } else if ('$date' in value) {
        parsed[key] = new Date((value as { $date: string }).$date);
      } else {
        parsed[key] = value;
      }
    } else {
      parsed[key] = value;
    }
  }

  return parsed;
};

const migrate = async () => {
  try {
    console.log('🚀 Starting migration...');

    console.log('📡 Connecting to MongoDB...');
    console.log(`   URI: ${config.mongoUri}`);
    await mongoose.connect(config.mongoUri);
    console.log('✅ Connected to MongoDB');

    console.log('🗑️  Clearing existing data...');
    await Employee.deleteMany({});
    await Review.deleteMany({});
    console.log('✅ Cleared existing data');

    console.log('📖 Reading employees data...');
    const employeesPath = path.join(__dirname, '../../data/employees.json');
    const employeesRaw = fs.readFileSync(employeesPath, 'utf-8');
    const employeesData: EmployeeData[] = JSON.parse(employeesRaw);

    console.log(`📥 Importing ${employeesData.length} employees...`);
    const employees = employeesData.map((emp) => parseMongoExtendedJSON(emp));
    await Employee.insertMany(employees);
    console.log(`✅ Imported ${employees.length} employees`);

    console.log('📖 Reading reviews data...');
    const reviewsPath = path.join(__dirname, '../../data/reviews.json');
    const reviewsRaw = fs.readFileSync(reviewsPath, 'utf-8');
    const reviewsData: ReviewData[] = JSON.parse(reviewsRaw);

    console.log(`📥 Importing ${reviewsData.length} reviews...`);
    const reviews = reviewsData.map((rev) => parseMongoExtendedJSON(rev));
    await Review.insertMany(reviews);
    console.log(`✅ Imported ${reviews.length} reviews`);

    console.log('\n✅ Migration completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Employees: ${employees.length}`);
    console.log(`   - Reviews: ${reviews.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      console.error('\n⚠️  MongoDB connection refused. Please ensure MongoDB is running.');
      console.error('   Start MongoDB with: mongod');
    }
    process.exit(1);
  }
};

migrate();
