import { DomainException } from './domain.exception';

export class DomainValidationException extends DomainException {
  readonly statusCode = 400;

  constructor(message: string) {
    super(message);
  }
}
