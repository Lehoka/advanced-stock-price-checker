import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CronJob } from 'cron';
import { SchedulerRegistry } from '@nestjs/schedule';
import { StockService } from '../stock.service';

@Injectable()
export class StockSchedulerService {
  private symbolToTrack: string | undefined = undefined;
  private cronJobName: string = 'stock-tracker';

  constructor(
    private readonly stockService: StockService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  startTracking(): void {
    if (this.symbolToTrack === undefined) {
      throw new BadRequestException('No symbol is set to track.');
    }

    if (this.schedulerRegistry.doesExist('cron', this.cronJobName)) {
      console.log('⚠️ Job already exists. Stopping the existing job.');
      this.stopTracking();
    }

    const job = new CronJob('0 * * * * *', async () => {
      try {
        if (this.symbolToTrack === undefined) {
          throw new BadRequestException('No symbol is set to track.');
        }
        console.log(`🔄 Tracking stock: ${this.symbolToTrack}`);
        await this.stockService.createStockPrice(this.symbolToTrack);
      } catch (error: unknown) {
        this.stopTracking();
        if (error instanceof BadRequestException) {
          console.error(`❌ BadRequestException: ${error.message}`);
        } else if (error instanceof NotFoundException) {
          console.error(`❌ NotFoundException: ${error.message}`);
        } else if (error instanceof UnauthorizedException) {
          console.error(`❌ UnauthorizedException: ${error.message}`);
        } else if (error instanceof Error) {
          console.error(`❌ Unexpected error: ${error.message}`);
        } else {
          console.error('❌ Unknown error occurred in cron job.');
        }
      }
    });

    try {
      console.log('🔄 Running job immediately...');
      void job.fireOnTick();

      this.schedulerRegistry.addCronJob(this.cronJobName, job);
      job.start();
      console.log('✅ Stock tracking job started.');
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(`❌ Error starting the cron job: ${error.message}`);
      }
      throw new InternalServerErrorException(
        'Failed to start the stock tracking job.',
      );
    }
  }

  stopTracking(): void {
    try {
      this.schedulerRegistry.deleteCronJob(this.cronJobName);
      console.log('🛑 Stock tracking job stopped.');
    } catch {
      console.log('⚠️ No active job to stop.');
    }
  }

  setSymbolToTrack(symbol: string) {
    this.symbolToTrack = symbol;
  }
}
