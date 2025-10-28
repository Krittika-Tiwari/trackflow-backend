import { Controller, Get } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller()
export class AppController {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  @Get('health')
  healthCheck() {
    const isConnected = this.dataSource.isInitialized;
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: isConnected ? 'connected' : 'disconnected',
      uptime: process.uptime(),
    };
  }

  @Get()
  getWelcome() {
    return {
      message: '🚀 Welcome to TrackFlow API',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        api: '/api/v1',
      },
    };
  }
}
