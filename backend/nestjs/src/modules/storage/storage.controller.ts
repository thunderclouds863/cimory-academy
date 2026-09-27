import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { IsString, IsIn, IsOptional } from 'class-validator';
import { R2Service } from './r2.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class PresignDto {
  @IsString()
  filename: string;

  @IsString()
  @IsIn([
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/gif',
  ])
  contentType: string;

  @IsOptional()
  @IsString()
  folder?: string;
}

@Controller('storage')
@UseGuards(JwtAuthGuard)
export class StorageController {
  constructor(private readonly r2: R2Service) {}

  @Post('presign')
  presign(@Body() dto: PresignDto) {
    return this.r2.getUploadUrl(
      dto.filename,
      dto.contentType,
      dto.folder || 'videos',
    );
  }
}