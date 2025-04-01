import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FinnhubService } from './finnhub/finnhub.service';

@Module({
  imports: [HttpModule],
  providers: [FinnhubService],
  exports: [FinnhubService],
})
export class GatewayModule {}
