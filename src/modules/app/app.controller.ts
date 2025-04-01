import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Oh hello')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get a greeting from an iconic character' })
  @ApiResponse({
    status: 200,
    description: `Won't spoil it for you, try it out!`,
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
