import { Controller, Get, Put, Delete, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { StockService } from './stock.service';
import { StockSchedulerService } from './scheduler/stock-scheduler.service';
import { StockOverviewResponseDto } from './dto/stock-overview-response.dto';
import { OptionalPositiveNumberPipe } from '../../pipes/optional-positive-number.pipe';
import { StockPriceApiResponse } from './stock.model';

@ApiTags('Stock')
@Controller('stock')
export class StockController {
  constructor(
    private readonly stockService: StockService,
    private readonly schedulerService: StockSchedulerService,
  ) {}

  @Get(':symbol')
  @ApiOperation({ summary: 'Get stock price and moving average' })
  @ApiResponse({
    status: 200,
    description: 'Stock data retrieved',
    type: StockOverviewResponseDto,
  })
  async getStockData(
    @Param('symbol') symbol: string,
    @Query('count', new OptionalPositiveNumberPipe()) count?: number,
  ): Promise<StockOverviewResponseDto> {
    const countQueryParam = count ?? 10; // default to 10 if not provided
    return this.stockService.getStockOverview(symbol, countQueryParam);
  }

  @Put(':symbol')
  @ApiOperation({ summary: 'Start tracking a stock' })
  @ApiResponse({
    status: 200,
    description: 'Tracking started successfully for the given stock symbol',
  })
  @ApiResponse({
    status: 400,
    description:
      'Failed to start tracking due to invalid symbol or other issues',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error occurred while starting tracking',
  })
  startTracking(@Param('symbol') symbol: string): StockPriceApiResponse {
    console.log('🕒 Scheduler manually started.');
    this.schedulerService.setSymbolToTrack(symbol);
    this.schedulerService.startTracking();
    return { message: `Tracking started successfully for symbol: ${symbol}` };
  }

  @Delete()
  @ApiOperation({ summary: 'Stop tracking the stock' })
  @ApiResponse({ status: 200, description: 'Tracking stopped' })
  stopTracking(): StockPriceApiResponse {
    this.schedulerService.stopTracking();
    return { message: `Tracking stopped successfully.` };
  }
}
