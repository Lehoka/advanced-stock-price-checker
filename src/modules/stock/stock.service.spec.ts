import { Test, TestingModule } from '@nestjs/testing';
import { StockService } from './stock.service';
import { DatabaseService } from '../database/database.service';
import { FinnhubService } from '../gateway/finnhub/finnhub.service';
import { StockPrice } from '@prisma/client';
import { mockPrismaClient } from '../../utils/prisma-mock';

describe('StockService', () => {
  let service: StockService;
  let db: typeof mockPrismaClient;
  let finnhubService: jest.Mocked<FinnhubService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockService,
        {
          provide: DatabaseService,
          useValue: mockPrismaClient,
        },
        {
          provide: FinnhubService,
          useValue: {
            getStockPrice: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StockService>(StockService);
    db = module.get(DatabaseService);
    finnhubService = module.get(FinnhubService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a stock price', async () => {
    const mockPrice = 150.25;
    const mockStockPrice: StockPrice = {
      id: 1,
      symbol: 'AAPL',
      price: mockPrice,
      createdAt: new Date(),
    };

    finnhubService.getStockPrice.mockResolvedValue(mockPrice);
    mockPrismaClient.stockPrice.create.mockResolvedValue(mockStockPrice);

    const result = await service.createStockPrice('AAPL');

    expect(finnhubService.getStockPrice).toHaveBeenCalledWith('AAPL');
    expect(mockPrismaClient.stockPrice.create).toHaveBeenCalledWith({
      data: { symbol: 'AAPL', price: mockPrice },
    });
    expect(result).toEqual(mockStockPrice);
  });

  it('should calculate moving average of a symbol', async () => {
    const mockStockPrices: StockPrice[] = [
      { id: 1, symbol: 'AAPL', price: 150, createdAt: new Date() },
      { id: 2, symbol: 'AAPL', price: 152, createdAt: new Date() },
      { id: 3, symbol: 'AAPL', price: 153, createdAt: new Date() },
    ];

    mockPrismaClient.stockPrice.findMany.mockResolvedValue(mockStockPrices);

    const result = await service.calculateMovingAverageOfSymbol('AAPL', 3);

    expect(mockPrismaClient.stockPrice.findMany).toHaveBeenCalledWith({
      where: { symbol: 'AAPL' },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });
    expect(result).toBe(151.66666666666666);
  });

  it('should return 0 if no stock prices are found for moving average', async () => {
    mockPrismaClient.stockPrice.findMany.mockResolvedValue([]);

    const result = await service.calculateMovingAverageOfSymbol('AAPL', 3);

    expect(result).toBe(0);
  });
});
