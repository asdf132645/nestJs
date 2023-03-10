import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import path, { join } from 'path';
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
      'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Observe, Authorization, refreshToken',
    methods: 'GET,PUT,POST,DELETE,UPDATE,OPTIONS',
    credentials: true,
  });
  // let GLOBAL_PREFiX = 'api';
  // app.use('/public', express.static(join(__dirname, '../public')));
  //정적파일 저장 url dP -> http://localhost:3000/uploads/api/a.jpg api 는 뭐든 경로에 가상으로 붙여줌
  app.useStaticAssets(join(__dirname, '../', 'uploads'), {prefix: '/uploads/image'});
  app.setViewEngine('html');
  // app.setGlobalPrefix(GLOBAL_PREFiX);
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
