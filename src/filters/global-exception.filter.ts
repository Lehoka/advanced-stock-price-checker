import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Something went wrong';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();

      message =
        typeof errorResponse === 'string'
          ? errorResponse
          : (errorResponse as { message: string }).message;

      if (exception instanceof NotFoundException) {
        message = `The resource you're looking for could not be found: ${message}`;
      } else if (exception instanceof BadRequestException) {
        message = `Bad request: ${message}`;
      } else if (exception instanceof UnauthorizedException) {
        message = `Unauthorized: ${message}`;
      }
    } else {
      console.error('❌ Non-HttpException error:', exception);

      if (exception instanceof Error) {
        message = exception.message || 'An unexpected error occurred.';
      }
    }

    console.error(`❌ Error (${status}): ${message}`);

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && exception instanceof Error
        ? { stack: exception.stack } // only in development mode to avoid leaking sensitive info
        : {}),
    });
  }
}
