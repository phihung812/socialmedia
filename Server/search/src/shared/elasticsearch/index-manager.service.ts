import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class IndexManagerService {
  private readonly logger = new Logger(IndexManagerService.name);

  constructor(private readonly esService: ElasticsearchService) {}

  async createIndexIfNotExists(
    index: string,
    settings: Record<string, any>,
    mappings: Record<string, any>,
  ): Promise<void> {
    const exists = await this.esService.indices.exists({ index });

    if (!exists) {
      this.logger.log(`Creating index: ${index}`);
      await this.esService.indices.create({
        index,
        settings,
        mappings,
      });
      this.logger.log(`Index "${index}" created`);
    } else {
      this.logger.log(`Index "${index}" already exists`);
    }
  }

  async deleteIndex(index: string): Promise<void> {
    const exists = await this.esService.indices.exists({ index });

    if (exists) {
      await this.esService.indices.delete({ index });
      this.logger.warn(`Index "${index}" deleted`);
    } else {
      this.logger.log(`Index "${index}" does not exist`);
    }
  }

  async updateMapping(
    index: string,
    mapping: Record<string, any>,
  ): Promise<void> {
    const exists = await this.esService.indices.exists({ index });

    if (!exists) {
      throw new Error(`Index "${index}" does not exist`);
    }

    await this.esService.indices.putMapping({
      index,
      body: mapping,
    });

    this.logger.log(`Mapping for index "${index}" updated`);
  }
}
