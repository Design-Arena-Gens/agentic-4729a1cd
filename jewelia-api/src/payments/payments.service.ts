import { Injectable, BadRequestException } from '@nestjs/common';
import Razorpay from 'razorpay';
import { PrismaService } from '../database/prisma.service';
import * as crypto from 'crypto';
import { ShopsService } from '../shops/shops.service';

@Injectable()
export class PaymentsService {
  private razor: Razorpay;
  constructor(private readonly prisma: PrismaService, private readonly shops: ShopsService) {
    this.razor = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID!, key_secret: process.env.RAZORPAY_KEY_SECRET! });
  }

  async createMembershipOrder(shopId: string, plan: string, amount: number, currency = 'INR') {
    const order = await this.razor.orders.create({ amount, currency, receipt: `m-${shopId}-${Date.now()}`, notes: { shopId, plan } });
    await this.prisma.transaction.create({
      data: {
        shopId,
        amount,
        currency,
        provider: 'razorpay',
        providerPaymentId: order.id,
        status: 'created',
        payload: order as any,
      },
    });
    return { orderId: order.id, amount: order.amount, currency: order.currency, key: process.env.RAZORPAY_KEY_ID };
  }

  validateWebhookSignature(body: string, signature: string) {
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!).update(body).digest('hex');
    return expected === signature;
  }

  async handleWebhook(event: any) {
    const type = event.event as string;
    if (type === 'payment.captured') {
      const payment = event.payload.payment.entity;
      const orderId = payment.order_id as string;
      const tx = await this.prisma.transaction.findFirst({ where: { providerPaymentId: orderId } });
      if (!tx) return { ignored: true };
      if (tx.status === 'captured') return { idempotent: true };
      await this.prisma.transaction.update({ where: { id: tx.id }, data: { status: 'captured', payload: payment } });
      const shopId = tx.shopId!;
      const now = new Date();
      const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      await this.shops.markMembershipActive(shopId, 'trial', tx.amount, tx.currency, now, expires, payment.id);
      return { success: true };
    }
    return { ignored: true };
  }
}
