import { Module } from '@nestjs/common';
import { BoardModule } from './board/board.module';
import { AppController } from './app.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  controllers: [AppController],
  imports: [
    BoardModule,
    UsersModule,
    ConfigModule.forRoot({
      envFilePath: process.env.NODE_ENV == 'dev' ? '.dev.env' : '.prod.env',
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod').required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWD,
      database: process.env.DB_DATABASE,
      entities: [User],
      synchronize: true,
    }),
  ],
  providers: [],
})
export class AppModule {}
