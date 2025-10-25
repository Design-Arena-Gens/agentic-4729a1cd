import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(shopId: string, userId: string, role: string, data: { name: string; sku: string; description: string; priceInPaise: number; currency?: string; purity?: string; weight?: number; images: string[]; arModelUrl?: string; category: string; tags?: string[] }) {
    const shop = await this.prisma.shop.findUnique({ where: { id: shopId } });
    if (!shop) throw new NotFoundException('Shop not found');
    if (role !== 'admin' && shop.ownerId !== userId) throw new ForbiddenException('Not owner');
    return this.prisma.product.create({
      data: {
        shopId,
        name: data.name,
        sku: data.sku,
        description: data.description,
        priceInPaise: data.priceInPaise,
        currency: data.currency || 'INR',
        purity: data.purity,
        weight: data.weight,
        images: data.images,
        arModelUrl: data.arModelUrl,
        category: data.category,
        tags: data.tags || [],
        cityId: shop.cityId,
      },
    });
  }

  get(id: string) {
    return this.prisma.product.findUnique({ where: { id } });
  }
}
