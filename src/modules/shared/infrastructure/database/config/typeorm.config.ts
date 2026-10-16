import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getTypeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const isProd = configService.get<string>('NODE_ENV') === 'production';
  const isCloudOrSsl =
    isProd ||
    configService.get<string>('DATABASE_SSL') === 'true' ||
    configService.get<string>('DATABASE_HOST', '').includes('supabase');

  return {
    type: 'postgres',
    host: configService.get<string>('DATABASE_HOST'),
    port: configService.get<number>('DATABASE_PORT', 5432),
    username: configService.get<string>('DATABASE_USERNAME', 'postgres'),
    password: configService.get<string>('DATABASE_PASSWORD'),
    database: configService.get<string>('DATABASE_NAME', 'postgres'),
    autoLoadEntities: true,
    synchronize: false,
    ssl: isCloudOrSsl ? { rejectUnauthorized: false } : false,
    logging: !isProd,
  };
};
