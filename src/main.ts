import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { join } from 'path';
import express from 'express';
import { existsSync, mkdirSync } from 'fs';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const uploadPath = 'uploads';

  if (!existsSync(uploadPath)) {
    // uploads 폴더가 존재하지 않을시, 생성합니다.
    mkdirSync(uploadPath);
  }
  const whitelist = ['http://localhost:3000', 'http://10.1.1.107:63007'];
  app.enableCors({
    origin: function (origin, callback) {
      if (whitelist.indexOf(origin) !== -1) {
        console.log('allowed cors for:', origin);
        callback(null, true);
      } else {
        console.log('blocked cors for:', origin);
        // callback(new Error('Not allowed by CORS'));
        // callback(new Error('Not allowed by CORS'));
        callback(null, true);
      }
    },
    allowedHeaders:
      'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Observe, Authorization',
    methods: 'GET,PUT,POST,DELETE,UPDATE,OPTIONS',
    credentials: true,
  });

  app.use('/public', express.static(join(__dirname, '../public')));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.use(cookieParser());
  await app.listen(3000);
}
bootstrap();
