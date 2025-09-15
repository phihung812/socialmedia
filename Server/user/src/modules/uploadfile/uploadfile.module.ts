import { Module } from '@nestjs/common';
import { UploadfileService } from './uploadfile.service';
import { ConfigModule } from '@nestjs/config';
import { UploadfileProvider } from './uploadfile.provider';

@Module({
  imports: [ConfigModule],
  providers: [UploadfileService, UploadfileProvider],
  exports: [UploadfileService],
})
export class UploadfileModule {}
