import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { DomainException } from '../domain/exceptions/domain.exception';

export interface ErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
  details?: unknown;
  path: string;
  timestamp: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error: string | undefined = undefined;
    let details: unknown = undefined;

    if (exception instanceof DomainException) {
      status = exception.statusCode;
      message = exception.message;
      error = exception.name;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const resObj = res as Record<string, any>;
        message = Array.isArray(resObj.message)
          ? resObj.message.join('; ')
          : resObj.message || exception.message;
        error = resObj.error || HttpStatus[status];
        if (Array.isArray(resObj.message)) {
          details = resObj.message;
        }
      }
    } else if (exception instanceof Error) {
      this.logger.error(`Unhandled Exception: ${exception.message}`, exception.stack);
      message = process.env.NODE_ENV === 'production' ? 'Internal server error' : exception.message;
      error = exception.name;
    }

    const payload: ErrorResponse = {
      statusCode: status,
      message,
      ...(error ? { error } : {}),
      ...(details ? { details } : {}),
      path: request.originalUrl || request.url,
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(payload);
  }
}
