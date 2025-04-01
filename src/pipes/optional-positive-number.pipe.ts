import { PipeTransform, BadRequestException } from '@nestjs/common';

export class OptionalPositiveNumberPipe implements PipeTransform {
  transform(value: unknown): number | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    if (typeof value !== 'string' && typeof value !== 'number') {
      throw new BadRequestException('Validation failed: Invalid input type.');
    }

    const numValue = Number(value);

    if (isNaN(numValue)) {
      throw new BadRequestException(
        `Validation failed: "${String(value)}" is not a number.`,
      );
    }

    if (numValue <= 0) {
      throw new BadRequestException(
        `Validation failed: "${String(value)}" must be a positive number.`,
      );
    }

    return numValue;
  }
}
