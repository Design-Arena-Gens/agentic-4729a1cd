import type { VercelRequest, VercelResponse } from '@vercel/node';
import serverless from 'serverless-http';
import express from 'express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

let cached: any;

async function bootstrap() {
  const expressApp = express();
  expressApp.use(express.json({ verify: (req: any, _res, buf) => (req.rawBody = buf) }));
  const nest = await NestFactory.create(AppModule, new (require('@nestjs/platform-express').ExpressAdapter)(expressApp), { bufferLogs: true });
  nest.useLogger(nest.get(Logger));
  nest.use(helmet());
  nest.enableCors();
  nest.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  if ((process.env.SWAGGER_ENABLE || 'true') === 'true') {
    const config = new DocumentBuilder().setTitle('JEWELIA API').setVersion('1.0.0').addBearerAuth().build();
    const doc = SwaggerModule.createDocument(nest, config);
    SwaggerModule.setup('docs', nest, doc);
  }
  await nest.init();
  // Readiness probe
  expressApp.get('/health', (_req, res) => res.json({ status: 'ok' }));
  return serverless(expressApp);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!cached) cached = await bootstrap();
  return cached(req, res);
}
