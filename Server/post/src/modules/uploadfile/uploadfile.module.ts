import { Module } from '@nestjs/common';
import { UploadfileService } from './uploadfile.service';
import { UploadfileProvider } from './uploadfile.provider';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [UploadfileService, UploadfileProvider],
  exports: [UploadfileService],
})
export class UploadfileModule {}
