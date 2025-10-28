import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { SchedulerController } from './scheduler.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduledPost } from './entities/scheduler.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ScheduledPost])],
  controllers: [SchedulerController],
  providers: [SchedulerService],
  exports: [SchedulerService, TypeOrmModule],
})
export class SchedulerModule {}
