import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CitiesService } from './cities.service';
import { PrismaService } from '../database/prisma.service';

@ApiTags('cities')
@Controller('v1/cities')
export class CitiesController {
  constructor(private readonly cities: CitiesService, private readonly prisma: PrismaService) {}

  @Get()
  list() {
    return this.cities.list();
  }

  @Get(':slug/shops')
  shops(@Param('slug') slug: string) {
    return this.prisma.shop.findMany({ where: { city: { slug }, verified: true } });
  }

  @Get(':slug/products')
  products(
    @Param('slug') slug: string,
    @Query('q') q?: string,
    @Query('category') category?: string,
    @Query('from_price') fromPrice?: string,
    @Query('to_price') toPrice?: string,
    @Query('purity') purity?: string,
  ) {
    const where: any = { city: { slug }, verified: true };
    if (q) where.OR = [{ name: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }];
    if (category) where.category = category;
    if (purity) where.purity = purity;
    if (fromPrice || toPrice) where.priceInPaise = {};
    if (fromPrice) where.priceInPaise.gte = Number(fromPrice);
    if (toPrice) where.priceInPaise.lte = Number(toPrice);
    return this.prisma.product.findMany({ where, orderBy: { createdAt: 'desc' } });
  }
}
