import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { WebhookEvent } from '../../../domain/entities/webhook-event.entity';
import { IWebhookEventRepository } from '../../../domain/webhook/interfaces/webhook-event-repository.interface';
import {
  PaymentProviderEnum,
  WebhookEventStatusEnum,
} from '../../../domain/enums/platform-billing.enums';

@Injectable()
export class WebhookEventRepository implements IWebhookEventRepository {
  constructor(
    @InjectRepository(WebhookEvent)
    private readonly repo: Repository<WebhookEvent>,
    private readonly dataSource: DataSource,
  ) {}

  async reserveEvent(
    eventId: string,
    provider: PaymentProviderEnum,
    eventType: string,
    payload: Record<string, any>,
  ): Promise<string | null> {
    const result = await this.dataSource.query(
      `
      INSERT INTO "webhook_events" ("event_id", "provider", "event_type", "payload", "status")
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT ("event_id") DO NOTHING
      RETURNING "id";
      `,
      [eventId, provider, eventType, payload, WebhookEventStatusEnum.PROCESSING],
    );

    if (!result || result.length === 0) {
      return null;
    }

    return result[0].id;
  }

  async markProcessed(id: string): Promise<void> {
    await this.repo.update(
      { id },
      { status: WebhookEventStatusEnum.PROCESSED, processedAt: new Date() },
    );
  }

  async markFailed(id: string, errorMessage: string): Promise<void> {
    await this.repo.update(
      { id },
      { status: WebhookEventStatusEnum.FAILED, errorMessage },
    );
  }
}
