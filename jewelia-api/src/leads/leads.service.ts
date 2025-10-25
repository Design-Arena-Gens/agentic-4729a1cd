import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(productId: string, data: { name: string; phone: string; message?: string }) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new NotFoundException('Product not found');
    return this.prisma.lead.create({ data: { productId, shopId: product.shopId, name: data.name, phone: data.phone, message: data.message } });
  }
}
