import { Module } from '@nestjs/common';
import { StockService } from './stock.service';
import { StockController } from './stock.controller';
import { DatabaseModule } from '../../modules/database/database.module';
import { GatewayModule } from '../../modules/gateway/gateway.module';
import { StockSchedulerService } from './scheduler/stock-scheduler.service';

@Module({
  imports: [DatabaseModule, GatewayModule],
  providers: [StockService, StockSchedulerService],
  controllers: [StockController],
})
export class StockModule {}
