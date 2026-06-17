import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import { HealthResponseDto } from './dto/health-response.dto';
import { HealthService } from './health.service';

@Controller('health')
@ApiTags('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Read API and dependency readiness' })
  async getHealth(@Res() response: Response): Promise<void> {
    const healthStatus = await this.healthService.healthStatus();
    const ready = healthStatus.status === 'ready';

    response.status(ready ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE).json({
      success: ready,
      message: ready ? 'Health status retrieved' : 'Service is not ready',
      data: healthStatus,
    });
  }
}
