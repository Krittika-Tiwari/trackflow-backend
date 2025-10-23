import { Module } from '@nestjs/common';
import { LinkedinService } from './linkedin.service';

@Module({
  providers: [LinkedinService]
})
export class LinkedinModule {}
