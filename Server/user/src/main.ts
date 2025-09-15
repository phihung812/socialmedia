import { Transport } from '@nestjs/microservices';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const rabbitUrl = configService.get<string>('RABBITMQ_URL');

  const queueName =
    configService.get<string>('RABBITMQ_USER_QUEUE') || 'user_queue';

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitUrl],
      queue: queueName,
      queueOptions: {
        durable: false,
      },
    },
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  // app.enableCors();

  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true, // cho phép gửi cookie
  });
  
  await app.startAllMicroservices();
  await app.listen(3000, '0.0.0.0');

  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
