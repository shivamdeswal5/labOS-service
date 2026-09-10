import { Logger } from '@nestjs/common';
import { AppDataSource } from './modules/shared/infrastructure/database/config/data-source';
import { seedDefaultPanelTemplates } from './modules/panels/infrastructure/database/seeders/panel-templates.seed';

const logger = new Logger('DatabaseSeeder');

async function runSeed() {
  try {
    logger.log('Initializing database connection for seeding...');
    await AppDataSource.initialize();
    logger.log('Database connected successfully.');

    logger.log('Seeding clinical panel templates...');
    await seedDefaultPanelTemplates(AppDataSource);
    logger.log('Clinical panel templates seeded successfully.');

    await AppDataSource.destroy();
    logger.log('Database connection closed.');
    process.exit(0);
  } catch (error: any) {
    logger.error(`Database seeding failed: ${error.message}`, error.stack);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(1);
  }
}

runSeed();
