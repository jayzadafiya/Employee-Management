import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import connectDB from '@config/database';
import config from '@config/config';

process.on('uncaughtException', (err: Error) => {
  console.error('❌ UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

connectDB();

const server = app.listen(config.port, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   🚀 Employee Management API Server       ║
╠════════════════════════════════════════════╣
║   Environment: ${config.env.padEnd(28)} ║
║   Port: ${String(config.port).padEnd(35)} ║
║   Database: MongoDB                        ║
║   Status: ✅ Running                        ║
╚════════════════════════════════════════════╝
  `);
});

process.on('unhandledRejection', (err: Error) => {
  console.error('❌ UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Process terminated!');
  });
});
