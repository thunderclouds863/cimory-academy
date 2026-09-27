import { Controller, Get, UseGuards } from '@nestjs/common';
import { ChaptersService } from './chapters.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('chapters')
@UseGuards(JwtAuthGuard)
export class ChaptersController {
  constructor(private readonly chapters: ChaptersService) {}

  @Get()
  findAll() {
    return this.chapters.findAll();
  }
}