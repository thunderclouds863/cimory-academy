import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import express from 'express';
import path from 'node:path';
import { AppModule } from './app.module';

// @ts-ignore
import { createLegacyApp } from '../../legacy-app.js';

async function bootstrap() {
  const expressApp = express();
  const adapter = new ExpressAdapter(expressApp);

  // Bikin NestJS app
  const app = await NestFactory.create(AppModule, adapter, {
    logger: ['error', 'warn', 'log'],
    bodyParser: false,
  });

  // Prefix untuk NestJS
  app.setGlobalPrefix('api/v2');
  app.enableCors({ origin: true, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // ==========================================
  // BODY PARSER (SEKALI AJA DI TOP LEVEL)
  // ==========================================
  expressApp.use(express.json({ limit: '5mb' }));
  expressApp.use(express.urlencoded({ extended: true }));

  // ==========================================
  // SERVE STATIC FRONTEND
  // ==========================================
  // __dirname di CommonJS = backend/nestjs/dist/
  // Naik 3x → Sales-Academy/frontend
  const frontendPath = path.join(__dirname, '..', '..', '..', 'frontend');
  console.log('[STATIC] Frontend path:', frontendPath);

  expressApp.use(express.static(frontendPath));

  // ==========================================
  // SERVE UPLOADS (VIDEO, GAMBAR)
  // ==========================================
  const uploadsPath = path.join(__dirname, '..', '..', 'uploads');
  console.log('[STATIC] Uploads path:', uploadsPath);

  expressApp.use('/uploads', express.static(uploadsPath));

  // ==========================================
  // MOUNT LEGACY EXPRESS APP (/api/*)
  // ==========================================
  const legacyApp = createLegacyApp();
  expressApp.use(legacyApp);

  // ==========================================
  // INIT NESTJS DULU
  // ==========================================
  await app.init();

  // ==========================================
  // SPA FALLBACK (SETELAH SEMUA ROUTE)
  // ==========================================
  expressApp.get(/^(?!\/api|\/uploads).*/, (req, res) => {
    const indexPath = path.join(frontendPath, 'index.html');
    console.log('[SPA Fallback] Serving:', indexPath, 'for', req.url);
    res.sendFile(indexPath);
  });

  // ==========================================
  // LISTEN
  // ==========================================
  await app.listen(4000);

  console.log('');
  console.log('✅ Server jalan di http://localhost:4000');
  console.log('   - Frontend   : http://localhost:4000/');
  console.log('   - API legacy : http://localhost:4000/api/*');
  console.log('   - API baru   : http://localhost:4000/api/v2/*');
  console.log('');
}

bootstrap();