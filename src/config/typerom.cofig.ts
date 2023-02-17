import { TypeOrmModuleOptions } from '@nestjs/typeorm';
export const typeORMConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: '127.0.0.1',
  port: 3306,
  username: 'root',
  password: '0000',
  database: 'nodejs',
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  synchronize: true,
};