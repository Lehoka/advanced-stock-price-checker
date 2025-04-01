import { Test, TestingModule } from '@nestjs/testing';
import { FinnhubService } from './finnhub.service';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosHeaders, AxiosResponse } from 'axios';
import { NotFoundException } from '@nestjs/common';

describe('FinnhubService', () => {
  let service: FinnhubService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinnhubService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FinnhubService>(FinnhubService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should return stock price when API responds with valid data', async () => {
    const mockResponse: AxiosResponse = {
      data: { c: 150.25 },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: new AxiosHeaders() },
    };

    jest.spyOn(httpService, 'get').mockReturnValueOnce(of(mockResponse));

    const result = await service.getStockPrice('AAPL');
    expect(result).toBe(150.25);
    expect(httpService.get).toHaveBeenCalledWith(
      `${process.env.FINNHUB_V1_API_URL}/quote?symbol=AAPL&token=${process.env.FINNHUB_API_KEY}`,
    );
  });

  it('should throw NotFoundException when stock price is zero', async () => {
    const mockResponse: AxiosResponse = {
      data: { c: 0 },
      status: 200,
      statusText: 'OK',
      headers: {},
      config: { headers: new AxiosHeaders() },
    };

    jest.spyOn(httpService, 'get').mockReturnValueOnce(of(mockResponse));

    await expect(service.getStockPrice('INVALID')).rejects.toThrow(
      NotFoundException,
    );
    expect(httpService.get).toHaveBeenCalledWith(
      `${process.env.FINNHUB_V1_API_URL}/quote?symbol=INVALID&token=${process.env.FINNHUB_API_KEY}`,
    );
  });

  it('should propagate API errors', async () => {
    const mockError = new Error('Internal Server Error');
    (mockError as any).response = {
      status: 500,
      statusText: 'Internal Server Error',
    };
    mockError.message = 'Internal Server Error';

    jest
      .spyOn(httpService, 'get')
      .mockReturnValueOnce(throwError(() => mockError));

    await expect(service.getStockPrice('AAPL')).rejects.toThrow(
      'Internal Server Error',
    );
    expect(httpService.get).toHaveBeenCalledWith(
      `${process.env.FINNHUB_V1_API_URL}/quote?symbol=AAPL&token=${process.env.FINNHUB_API_KEY}`,
    );
  });
});
