import { Test, TestingModule } from '@nestjs/testing';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { StockSchedulerService } from './scheduler/stock-scheduler.service';
import { StockOverviewResponseDto } from './dto/stock-overview-response.dto';

describe('StockController', () => {
  let controller: StockController;
  let stockService: jest.Mocked<StockService>;
  let schedulerService: jest.Mocked<StockSchedulerService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StockController],
      providers: [
        {
          provide: StockService,
          useValue: {
            getStockOverview: jest.fn(),
          },
        },
        {
          provide: StockSchedulerService,
          useValue: {
            setSymbolToTrack: jest.fn(),
            startTracking: jest.fn(),
            stopTracking: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<StockController>(StockController);
    stockService = module.get(StockService);
    schedulerService = module.get(StockSchedulerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return stock data for a given symbol', async () => {
    const mockResponse: StockOverviewResponseDto = {
      symbol: 'AAPL',
      stockPrice: 150,
      movingAverage: 151.67,
      lastUpdatedAt: new Date('2025-01-01T00:00:00Z'),
    };
    stockService.getStockOverview.mockResolvedValue(mockResponse);

    const result = await controller.getStockData('AAPL', 3);

    expect(stockService.getStockOverview).toHaveBeenCalledWith('AAPL', 3);
    expect(result).toEqual(mockResponse);
  });

  it('should use default count if not provided in getStockData', async () => {
    const mockResponse: StockOverviewResponseDto = {
      symbol: 'AAPL',
      stockPrice: 150,
      movingAverage: 151.67,
      lastUpdatedAt: new Date('2025-01-01T00:00:00Z'),
    };
    stockService.getStockOverview.mockResolvedValue(mockResponse);

    const result = await controller.getStockData('AAPL');

    expect(stockService.getStockOverview).toHaveBeenCalledWith('AAPL', 10); // default count is 10
    expect(result).toEqual(mockResponse);
  });

  it('should start tracking a stock', () => {
    const result = controller.startTracking('AAPL');

    expect(schedulerService.setSymbolToTrack).toHaveBeenCalledWith('AAPL');
    expect(schedulerService.startTracking).toHaveBeenCalled();
    expect(result).toEqual({
      message: 'Tracking started successfully for symbol: AAPL',
    });
  });

  it('should stop tracking a stock', () => {
    const result = controller.stopTracking();

    expect(schedulerService.stopTracking).toHaveBeenCalled();
    expect(result).toEqual({
      message: 'Tracking stopped successfully.',
    });
  });
});
