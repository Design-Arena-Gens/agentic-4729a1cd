import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../database/prisma.service';
import { Roles } from '../common/roles.decorator';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Roles('admin')
@Controller('v1/admin')
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('shops/:id/approve')
  approveShop(@Param('id') id: string) {
    return this.prisma.shop.update({ where: { id }, data: { verified: true } });
  }

  @Post('products/:id/approve')
  approveProduct(@Param('id') id: string) {
    return this.prisma.product.update({ where: { id }, data: { verified: true } });
  }

  @Get('transactions')
  transactions() {
    return this.prisma.transaction.findMany({ orderBy: { createdAt: 'desc' } });
  }

  @Get('leads')
  leads() {
    return this.prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });
  }
}
