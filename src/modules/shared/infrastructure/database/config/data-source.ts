import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const moduleFilter = process.env.MIGRATION_MODULE;
const migrationsPattern = moduleFilter
  ? `dist/modules/${moduleFilter}/infrastructure/database/migrations/*.js`
  : 'dist/modules/**/infrastructure/database/migrations/*.js';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'postgres',
  entities: ['dist/modules/**/domain/**/*.entity.js'],
  migrations: [migrationsPattern],
  synchronize: false,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

export const AppDataSource = new DataSource(dataSourceOptions);
