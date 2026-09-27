import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from './app.module';

// @ts-ignore
import { createLegacyApp } from '../../legacy-app.js';

async function bootstrap() {
  const expressApp = express();
  const adapter = new ExpressAdapter(expressApp);

  const app = await NestFactory.create(AppModule, adapter, {
    logger: ['error', 'warn', 'log'],
    bodyParser: false,
  });

  app.setGlobalPrefix('api/v2');
  app.enableCors({ origin: true, credentials: true });

  // Body parser di level top — SEKALI AJA
  expressApp.use(express.json({ limit: '5mb' }));
  expressApp.use(express.urlencoded({ extended: true }));

  // Mount legacy di root (TANPA prefix)
  // Karena route legacy udah include /api/auth, /api/chapters, dll
  const legacyApp = createLegacyApp();
  expressApp.use(legacyApp);

  await app.init();
  await app.listen(4000);

  console.log('✅ Server jalan di http://localhost:4000');
  console.log('   - Express lama: http://localhost:4000/api/*');
  console.log('   - NestJS baru : http://localhost:4000/api/v2/*');
}

bootstrap();