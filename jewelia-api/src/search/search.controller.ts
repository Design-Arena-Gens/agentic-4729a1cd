import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../database/prisma.service';

@ApiTags('search')
@Controller('v1/search')
export class SearchController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async search(@Query('q') q = '', @Query('city') city?: string, @Query('page') page = '1', @Query('per_page') perPage = '10') {
    const skip = (Number(page) - 1) * Number(perPage);
    const take = Number(perPage);
    const productWhere: any = {};
    const shopWhere: any = {};
    if (q) {
      productWhere.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { tags: { has: q } },
      ];
      shopWhere.OR = [{ name: { contains: q, mode: 'insensitive' } }, { address: { contains: q, mode: 'insensitive' } }];
    }
    if (city) {
      productWhere.city = { slug: city } as any;
      shopWhere.city = { slug: city } as any;
    }
    const [products, shops] = await Promise.all([
      this.prisma.product.findMany({ where: productWhere, skip, take }),
      this.prisma.shop.findMany({ where: shopWhere, skip, take }),
    ]);
    return { products, shops };
  }
}
