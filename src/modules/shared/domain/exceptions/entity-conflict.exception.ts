import { DomainException } from './domain.exception';

export class EntityConflictException extends DomainException {
  readonly statusCode = 409;

  constructor(message: string) {
    super(message);
  }
}
