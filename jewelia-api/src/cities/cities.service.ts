import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class CitiesService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.city.findMany({ orderBy: { name: 'asc' } });
  }

  bySlug(slug: string) {
    return this.prisma.city.findUnique({ where: { slug } });
  }
}
