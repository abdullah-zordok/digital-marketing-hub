import { Controller, Get } from '@nestjs/common';

import { HealthResponseDto } from './dto/health-response.dto';
import { HealthService } from './health.service';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async getHealth(): Promise<{ message: string; payload: HealthResponseDto }> {
    return {
      message: 'Health status retrieved',
      payload: await this.healthService.healthStatus(),
    };
  }
}
