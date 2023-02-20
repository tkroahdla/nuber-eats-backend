import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { JwtMiddleware } from './jwt/jwt.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  //🚗전체에서 사용하고 싶을때 - functional middleware 일 때 가능하다
  // app.use(JwtMiddleware);

  await app.listen(3000);
}
bootstrap();
