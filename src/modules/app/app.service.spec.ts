import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(() => {
    service = new AppService();
  });

  it('should return "Hello there! - Obi-Wan Kenobi"', () => {
    const result = service.getHello();
    expect(result).toBe('Hello there! - Obi-Wan Kenobi');
  });
});
