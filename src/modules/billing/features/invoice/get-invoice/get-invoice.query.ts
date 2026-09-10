export class GetInvoiceQuery {
  constructor(
    public readonly invoiceId: string,
    public readonly labId: string,
  ) {}
}
