import { OptionalPositiveNumberPipe } from './optional-positive-number.pipe';
import { BadRequestException } from '@nestjs/common';

describe('OptionalPositiveNumberPipe', () => {
  let pipe: OptionalPositiveNumberPipe;

  beforeEach(() => {
    pipe = new OptionalPositiveNumberPipe();
  });

  it('should return undefined for undefined, null, or empty string', () => {
    expect(pipe.transform(undefined)).toBeUndefined();
    expect(pipe.transform(null)).toBeUndefined();
    expect(pipe.transform('')).toBeUndefined();
  });

  it('should return a positive number for valid numeric input', () => {
    expect(pipe.transform('5')).toBe(5);
    expect(pipe.transform(10)).toBe(10);
    expect(pipe.transform('3.14')).toBe(3.14);
  });

  it('should throw BadRequestException for non-numeric input', () => {
    expect(() => pipe.transform('abc')).toThrow(
      new BadRequestException('Validation failed: "abc" is not a number.'),
    );
    expect(() => pipe.transform({})).toThrow(
      new BadRequestException('Validation failed: Invalid input type.'),
    );
    expect(() => pipe.transform([])).toThrow(
      new BadRequestException('Validation failed: Invalid input type.'),
    );
  });

  it('should throw BadRequestException for non-positive numbers', () => {
    expect(() => pipe.transform('-5')).toThrow(
      new BadRequestException(
        'Validation failed: "-5" must be a positive number.',
      ),
    );
    expect(() => pipe.transform(0)).toThrow(
      new BadRequestException(
        'Validation failed: "0" must be a positive number.',
      ),
    );
    expect(() => pipe.transform('-3.14')).toThrow(
      new BadRequestException(
        'Validation failed: "-3.14" must be a positive number.',
      ),
    );
  });
});
