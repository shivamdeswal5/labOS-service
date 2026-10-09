import { Controller, Post, Req, Headers, Body, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { HandleRazorpayWebhookHandler } from './handle-razorpay-webhook.handler';
import { HandleRazorpayWebhookCommand } from './handle-razorpay-webhook.command';
import { Public } from 'src/modules/shared/decorators/public.decorator';

@Controller('billing/webhooks')
export class HandleRazorpayWebhookController {
  constructor(private readonly handler: HandleRazorpayWebhookHandler) {}

  @Public()
  @Post('razorpay')
  async handleWebhook(
    @Req() req: Request,
    @Headers('x-razorpay-signature') signature: string,
    @Body() body: any,
  ) {
    if (!signature) {
      throw new UnauthorizedException('Missing x-razorpay-signature header');
    }

    const rawBody = (req as any).rawBody || Buffer.from(JSON.stringify(body));

    return this.handler.execute(
      new HandleRazorpayWebhookCommand(rawBody, signature, body),
    );
  }
}
