export interface IConfig {
  env: string;
  port: number;
  mongoUri: string;
  jwtSecret: string;
  jwtExpire: string;
}

const config: IConfig = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/employee_management',
  jwtSecret: process.env.JWT_SECRET || 'your_jwt_secret_key',
  jwtExpire: process.env.JWT_EXPIRE || '30d',
};

export default config;
