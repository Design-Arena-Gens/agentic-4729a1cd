import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../database/prisma.service';
import { UserRole } from '@prisma/client';

const REFRESH_SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
  ) {}

  async register(params: { name: string; email: string; phone: string; password: string; role?: UserRole }) {
    const existing = await this.usersService.findByEmail(params.email);
    if (existing) throw new UnauthorizedException('Email already registered');
    const passwordHash = await bcrypt.hash(params.password, 10);
    const user = await this.usersService.create({
      name: params.name,
      email: params.email,
      phone: params.phone,
      passwordHash,
      role: params.role ?? 'customer',
    });
    return this.issueTokens(user.id, user.role);
  }

  async loginWithPassword(emailOrPhone: string, password: string) {
    const user = await this.prisma.user.findFirst({ where: { OR: [{ email: emailOrPhone }, { phone: emailOrPhone }] } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return this.issueTokens(user.id, user.role);
  }

  // MVP OTP: accept 000000 as valid
  async sendOtp(phone: string) {
    // In production, store code in Redis and send via SMS
    return { phone, sent: true, code: '000000' };
  }

  async refresh(userId: string, refreshToken: string) {
    const tokenHash = await bcrypt.hash(refreshToken, REFRESH_SALT_ROUNDS);
    const valid = await this.usersService.isRefreshTokenValid(userId, tokenHash);
    if (!valid) throw new UnauthorizedException('Invalid refresh token');
    const user = await this.usersService.findById(userId);
    if (!user) throw new UnauthorizedException('User not found');
    return this.issueTokens(user.id, user.role);
  }

  async logout(userId: string, refreshToken: string) {
    const tokenHash = await bcrypt.hash(refreshToken, REFRESH_SALT_ROUNDS);
    await this.usersService.revokeRefreshToken(userId, tokenHash);
    return { success: true };
  }

  private async issueTokens(userId: string, role: UserRole) {
    const accessTtl = Number(process.env.JWT_ACCESS_TTL_SEC || 900);
    const refreshTtl = Number(process.env.JWT_REFRESH_TTL_SEC || 30 * 24 * 60 * 60);
    const access = await this.jwtService.signAsync(
      { sub: userId, role },
      {
        secret: process.env.JWT_ACCESS_SECRET!,
        expiresIn: accessTtl,
      },
    );
    const refresh = await this.jwtService.signAsync(
      { sub: userId, role },
      {
        secret: process.env.JWT_REFRESH_SECRET!,
        expiresIn: refreshTtl,
      },
    );
    const tokenHash = await bcrypt.hash(refresh, REFRESH_SALT_ROUNDS);
    const exp = new Date(Date.now() + refreshTtl * 1000);
    await this.usersService.saveRefreshToken(userId, tokenHash, exp);
    return { accessToken: access, refreshToken: refresh };
  }
}
