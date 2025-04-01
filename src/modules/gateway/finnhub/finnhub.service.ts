import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';
import { GetFinnhubQuoteResponse } from './finnhub.model';

@Injectable()
export class FinnhubService {
  private readonly API_URL = process.env.FINNHUB_V1_API_URL;
  private readonly API_KEY = process.env.FINNHUB_API_KEY;

  constructor(private readonly httpService: HttpService) {}

  async getStockPrice(symbol: string): Promise<number> {
    const response: AxiosResponse<GetFinnhubQuoteResponse> =
      await firstValueFrom(
        this.httpService.get(
          `${this.API_URL}/quote?symbol=${symbol}&token=${this.API_KEY}`,
        ),
      );

    if (response.data.c === 0) {
      throw new NotFoundException(
        `Zero or no stock price found for symbol: ${symbol}`,
      );
    }

    return response.data.c;
  }
}
