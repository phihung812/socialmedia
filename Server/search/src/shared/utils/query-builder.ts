//  Xây dựng các query phức tạp cho Elasticsearch
import { Injectable } from '@nestjs/common';

/**
 * Options for building search queries
 */
export interface QueryOptions {
  // Search term to look for
  query?: string;

  // Fields to search in with optional boosting weights
  fields?: Array<string | { field: string; boost: number }>;

  // Filters to apply (field-value pairs)
  filters?: Record<string, any>;

  // Range filters (e.g. { createdAt: { gte: '2023-01-01', lte: '2023-12-31' }})
  ranges?: Record<string, { gte?: any; gt?: any; lte?: any; lt?: any }>;

  // Pagination options
  from?: number;
  size?: number;

  // Sorting options
  sort?: Array<{ [field: string]: { order: 'asc' | 'desc' } }>;

  // Aggregation definitions
  aggs?: Record<string, any>;

  // Highlighting options
  highlight?: {
    fields: Record<
      string,
      {
        number_of_fragments?: number;
        fragment_size?: number;
        pre_tags?: string[];
        post_tags?: string[];
      }
    >;
    pre_tags?: string[];
    post_tags?: string[];
  };

  // Suggest options for search-as-you-type
  suggest?: {
    text: string;
    fields: Record<
      string,
      {
        prefix_length?: number;
        max_errors?: number;
        size?: number;
      }
    >;
  };

  // Minimum score threshold for results
  min_score?: number;

  // Fields to include/exclude in results
  _source?: string[] | boolean | { includes?: string[]; excludes?: string[] };
}

@Injectable()
export class QueryBuilder {
  /**
   * Build a complete Elasticsearch query from the provided options
   */
  buildSearchQuery(options: QueryOptions): Record<string, any> {
    const esQuery: Record<string, any> = {};

    // Add query if provided
    if (options.query) {
      esQuery.query = this.buildQueryPart(options);
    } else {
      esQuery.query = { match_all: {} };
    }

    // Add filters if provided
    if (options.filters || options.ranges) {
      esQuery.query = this.applyFilters(esQuery.query, options);
    }

    // Add pagination
    if (options.from !== undefined) {
      esQuery.from = options.from;
    }

    if (options.size !== undefined) {
      esQuery.size = options.size;
    }

    // Add sorting
    if (options.sort && options.sort.length > 0) {
      esQuery.sort = options.sort;
    }

    // Add aggregations
    if (options.aggs) {
      esQuery.aggs = options.aggs;
    }

    // Add highlighting
    if (options.highlight) {
      esQuery.highlight = options.highlight;
    }

    // Add suggestions
    if (options.suggest) {
      esQuery.suggest = this.buildSuggestPart(options.suggest);
    }

    // Add minimum score threshold
    if (options.min_score !== undefined) {
      esQuery.min_score = options.min_score;
    }

    // Set source filtering
    if (options._source !== undefined) {
      esQuery._source = options._source;
    }

    return esQuery;
  }

  /**
   * Build the query part of the Elasticsearch query
   */
  buildQueryPart(options: QueryOptions): Record<string, any> {
    if (!options.query || options.query.trim() === '') {
      return { match_all: {} };
    }

    const fields = options.fields?.map((f) =>
      typeof f === 'string' ? f : `${f.field}^${f.boost}`,
    ) ?? ['title', 'content', 'tags']; // fallback nếu thiếu

    return {
      bool: {
        must: [
          {
            multi_match: {
              query: options.query,
              fields,
              fuzziness: 'AUTO', // Optional: tìm gần đúng (ví dụ "oke" vẫn khớp "ok")
            },
          },
        ],
      },
    };
  }

  // private applyFilters(
  //   query: Record<string, any>,
  //   options: QueryOptions,
  // ): Record<string, any> {
  //   const bool = query.bool || {};
  //   bool.filter = bool.filter || [];

  //   const keywordFields = ['status', 'authorId', 'tags'];

  //   if (options.filters) {
  //     Object.entries(options.filters).forEach(([field, value]) => {
  //       const filterField = keywordFields.includes(field)
  //         ? `${field}.keyword`
  //         : field;

  //       if (Array.isArray(value)) {
  //         bool.filter.push({ terms: { [filterField]: value } });
  //       } else if (value !== null && value !== undefined) {
  //         bool.filter.push({ term: { [filterField]: value } });
  //       } else {
  //         bool.filter.push({
  //           bool: {
  //             must_not: [{ exists: { field: filterField } }],
  //           },
  //         });
  //       }
  //     });
  //   }

  //   if (options.ranges) {
  //     Object.entries(options.ranges).forEach(([field, rangeValues]) => {
  //       bool.filter.push({
  //         range: { [field]: rangeValues },
  //       });
  //     });
  //   }

  //   return { bool };
  // }

  private applyFilters(
    query: Record<string, any>,
    options: QueryOptions,
  ): Record<string, any> {
    const bool = query.bool || {};
    const filters = bool.filter || [];

    const keywordFields = [
      'status',
      'authorId',
      'tags',
      'privacy',
      'isPrivate',
      'isVerified',
    ];

    if (options.filters) {
      Object.entries(options.filters).forEach(([field, value]) => {
        const filterField = keywordFields.includes(field)
          ? `${field}` // Bạn dùng `.keyword` khi field là `text`, nếu đã là `boolean` hoặc `keyword` thì không cần
          : field;

        if (Array.isArray(value)) {
          filters.push({ terms: { [filterField]: value } });
        } else if (value !== null && value !== undefined) {
          filters.push({ term: { [filterField]: value } });
        } else {
          filters.push({
            bool: {
              must_not: [{ exists: { field: filterField } }],
            },
          });
        }
      });
    }

    if (options.ranges) {
      Object.entries(options.ranges).forEach(([field, rangeValues]) => {
        filters.push({
          range: { [field]: rangeValues },
        });
      });
    }

    return {
      bool: {
        ...bool,
        filter: filters,
      },
    };
  }

  /**
   * Build suggestion part of the query
   */
  private buildSuggestPart(
    suggestOptions: QueryOptions['suggest'],
  ): Record<string, any> | undefined {
    if (!suggestOptions) return undefined;

    const result: Record<string, any> = {};

    Object.entries(suggestOptions.fields).forEach(([fieldName, options]) => {
      result[`${fieldName}_suggest`] = {
        text: suggestOptions.text,
        term: {
          field: fieldName,
          prefix_length: options.prefix_length || 1,
          max_errors: options.max_errors || 2,
          size: options.size || 5,
          suggest_mode: 'popular',
        },
      };
    });

    return result;
  }

  /**
   * Format fields for multi_match query, handling boosting
   */
  private formatFields(
    fields: Array<string | { field: string; boost: number }>,
  ): string[] {
    return fields.map((field) => {
      if (typeof field === 'string') {
        return field;
      } else {
        return `${field.field}^${field.boost}`;
      }
    });
  }

  /**
   * Create a specialized query for full-text search with advanced features
   */
  buildFullTextSearchQuery(
    text: string,
    options: {
      fields: Array<string | { field: string; boost: number }>;
      fuzziness?: 'AUTO' | 0 | 1 | 2;
      phraseSlop?: number;
      operator?: 'and' | 'or';
    },
  ): Record<string, any> {
    const formattedFields = this.formatFields(options.fields);

    return {
      multi_match: {
        query: text,
        fields: formattedFields,
        type: 'most_fields',
        fuzziness: options.fuzziness || 'AUTO',
        phrase_slop: options.phraseSlop || 2,
        operator: options.operator || 'and',
      },
    };
  }

  /**
   * Create a geo-distance query for location-based searching
   */
  buildGeoDistanceQuery(
    field: string,
    lat: number,
    lon: number,
    distance: string,
  ): Record<string, any> {
    return {
      geo_distance: {
        distance,
        [field]: {
          lat,
          lon,
        },
      },
    };
  }

  /**
   * Build a query that combines full-text search with filters
   */
  buildCombinedQuery(
    searchText: string,
    searchFields: Array<string | { field: string; boost: number }>,
    filters?: Record<string, any>,
    ranges?: Record<string, { gte?: any; gt?: any; lte?: any; lt?: any }>,
  ): Record<string, any> {
    const query: {
      bool: {
        must: Record<string, any>[];
        filter: Record<string, any>[];
      };
    } = {
      bool: {
        must: [],
        filter: [],
      },
    };

    // Add full-text search if provided
    if (searchText) {
      query.bool.must.push(
        this.buildFullTextSearchQuery(searchText, { fields: searchFields }),
      );
    } else {
      query.bool.must.push({ match_all: {} });
    }

    // Add term filters
    if (filters) {
      Object.entries(filters).forEach(([field, value]) => {
        if (Array.isArray(value)) {
          query.bool.filter.push({ terms: { [field]: value } });
        } else {
          query.bool.filter.push({ term: { [field]: value } });
        }
      });
    }

    // Add range filters
    if (ranges) {
      Object.entries(ranges).forEach(([field, rangeValues]) => {
        query.bool.filter.push({
          range: { [field]: rangeValues },
        });
      });
    }

    return query;
  }
}