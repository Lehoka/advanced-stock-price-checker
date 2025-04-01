import { Injectable } from '@nestjs/common';
import { StockPrice } from '@prisma/client';
import { DatabaseService } from '../../modules/database/database.service';
import { FinnhubService } from '../../modules/gateway/finnhub/finnhub.service';
import { StockOverviewResponseDto } from './dto/stock-overview-response.dto';

@Injectable()
export class StockService {
  constructor(
    private readonly db: DatabaseService,
    private readonly finnhubService: FinnhubService,
  ) {}

  async getStockOverview(
    symbol: string,
    count: number,
  ): Promise<StockOverviewResponseDto> {
    const stockPrice = await this.selectCurrentStockPriceOfSymbol(symbol);
    const movingAverage = await this.calculateMovingAverageOfSymbol(
      symbol,
      count,
    );

    return new StockOverviewResponseDto(
      stockPrice.symbol,
      stockPrice.price,
      movingAverage,
      stockPrice.createdAt,
    );
  }

  async createStockPrice(symbol: string): Promise<StockPrice> {
    const price = await this.fetchCurrentStockPriceOfSymbol(symbol);
    console.log(`📈 ${symbol} price updated: ${price}`);

    return await this.insertCurrentStockPriceOfSymbol(symbol, price);
  }

  private async fetchCurrentStockPriceOfSymbol(
    symbol: string,
  ): Promise<number> {
    const response = await this.finnhubService.getStockPrice(symbol);
    return response;
  }

  private async insertCurrentStockPriceOfSymbol(
    symbol: string,
    price: number,
  ): Promise<StockPrice> {
    return await this.db.stockPrice.create({ data: { symbol, price } });
  }

  private async selectCurrentStockPriceOfSymbol(
    symbol: string,
  ): Promise<StockPrice> {
    return await this.db.stockPrice.findFirstOrThrow({
      where: { symbol },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });
  }

  private async selectAllStockPricesOfSymbol(
    symbol: string,
    count: number,
  ): Promise<StockPrice[]> {
    return await this.db.stockPrice.findMany({
      where: { symbol },
      orderBy: { createdAt: 'desc' },
      take: count,
    });
  }

  async calculateMovingAverageOfSymbol(
    symbol: string,
    count: number,
  ): Promise<number> {
    const stockPrices: StockPrice[] = await this.selectAllStockPricesOfSymbol(
      symbol,
      count,
    );

    if (stockPrices.length === 0) return 0;
    const sum: number = stockPrices.reduce(
      (acc: number, p: StockPrice) => acc + p.price,
      0,
    );
    return sum / stockPrices.length;
  }
}
