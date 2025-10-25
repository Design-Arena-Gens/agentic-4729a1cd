import { Body, Controller, Headers, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { AuthGuard } from '@nestjs/passport';

class CheckoutDto { plan!: string; amount!: number; currency?: string }

@ApiTags('payments')
@Controller()
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('v1/shops/:id/membership/checkout')
  checkout(@Param('id') shopId: string, @Body() dto: CheckoutDto) {
    return this.payments.createMembershipOrder(shopId, dto.plan, dto.amount, dto.currency || 'INR');
  }

  @Post('v1/payments/webhook')
  async webhook(@Req() req: any, @Headers('x-razorpay-signature') signature: string) {
    const raw = req.rawBody ? req.rawBody.toString() : JSON.stringify(req.body);
    const valid = this.payments.validateWebhookSignature(raw, signature);
    if (!valid) return { ok: false };
    return this.payments.handleWebhook(JSON.parse(raw));
  }
}
