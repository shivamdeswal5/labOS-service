import { DomainException } from './domain.exception';

export class EntityNotFoundException extends DomainException {
  readonly statusCode = 404;

  constructor(entityName: string, identifier?: string) {
    const message = identifier
      ? `${entityName} with identifier '${identifier}' was not found`
      : `${entityName} was not found`;
    super(message);
  }
}
