export class HandleRazorpayWebhookCommand {
  constructor(
    public readonly rawBody: Buffer | string,
    public readonly signature: string,
    public readonly payload: Record<string, any>,
  ) {}
}
