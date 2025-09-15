import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { RefreshTokenModule } from './modules/refresh_token/refresh_token.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    DatabaseModule,
    RefreshTokenModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
