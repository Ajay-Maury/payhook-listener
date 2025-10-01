import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS and set global prefix
  app.enableCors();
  app.setGlobalPrefix('api');

  // Enable class-validator / class-transformer globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips out unexpected fields
      transform: true, // auto-transform plain JSON into DTO classes
    }),
  );

  // Capture raw body for signature validation
  app.use(
    bodyParser.json({
      verify: (req: any, res, buf: Buffer) => {
        if (buf && buf.length) {
          req.rawBody = buf;  // store raw request body, important for HMAC signature verification
        }
      },
      limit: '1mb',
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Webhook server running on http://localhost:${port}/api`);
}

bootstrap();
