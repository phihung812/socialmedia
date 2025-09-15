import { QueryBuilder } from './../../../shared/utils/query-builder';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '../../../shared/elasticsearch/elasticsearch.service';
import {
  GlobalSearchRequestDto,
  SearchEntityType,
  SearchSortOrder,
} from '../dto/global-search-request.dto';
import {
  GlobalSearchResponse,
  GlobalSearchMetadata,
  UserSearchHit,
  PostSearchHit,
  CommentSearchHit,
  TagSearchHit,
  PaginationDto,
} from '../dto/global-search-response.dto';
import * as moment from 'moment';
import { firstValueFrom } from 'rxjs';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class GlobalSearchService {
  private readonly logger = new Logger(GlobalSearchService.name);

  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly queryBuilder: QueryBuilder,
    @Inject('INTERACTION_SERVICE')
    private readonly interactionClient: ClientProxy,
  ) {}

  async search(
    searchRequestDto: GlobalSearchRequestDto,
    currentUserId: string,
  ): Promise<GlobalSearchResponse> {
    const {
      query,
      entityTypes,
      page,
      limit,
      sortOrder,
      fromDate,
      toDate,
      tags,
    } = searchRequestDto;

    // Determine which indices to search based on entityTypes
    const indices = this.getIndicesToSearch(entityTypes);
    const from = (page - 1) * limit;

    try {
      const sort = this.getSortOrder(sortOrder);
      const baseQuery = this.queryBuilder.buildSearchQuery({
        query,
        fields: [
          { field: 'caption', boost: 2 },
          { field: 'fullName', boost: 2 },
          { field: 'username', boost: 1.5 },
          'bio',
          'email',
        ],
        filters: {
          ...(tags?.length ? { tags } : {}),
        },
        from,
        sort,
        highlight: {
          fields: {
            caption: {},
            fullName: { fragment_size: 150, number_of_fragments: 3 },
          },
          pre_tags: ['<mark>'],
          post_tags: ['</mark>'],
        },
      });

      // Build query với must_not để loại trừ current user
      const queryBody = {
        ...baseQuery,
        query: {
          bool: {
            must: baseQuery.query,
            must_not: [
              // Loại trừ current user từ cả users và posts index
              {
                bool: {
                  should: [
                    {
                      bool: {
                        must: [
                          { term: { _index: 'users' } },
                          { term: { _id: currentUserId } },
                        ],
                      },
                    },
                    {
                      bool: {
                        must: [
                          { term: { _index: 'posts' } },
                          { term: { userId: currentUserId } },
                        ],
                      },
                    },
                  ],
                  minimum_should_match: 1,
                },
              },
            ],
            filter: [
              // Date range filter nếu có
              ...(fromDate || toDate
                ? [
                    {
                      range: {
                        createdAt: {
                          ...(fromDate && { gte: fromDate }),
                          ...(toDate && { lte: toDate }),
                        },
                      },
                    },
                  ]
                : []),
              // Privacy/visibility filters
              {
                bool: {
                  should: [
                    {
                      bool: {
                        must: [
                          { term: { _index: 'users' } },
                          { term: { isPrivate: false } },
                        ],
                      },
                    },
                    {
                      bool: {
                        must: [
                          { term: { _index: 'posts' } },
                          { term: { privacy: 'public' } },
                        ],
                      },
                    },
                  ],
                  minimum_should_match: 1,
                },
              },
            ],
          },
        },
      };

      const searchResult = await this.elasticsearchService.search({
        index: indices,
        body: queryBody,
        track_total_hits: true,
      });

      const hits = searchResult.hits.hits;
      const postIds = hits
        .filter((hit) => hit._index === 'posts')
        .map((hit) => hit._id);

      const likedPostIds = await firstValueFrom(
        this.interactionClient.send(
          { cmd: 'list-like-post' },
          { currentUserId, postIds },
        ),
      );
      
      const result = this.formatSearchResults(searchResult, page, limit);

      result.posts = result.posts.map((post) => ({
        ...post,
        liked: likedPostIds.includes(post.id.toString()), 
      }));
      console.log(result);
      
      return result
    } catch (error) {
      this.logger.error(
        `Error performing global search: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async getSuggestions(query: string): Promise<{ suggestions: string[] }> {
    if (!query || query.length < 2) {
      return { suggestions: [] };
    }

    try {
      const result = await this.elasticsearchService.search({
        index: ['users', 'posts', 'tags'],
        body: {
          size: 0,
          suggest: {
            text: query,
            title_suggestions: {
              term: {
                field: 'title',
                suggest_mode: 'popular',
                size: 5,
              },
            },
            name_suggestions: {
              term: {
                field: 'name',
                suggest_mode: 'popular',
                size: 5,
              },
            },
            tag_suggestions: {
              term: {
                field: 'tags',
                suggest_mode: 'popular',
                size: 5,
              },
            },
          },
        },
      });

      function safeOptions(options: any): any[] {
        return Array.isArray(options) ? options : [];
      }

      const titleSuggestions = safeOptions(
        result.suggest?.title_suggestions?.[0]?.options,
      );
      const nameSuggestions = safeOptions(
        result.suggest?.name_suggestions?.[0]?.options,
      );
      const tagSuggestions = safeOptions(
        result.suggest?.tag_suggestions?.[0]?.options,
      );

      const allSuggestions = [
        ...titleSuggestions.map((s) => s.text),
        ...nameSuggestions.map((s) => s.text),
        ...tagSuggestions.map((s) => s.text),
      ];

      const uniqueSuggestions = [...new Set(allSuggestions)].slice(0, 10);

      return { suggestions: uniqueSuggestions };
    } catch (error) {
      this.logger.error(
        `Error getting search suggestions: ${error.message}`,
        error.stack,
      );
      return { suggestions: [] };
    }
  }

  async getTrending(): Promise<{
    trending: Array<{ topic: string; count: number; trend: number }>;
  }> {
    try {
      // In a real application, this would query a dedicated index that tracks search queries
      // For demonstration, we'll return mock data
      return {
        trending: [
          { topic: 'elasticsearch', count: 1245, trend: 0.15 },
          { topic: 'nestjs tutorial', count: 987, trend: 0.23 },
          { topic: 'microservices', count: 876, trend: 0.08 },
          { topic: 'typescript', count: 632, trend: -0.03 },
          { topic: 'rabbitmq', count: 543, trend: 0.12 },
        ],
      };
    } catch (error) {
      this.logger.error(
        `Error getting trending topics: ${error.message}`,
        error.stack,
      );
      return { trending: [] };
    }
  }

  /**
   * Determine which indices to search based on entity types
   */
  private getIndicesToSearch(entityTypes: SearchEntityType[]): string[] {
    if (entityTypes.includes(SearchEntityType.ALL)) {
      return ['users', 'posts'];
      //   return ['users', 'posts', 'comments', 'tags'];
    }

    const indices: string[] = [];
    if (entityTypes.includes(SearchEntityType.USERS)) {
      indices.push('users');
    }
    if (entityTypes.includes(SearchEntityType.POSTS)) {
      indices.push('posts');
    }
    // if (entityTypes.includes(SearchEntityType.COMMENTS)) {
    //   indices.push('comments');
    // }
    // if (entityTypes.includes(SearchEntityType.TAGS)) {
    //   indices.push('tags');
    // }

    return indices.length > 0 ? indices : ['users', 'posts'];
  }

  /**
   * Determine sort order based on request
   */
  private getSortOrder(sortOrder: SearchSortOrder): any[] {
    switch (sortOrder) {
      case SearchSortOrder.NEWEST:
        return [{ createdAt: { order: 'desc' } }];
      case SearchSortOrder.OLDEST:
        return [{ createdAt: { order: 'asc' } }];
      case SearchSortOrder.MOST_POPULAR:
        return [
          { likesCount: { order: 'desc', missing: '_last' } },
          { commentsCount: { order: 'desc', missing: '_last' } },
          { count: { order: 'desc', missing: '_last' } },
          '_score',
        ];
      case SearchSortOrder.RELEVANCE:
      default:
        return ['_score', { createdAt: { order: 'desc' } }];
    }
  }

  /**
   * Format Elasticsearch response into GlobalSearchResponse
   */
  private formatSearchResults(
    searchResult: any,
    page: number,
    limit: number,
  ): GlobalSearchResponse {
    const total = searchResult.hits.total.value || 0;
    const took = searchResult.took || 0;
    const hits = searchResult.hits.hits || [];

    // Calculate pagination
    const totalPages = Math.ceil(total / limit);
    const pagination: PaginationDto = {
      page,
      limit,
      totalPages,
      totalItems: total,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    // Get entity counts
    const entityCountsAgg =
      searchResult.aggregations?.entity_counts?.buckets || [];
    const counts = {};
    entityCountsAgg.forEach((bucket) => {
      const index = bucket.key;
      const count = bucket.doc_count;

      if (index === 'users') {
        counts[SearchEntityType.USERS] = count;
      } else if (index === 'posts') {
        counts[SearchEntityType.POSTS] = count;
      }
    });

    // Format metadata
    const meta: GlobalSearchMetadata = {
      total,
      took,
      counts,
    };

    // Group hits by entity type
    const users: UserSearchHit[] = [];
    const posts: PostSearchHit[] = [];
    const comments: CommentSearchHit[] = [];
    const tags: TagSearchHit[] = [];

    hits.forEach((hit) => {
      const source = hit._source;
      const index = hit._index;
      const id = hit._id;
      const score = hit._score;
      const highlights = hit.highlight;

      if (index === 'users') {
        users.push(this.formatUserHit(id, source, score, highlights));
      } else if (index === 'posts') {
        posts.push(this.formatPostHit(id, source, score, highlights));
      }
    });

    // Construct and return response
    return {
      meta,
      pagination,
      users,
      posts,
      comments,
      tags,
    };
  }

  private formatUserHit(
    id: string,
    source: any,
    score: number,
    highlights?: any,
  ): UserSearchHit {
    return {
      id,
      entityType: SearchEntityType.USERS,
      score,
      fullName: source.fullName,
      username: source.username,
      email: source.email,
      phoneNumber: source.phoneNumber,
      isPrivate: source.isPrivate,
      isVerified: source.isVerified,
      statistics: source.statistics,
      avatar: source.avatar || null,
      bio: source.bio,
      role: source.role,
      createdAt: new Date(source.createdAt),
      updatedAt: new Date(source.updatedAt),
      highlights: highlights
        ? {
            name: highlights.name,
            bio: highlights.bio,
          }
        : undefined,
    };
  }

  private formatPostHit(
    id: string,
    source: any,
    score: number,
    highlights?: any,
  ): PostSearchHit {
    return {
      id,
      _id: id,
      entityType: SearchEntityType.POSTS,
      score,
      title: source.title,
      caption: source.caption,
      contentPreview: source.content?.substring(0, 200) + '...',

      author: source.author,
      mentionedUsers: source.mentionedUsers,
      privacy: source.privacy,
      tags: source.tags || [],

      images: source.images,
      statistics: source.statistics,
      createdAt: new Date(source.createdAt),
      updatedAt: new Date(source.updatedAt),
      highlights: highlights
        ? {
            title: highlights.title,
            contentPreview: highlights.content,
            tags: highlights.tags,
          }
        : undefined,
    };
  }

  //   private formatCommentHit(
  //     id: string,
  //     source: any,
  //     score: number,
  //     highlights?: any,
  //   ): CommentSearchHit {
  //     return {
  //       id,
  //       entityType: SearchEntityType.COMMENTS,
  //       score,
  //       contentPreview: source.content?.substring(0, 200) + '...',
  //       postId: source.postId,
  //       postTitle: source.postTitle,
  //       authorId: source.authorId,
  //       authorName: source.authorName,
  //       createdAt: new Date(source.createdAt),
  //       updatedAt: new Date(source.updatedAt),
  //       highlights: highlights
  //         ? {
  //             contentPreview: highlights.content,
  //           }
  //         : undefined,
  //     };
  //   }

  //   private formatTagHit(
  //     id: string,
  //     source: any,
  //     score: number,
  //     highlights?: any,
  //   ): TagSearchHit {
  //     return {
  //       id,
  //       entityType: SearchEntityType.TAGS,
  //       score,
  //       name: source.name,
  //       description: source.description,
  //       count: source.count || 0,
  //       createdAt: new Date(source.createdAt),
  //       updatedAt: new Date(source.updatedAt),
  //       highlights: highlights
  //         ? {
  //             name: highlights.name,
  //             description: highlights.description,
  //           }
  //         : undefined,
  //     };
  //   }
}
