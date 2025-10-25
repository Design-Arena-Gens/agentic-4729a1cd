import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Cities sample (states and slugs simplified)
  const cityData = [
    { name: 'Mumbai', slug: 'mumbai', state: 'Maharashtra' },
    { name: 'Delhi', slug: 'delhi', state: 'Delhi' },
    { name: 'Bengaluru', slug: 'bengaluru', state: 'Karnataka' },
    { name: 'Ahmedabad', slug: 'ahmedabad', state: 'Gujarat' },
    { name: 'Kolkata', slug: 'kolkata', state: 'West Bengal' },
  ];
  for (const c of cityData) {
    await prisma.city.upsert({ where: { slug: c.slug }, update: {}, create: c as any });
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@jewelia.in';
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'Admin',
      email: adminEmail,
      phone: process.env.ADMIN_PHONE || '9999999999',
      passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin#2025', 10),
      role: UserRole.admin,
    },
  });

  const ownerPwd = await bcrypt.hash('Owner#2025', 10);
  const owners = await Promise.all(
    ['owner1@jewelia.in', 'owner2@jewelia.in', 'owner3@jewelia.in', 'owner4@jewelia.in', 'owner5@jewelia.in'].map((email, i) =>
      prisma.user.upsert({
        where: { email },
        update: {},
        create: { name: `Owner ${i + 1}`, email, phone: `900000000${i}`, passwordHash: ownerPwd, role: UserRole.shop_owner },
      }),
    ),
  );

  const cities = await prisma.city.findMany();
  for (let i = 0; i < 5; i++) {
    await prisma.shop.create({
      data: {
        ownerId: owners[i % owners.length].id,
        name: `JEWELIA Partner Shop ${i + 1}`,
        cityId: cities[i % cities.length].id,
        address: `${cities[i % cities.length].name} central market`.
          concat(', near metro station'),
        phone: `800000000${i}`,
        whatsapp: `800000000${i}`,
        logoUrl: 'https://placehold.co/128x128?text=Jewelia',
        verified: true,
      },
    });
  }

  const shops = await prisma.shop.findMany();
  for (const shop of shops) {
    for (let j = 0; j < 3; j++) {
      await prisma.product.create({
        data: {
          shopId: shop.id,
          cityId: shop.cityId,
          name: `Gold Necklace ${j + 1}`,
          sku: `SKU-${shop.id.slice(0, 4)}-${j + 1}`,
          description: 'Elegant 22K gold design with AR preview',
          priceInPaise: 4999000 + j * 100000,
          currency: 'INR',
          purity: '22K',
          weight: 25 + j,
          images: ['https://placehold.co/600x400?text=Gold'],
          arModelUrl: 'https://example.com/ar/model.glb',
          category: 'gold',
          tags: ['necklace', 'trending'],
          verified: true,
        },
      });
    }
  }

  console.log('Seed completed');
}

main().finally(() => prisma.$disconnect());
