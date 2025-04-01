import { Test, TestingModule } from '@nestjs/testing';
import { StockSchedulerService } from './stock-scheduler.service';
import { StockService } from '../stock.service';
import { SchedulerRegistry } from '@nestjs/schedule';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CronJob } from 'cron';

jest.mock('cron', () => {
  return {
    CronJob: jest.fn().mockImplementation(function (cronTime, onTick) {
      this.cronTime = cronTime;
      this.onTick = onTick;
      this.start = jest.fn();
      this.fireOnTick = jest.fn(() => this.onTick());
    }),
  };
});

describe('StockSchedulerService', () => {
  let service: StockSchedulerService;
  let stockService: jest.Mocked<StockService>;
  let schedulerRegistry: jest.Mocked<SchedulerRegistry>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StockSchedulerService,
        {
          provide: StockService,
          useValue: {
            createStockPrice: jest.fn(),
          },
        },
        {
          provide: SchedulerRegistry,
          useValue: {
            addCronJob: jest.fn(),
            deleteCronJob: jest.fn(),
            doesExist: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StockSchedulerService>(StockSchedulerService);
    stockService = module.get(StockService);
    schedulerRegistry = module.get(SchedulerRegistry);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should set the symbol to track', () => {
    service.setSymbolToTrack('AAPL');
    expect((service as any).symbolToTrack).toBe('AAPL');
  });

  it('should throw BadRequestException if no symbol is set when starting tracking', () => {
    expect(() => service.startTracking()).toThrow(BadRequestException);
  });

  it('should stop an existing job if it already exists', () => {
    schedulerRegistry.doesExist.mockReturnValue(true);
    const stopTrackingSpy = jest.spyOn(service, 'stopTracking');

    service.setSymbolToTrack('AAPL');
    service.startTracking();

    expect(stopTrackingSpy).toHaveBeenCalled();
  });

  it('should add and start a new cron job', () => {
    schedulerRegistry.doesExist.mockReturnValue(false);

    service.setSymbolToTrack('AAPL');
    service.startTracking();

    expect(schedulerRegistry.addCronJob).toHaveBeenCalled();
    expect(CronJob).toHaveBeenCalledWith('0 * * * * *', expect.any(Function));
  });

  it('should call fireOnTick to run the job immediately', () => {
    schedulerRegistry.doesExist.mockReturnValue(false);

    service.setSymbolToTrack('AAPL');
    service.startTracking();

    const cronJobInstance = (CronJob as unknown as jest.Mock).mock.instances[0];
    expect(cronJobInstance).toBeDefined();

    cronJobInstance.fireOnTick();

    expect(cronJobInstance.fireOnTick).toHaveBeenCalled();
  });

  it('should handle errors when starting the cron job', () => {
    schedulerRegistry.addCronJob.mockImplementation(() => {
      throw new Error('Failed to add cron job');
    });

    service.setSymbolToTrack('AAPL');

    expect(() => service.startTracking()).toThrow(InternalServerErrorException);
  });

  it('should stop tracking and delete the cron job', () => {
    service.stopTracking();

    expect(schedulerRegistry.deleteCronJob).toHaveBeenCalledWith(
      'stock-tracker',
    );
  });

  it('should handle errors when stopping a non-existent job', () => {
    schedulerRegistry.deleteCronJob.mockImplementation(() => {
      throw new Error('Job does not exist');
    });

    expect(() => service.stopTracking()).not.toThrow();
  });
});
