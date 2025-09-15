import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  try {
    const app = await NestFactory.create(AppModule);

    // app.enableCors({
    //   origin: '*',
    //   credentials: true,
    // });

    app.enableCors({
      origin: 'http://localhost:5173',
      credentials: true, // cho phép gửi cookie
    });
    await app.startAllMicroservices();
    const port = process.env.PORT ?? 3080;

    await app.listen(port, '0.0.0.0');
  } catch (error) {
    logger.error('Failed to start Message Gateway:', error);
    console.error('ootstrap Error:', error);
    process.exit(1);
  }
}

bootstrap();
