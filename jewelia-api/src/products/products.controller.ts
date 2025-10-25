import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { AuthGuard } from '@nestjs/passport';

class CreateProductDto {
  name!: string;
  sku!: string;
  description!: string;
  priceInPaise!: number;
  currency?: string;
  purity?: string;
  weight?: number;
  images!: string[];
  arModelUrl?: string;
  category!: string;
  tags?: string[];
}

@ApiTags('products')
@Controller()
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('v1/shops/:id/products')
  create(@Param('id') shopId: string, @Req() req: any, @Body() dto: CreateProductDto) {
    return this.products.create(shopId, req.user.userId, req.user.role, dto);
  }

  @Get('v1/products/:id')
  get(@Param('id') id: string) {
    return this.products.get(id);
  }
}
