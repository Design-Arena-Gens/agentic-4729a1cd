import { ProductsService } from './products.service';

describe('ProductsService', () => {
  it('gets product by id via prisma', async () => {
    const prisma = { product: { findUnique: jest.fn().mockResolvedValue({ id: 'p1' }) } } as any;
    const svc = new ProductsService(prisma);
    const p = await svc.get('p1');
    expect(p).toEqual({ id: 'p1' });
  });
});
