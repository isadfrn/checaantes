import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Profession } from '../professions/entities/profession.entity.js';
import { ViolationCategory } from '../professions/entities/violation-category.entity.js';
import { User } from '../auth/entities/user.entity.js';

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [Profession, ViolationCategory, User],
  migrations: ['src/database/migrations/*.ts'],
});
