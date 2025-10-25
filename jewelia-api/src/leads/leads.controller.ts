import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { LeadsService } from './leads.service';

class LeadDto {
  name!: string;
  phone!: string;
  message?: string;
}

@ApiTags('leads')
@Controller('v1/products/:id')
export class LeadsController {
  constructor(private readonly leads: LeadsService) {}

  @Post('lead')
  create(@Param('id') productId: string, @Body() dto: LeadDto) {
    return this.leads.create(productId, dto);
  }
}
