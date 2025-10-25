import { Body, Controller, Get, Param, Post, Put, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ShopsService } from './shops.service';
import { AuthGuard } from '@nestjs/passport';

class RegisterShopDto {
  name!: string;
  citySlug!: string;
  address!: string;
  phone!: string;
  whatsapp?: string;
  logoUrl?: string;
  lat?: number;
  lng?: number;
}

class UpdateShopDto {
  name?: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  logoUrl?: string;
  lat?: number;
  lng?: number;
}

@ApiTags('shops')
@Controller('v1/shops')
export class ShopsController {
  constructor(private readonly shops: ShopsService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('register')
  register(@Req() req: any, @Body() dto: RegisterShopDto) {
    return this.shops.registerShop(req.user.userId, dto);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.shops.getById(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  update(@Param('id') id: string, @Req() req: any, @Body() dto: UpdateShopDto) {
    return this.shops.updateShop(id, req.user.userId, req.user.role, dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  me(@Req() req: any) {
    return this.shops.myShops(req.user.userId);
  }
}
