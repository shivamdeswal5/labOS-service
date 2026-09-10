import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { LabsDatabaseModule } from 'src/modules/labs/infrastructure/database/labs-database.module';
import { SupabaseModule } from 'src/modules/shared/infrastructure/supabase/supabase.module';

@Module({
  imports: [LabsDatabaseModule, SupabaseModule],
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class EventsGatewayModule {}
