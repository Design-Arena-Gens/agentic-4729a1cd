import { Injectable } from '@nestjs/common';
import { Prisma, User, UserRole } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(data: { name: string; email: string; phone: string; passwordHash: string; role?: UserRole }) {
    return this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        passwordHash: data.passwordHash,
        role: data.role ?? 'customer',
      },
    });
  }

  async saveRefreshToken(userId: string, tokenHash: string, expiresAt: Date) {
    return this.prisma.refreshToken.create({ data: { userId, tokenHash, expiresAt } });
  }

  async revokeRefreshToken(userId: string, tokenHash: string) {
    return this.prisma.refreshToken.deleteMany({ where: { userId, tokenHash } });
  }

  async isRefreshTokenValid(userId: string, tokenHash: string) {
    const token = await this.prisma.refreshToken.findFirst({ where: { userId, tokenHash } });
    return Boolean(token && token.expiresAt > new Date());
  }
}
