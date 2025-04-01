import { ApiProperty } from '@nestjs/swagger';

export class StockOverviewResponseDto {
  @ApiProperty({ example: 'AAPL', description: 'Stock symbol' })
  symbol: string;

  @ApiProperty({ example: 150.25, description: 'Current stock price' })
  stockPrice: number;

  @ApiProperty({ example: 145.6, description: '10-period moving average' })
  movingAverage: number;

  @ApiProperty({
    example: '2024-03-31T12:00:00Z',
    description: 'Last updatedAt timestamp',
  })
  lastUpdatedAt: Date;

  constructor(
    symbol: string,
    stockPrice: number,
    movingAverage: number,
    lastUpdatedAt: Date,
  ) {
    this.symbol = symbol;
    this.stockPrice = stockPrice;
    this.movingAverage = movingAverage;
    this.lastUpdatedAt = lastUpdatedAt;
  }
}
