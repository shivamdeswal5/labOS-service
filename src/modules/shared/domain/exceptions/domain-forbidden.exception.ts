import { DomainException } from './domain.exception';

export class DomainForbiddenException extends DomainException {
  readonly statusCode = 403;

  constructor(message: string = 'Access denied') {
    super(message);
  }
}
