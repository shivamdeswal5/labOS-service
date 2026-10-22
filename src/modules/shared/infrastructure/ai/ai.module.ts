import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AI_SERVICE_TOKEN } from './interfaces/ai-service.interface';
import { GeminiService } from './gemini.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: AI_SERVICE_TOKEN,
      useClass: GeminiService,
    },
  ],
  exports: [AI_SERVICE_TOKEN],
})
export class AiModule {}
