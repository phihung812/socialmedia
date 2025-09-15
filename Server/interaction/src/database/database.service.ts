import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class DatabaseService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  getDatabaseName(): string {
    return this.connection.name;
  }

  checkConnection(): boolean {
    return this.connection.readyState === 1; // 1 là trạng thái "connected"
  }

  getConnection(): Connection {
    return this.connection;
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Kiểm tra kết nối đến MongoDB
      return this.connection.readyState === 1;
    } catch (error) {
      return false;
    }
  }
}
