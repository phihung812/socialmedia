import { Transport } from '@nestjs/microservices';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const rabbitUrl = configService.get<string>('RABBITMQ_URL');

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitUrl],
      queue: 'notification_gateway_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  // app.enableCors({
  //   origin: '*',
  //   credentials: true,
  // });
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true, // cho phép gửi cookie
  });

  await app.startAllMicroservices();
  const port = process.env.PORT ?? 3060;
  await app.listen(port, '0.0.0.0');

  console.log(`Notification Gateway running on http://0.0.0.0:${port}`);
}
bootstrap();
