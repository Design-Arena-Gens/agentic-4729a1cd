import { PaymentsService } from './payments.service';

describe('PaymentsService', () => {
  it('validates webhook signature', () => {
    process.env.RAZORPAY_WEBHOOK_SECRET = 'secret';
    const svc = new PaymentsService({} as any, {} as any);
    const body = JSON.stringify({ hello: 'world' });
    const crypto = require('crypto');
    const sig = crypto.createHmac('sha256', 'secret').update(body).digest('hex');
    expect(svc.validateWebhookSignature(body, sig)).toBe(true);
  });
});
