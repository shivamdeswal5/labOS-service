export class AdminGetPaymentsQuery {
  constructor(
    public readonly limit: number = 50,
    public readonly offset: number = 0,
  ) {}
}
