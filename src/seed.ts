import { Logger } from '@nestjs/common';
import { AppDataSource } from './modules/shared/infrastructure/database/config/data-source';
import { seedDefaultPanelTemplates } from './modules/panels/infrastructure/database/seeders/panel-templates.seed';
import { seedPilotTenant } from './modules/shared/infrastructure/database/seeders/pilot-tenant.seed';

const logger = new Logger('DatabaseSeeder');

async function runSeed() {
  try {
    logger.log('Initializing database connection for seeding...');
    await AppDataSource.initialize();
    const targetModule = process.env.SEED_MODULE || 'all';
    logger.log(`Target seeder module: ${targetModule}`);

    if (targetModule === 'all' || targetModule === 'panels') {
      logger.log('Seeding clinical panel templates...');
      await seedDefaultPanelTemplates(AppDataSource);
      logger.log('Clinical panel templates seeded successfully.');
    }

    if (targetModule === 'all' || targetModule === 'pilot') {
      logger.log("Seeding Dr. Deswal's pilot diagnostic lab...");
      await seedPilotTenant(AppDataSource);
      logger.log("Pilot tenant seeded successfully.");
    }

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
