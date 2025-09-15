import { ResultFormatter } from './../../../shared/utils/result-formatter';
import { QueryBuilder } from './../../../shared/utils/query-builder';
import { Injectable } from '@nestjs/common';
import { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types';
import { ElasticsearchService } from '../../../shared/elasticsearch/elasticsearch.service';
import { PostsSearchRequestDto, SortOrder } from '../dto/posts-search-request.dto';
import { PostSearchHit, PostsSearchResponseDto, PostsSuggestionsResponse } from '../dto/posts-search-response.dto';
import { IndexManagerService } from 'src/shared/elasticsearch/index-manager.service';
import { PostDocument } from '../interfaces/post-document.interface';
import { postsIndex } from '../indices/posts.index';

@Injectable()
export class PostsSearchService {
  private readonly indexName = 'posts';

  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly indexManagerService: IndexManagerService,
    private readonly queryBuilder: QueryBuilder,
    private readonly resultFormatter: ResultFormatter,
  ) {}

  async onModuleInit() {

    await this.indexManagerService.createIndexIfNotExists(
      postsIndex.name,
      postsIndex.settings,
      postsIndex.mappings,
    );
  }

  async search(
    requestDto: PostsSearchRequestDto,
  ): Promise<PostsSearchResponseDto> {
    const {
      query,
      tags,
      authorId,
      from = 0,
      size = 10,
      sortBy = 'createdAt',
      sortOrder = SortOrder.DESC,
    } = requestDto;

    const queryBody = this.queryBuilder.buildSearchQuery({
      query,
      fields: [
        { field: 'caption', boost: 2 },
        'title',
        'tags',
        'mentionedUsers',
      ],
      filters: {
        ...(authorId && { authorId }),
        ...(tags?.length ? { tags } : {}),
        status: 'published',
      },
      from,
      size,
      sort: [{ [sortBy]: { order: sortOrder } }],
      highlight: {
        fields: {
          title: {},
          content: { fragment_size: 150, number_of_fragments: 3 },
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

    const mappedHits: PostSearchHit[] = hits.map((hit) => {
      const source = hit._source as PostDocument;
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
      posts: mappedHits.map((hit) => ({
        ...hit,
        id: hit.id,
        score: hit.score,
      })),
      total,
      aggregations: result.aggregations ?? {},
      suggestions: result.suggest ?? {},
    };
  }

  async suggestPostTitles(prefix: string): Promise<PostsSuggestionsResponse> {
    const suggestQuery = this.queryBuilder.buildSearchQuery({
      suggest: {
        text: prefix,
        fields: {
          title: { prefix_length: 2, size: 5 },
          tags: { prefix_length: 1, size: 5 },
        },
      },
      size: 0,
    });

    const results = await this.elasticsearchService.search({
      index: 'posts',
      body: suggestQuery,
    });

    const suggestions = results.suggest
      ? this.resultFormatter.formatSuggestions(results.suggest)
      : {};

    return {
      titleSuggestions: suggestions['title_suggest'] || [],
      tagSuggestions: suggestions['tags_suggest'] || [],
    };
  }

  async indexPost(post: any): Promise<void> {
    const { _id, status, ...rest } = post;

    const document = {
      ...rest,
      status: status || 'published', 
    };
    
    await this.elasticsearchService.index({
      index: this.indexName,
      id: _id,
      body: document,
    });
  }

  async updatePost(id: string, post: any): Promise<void> {
    const { _id, ...docData } = post;

    await this.elasticsearchService.update({
      index: this.indexName,
      id: id,
      body: {
        doc: docData,
      },
    });
  }

  async deletePost(id: string): Promise<void> {
    await this.elasticsearchService.delete({
      index: this.indexName,
      id,
    });
  }
}
