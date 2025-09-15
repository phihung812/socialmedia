import { Injectable, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService as NestElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class ElasticsearchService implements OnModuleInit {
  constructor(private readonly client: NestElasticsearchService) {}

  async onModuleInit() {
    try {
      await this.client.ping();
      console.log('[Elasticsearch] ✅ Successfully connected to Elasticsearch');
    } catch (error) {
      console.error(
        '[Elasticsearch] ❌ Failed to connect to Elasticsearch',
        error,
      );
      throw error;
    }
  }

  getClient(): NestElasticsearchService {
    return this.client;
  }

  async search(params: any) {
    return this.client.search(params);
  }

  async index(params: any) {    
    return this.client.index(params);
  }

  async update(params: any) {
    console.log(params);
    return this.client.update(params);
  }

  async delete(params: any) {
    return this.client.delete(params);
  }

  async bulk(params: any) {
    return this.client.bulk(params);
  }
}
