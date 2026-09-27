import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return 'NestJS v2 is running 🚀';
  }

  @Get('health')
  async health() {
    const userCount = await this.prisma.user.count();  
    return {
      status: 'ok',
      service: 'nestjs',
      version: 'v2',
      database: 'connected',
      users: userCount,
      timestamp: new Date().toISOString(),
    };
  }
}