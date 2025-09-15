import { ResultFormatter } from './../../../shared/utils/result-formatter';
import { QueryBuilder } from './../../../shared/utils/query-builder';
import { Injectable } from '@nestjs/common';
import { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types';
import { ElasticsearchService } from '../../../shared/elasticsearch/elasticsearch.service';
import {
  UsersSearchRequestDto,
  SortOrder,
} from '../dto/users-search-request.dto';
import {
  UserSearchHit,
  UsersSearchResponseDto,
  UsersSuggestionsResponse,
} from '../dto/users-search-response.dto';
import { IndexManagerService } from 'src/shared/elasticsearch/index-manager.service';
import { UserDocument } from '../interfaces/user-document.interface';
import { usersIndex } from '../indices/users.index';

@Injectable()
export class UsersSearchService {
  private readonly indexName = 'users';

  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly indexManagerService: IndexManagerService,
    private readonly queryBuilder: QueryBuilder,
    private readonly resultFormatter: ResultFormatter,
  ) {}

  async onModuleInit() {
    await this.indexManagerService.createIndexIfNotExists(
      usersIndex.name,
      usersIndex.settings,
      usersIndex.mappings,
    );
  }

  async search(
    requestDto: UsersSearchRequestDto,
  ): Promise<UsersSearchResponseDto> {
    const {
      query,
      role,
      email,
      isPrivate,
      isVerified,
      from = 0,
      size = 10,
      sortBy = 'createdAt',
      sortOrder = SortOrder.DESC,
    } = requestDto;

    const queryBody = this.queryBuilder.buildSearchQuery({
      query,
      fields: [
        { field: 'username', boost: 3 },
        { field: 'fullName', boost: 2 },
        'email',
        'bio',
      ],
      filters: {
        ...(role ? { role } : {}),
        ...(email ? { email } : {}),
        ...(typeof isPrivate === 'boolean' ? { isPrivate } : {}),
        ...(typeof isVerified === 'boolean' ? { isVerified } : {}),
      },
      from,
      size,
      sort: [{ [sortBy]: { order: sortOrder } }],
      highlight: {
        fields: {
          username: {},
          fullName: {},
          bio: { fragment_size: 150, number_of_fragments: 2 },
        },
        pre_tags: ['<mark>'],
        post_tags: ['</mark>'],
      },
    });

    const result = await this.elasticsearchService.search({
      index: this.indexName,
      body: queryBody,
    });

    // Xử lý kết quả trả về
    const hits = result.hits?.hits ?? [];
    const total =
      typeof result.hits.total === 'number'
        ? result.hits.total
        : (result.hits.total?.value ?? 0);

    const mappedHits: UserSearchHit[] = hits.map((hit) => {
      const source = hit._source as UserDocument;
      return {
        ...source,
        id: hit._id,
        score: hit._score ?? 0,
        highlights: hit.highlight,
      };
    });

    return {
      meta: {
        total,
        took: result.took,
        maxScore: result.hits.max_score ?? 0,
      },
      hits: mappedHits,
      aggregations: result.aggregations ?? {},
      suggestions: result.suggest ?? {},
    };
  }

  // async suggestPostTitles(prefix: string): Promise<UsersSuggestionsResponse> {
  //   const suggestQuery = this.queryBuilder.buildSearchQuery({
  //     suggest: {
  //       text: prefix,
  //       fields: {
  //         title: { prefix_length: 2, size: 5 },
  //         tags: { prefix_length: 1, size: 5 },
  //       },
  //     },
  //     size: 0,
  //   });

  //   const results = await this.elasticsearchService.search({
  //     index: 'posts',
  //     body: suggestQuery,
  //   });

  //   const suggestions = results.suggest
  //     ? this.resultFormatter.formatSuggestions(results.suggest)
  //     : {};

  //   return {
  //     titleSuggestions: suggestions['title_suggest'] || [],
  //     tagSuggestions: suggestions['tags_suggest'] || [],
  //   };
  // }

  async indexUser(user: any): Promise<void> {
    const { _id, ...rest } = user;

    const document = {
      ...rest,
      indexedAt: new Date().toISOString(),
    };

    await this.elasticsearchService.index({
      index: this.indexName,
      id: _id.toString(),
      body: document,
    });
  }

  async updateUser(id: string, user: any): Promise<void> {    
    const { _id, ...userWithoutId } = user;
    await this.elasticsearchService.update({
      index: this.indexName,
      id,
      body: {
        doc: userWithoutId,
      },
    });
  }

  async deleteUser(id: string): Promise<void> {
    await this.elasticsearchService.delete({
      index: this.indexName,
      id,
    });
  }
}
