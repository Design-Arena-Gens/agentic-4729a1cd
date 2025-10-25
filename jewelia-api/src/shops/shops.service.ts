import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { MembershipStatus, UserRole } from '@prisma/client';

@Injectable()
export class ShopsService {
  constructor(private readonly prisma: PrismaService) {}

  async registerShop(ownerId: string, data: { name: string; citySlug: string; address: string; phone: string; whatsapp?: string; logoUrl?: string; lat?: number; lng?: number }) {
    const city = await this.prisma.city.findUnique({ where: { slug: data.citySlug } });
    if (!city) throw new NotFoundException('City not found');
    return this.prisma.shop.create({
      data: {
        ownerId,
        name: data.name,
        cityId: city.id,
        address: data.address,
        phone: data.phone,
        whatsapp: data.whatsapp,
        logoUrl: data.logoUrl,
        lat: data.lat,
        lng: data.lng,
        membershipStatus: 'pending',
      },
    });
  }

  async getById(id: string) {
    const shop = await this.prisma.shop.findUnique({ where: { id } });
    if (!shop) throw new NotFoundException('Shop not found');
    return shop;
  }

  async updateShop(shopId: string, userId: string, role: UserRole, data: Partial<{ name: string; address: string; phone: string; whatsapp?: string; logoUrl?: string; lat?: number; lng?: number }>) {
    const shop = await this.getById(shopId);
    if (role !== 'admin' && shop.ownerId !== userId) throw new ForbiddenException('Not owner');
    return this.prisma.shop.update({ where: { id: shopId }, data });
  }

  myShops(ownerId: string) {
    return this.prisma.shop.findMany({ where: { ownerId } });
  }

  markMembershipActive(shopId: string, plan: string, amount: number, currency: string, startedAt: Date, expiresAt: Date, transactionRef?: string) {
    return this.prisma.$transaction([
      this.prisma.membership.create({
        data: { shopId, plan, amount, currency, startedAt, expiresAt, status: 'active', transactionRef },
      }),
      this.prisma.shop.update({ where: { id: shopId }, data: { membershipStatus: MembershipStatus.active, membershipStartedAt: startedAt, membershipExpiresAt: expiresAt } }),
    ]);
  }
}
