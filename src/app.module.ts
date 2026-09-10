import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DatabaseModule } from 'src/modules/shared/infrastructure/database/database.module';
import { SupabaseModule } from 'src/modules/shared/infrastructure/supabase/supabase.module';
import { LoggingModule } from 'src/modules/shared/infrastructure/logging/pino-logger.module';
import { HealthModule } from 'src/modules/shared/infrastructure/health/health.module';
import { QueueModule } from 'src/modules/shared/infrastructure/queue/queue.module';
import { LabsModule } from './modules/labs/labs.module';
import { PanelsModule } from './modules/panels/panels.module';
import { ReportsModule } from './modules/reports/reports.module';
import { ReferralsModule } from './modules/referrals/referrals.module';
import { BillingModule } from './modules/billing/billing.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CollectionsModule } from './modules/collections/collections.module';
import { WebsocketsModule } from './modules/websockets/websockets.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    EventEmitterModule.forRoot(),

    DatabaseModule,
    SupabaseModule,
    LoggingModule,
    HealthModule,
    QueueModule,

    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('THROTTLE_TTL', 60) * 1000,
          limit: config.get<number>('THROTTLE_LIMIT', 100),
        },
      ],
    }),

    LabsModule,
    PanelsModule,
    ReportsModule,
    ReferralsModule,
    BillingModule,
    NotificationsModule,
    CollectionsModule,
    WebsocketsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

