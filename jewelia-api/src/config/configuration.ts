import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL!,
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET!,
    refreshSecret: process.env.JWT_REFRESH_SECRET!,
    accessTtl: process.env.JWT_ACCESS_TTL || '900s',
    refreshTtl: process.env.JWT_REFRESH_TTL || '30d',
  },
  redisUrl: process.env.REDIS_URL!,
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID!,
    keySecret: process.env.RAZORPAY_KEY_SECRET!,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET!,
  },
  aws: {
    region: process.env.AWS_REGION!,
    bucket: process.env.AWS_S3_BUCKET!,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    cdnBase: process.env.ASSETS_CDN_BASE || '',
  },
  swaggerEnable: (process.env.SWAGGER_ENABLE || 'true') === 'true',
}));
