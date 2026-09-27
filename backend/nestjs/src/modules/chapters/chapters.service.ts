import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

function fmtDuration(sec: number | null | undefined): string | null {
  if (!sec || sec < 1) return null;
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

@Injectable()
export class ChaptersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const chapters = await this.prisma.chapter.findMany({
      orderBy: [{ sort_order: 'asc' }, { no: 'asc' }],
      include: {
        modules: {
          orderBy: [{ sort_order: 'asc' }, { no: 'asc' }],
        },
      },
    });

    return chapters.map((c) => ({
      id: c.id,
      no: c.no,
      title: c.title,
      description: c.description,
      modules: c.modules.map((m) => ({
        id: m.id,
        no: m.no,
        title: m.title,
        duration: m.duration_sec ? fmtDuration(m.duration_sec) : m.duration || '',
        durationSec: m.duration_sec || null,
        video: m.video_path ? `/${m.video_path}` : '',
        summary: m.summary,
      })),
    }));
  }
}