import { Injectable } from '@nestjs/common';
import {
  SearchResult,
  PaginatedSearchResult,
  PaginationMeta,
} from '../interfaces/search-result.interface';

/**
 * Options for formatting search results
 */
export interface FormatterOptions {
  /**
   * Whether to include highlights in the formatted results
   */
  includeHighlights?: boolean;

  /**
   * Whether to include score in the formatted results
   */
  includeScore?: boolean;

  /**
   * Whether to include aggregations in the formatted results
   */
  includeAggregations?: boolean;

  /**
   * Whether to include suggestions in the formatted results
   */
  includeSuggestions?: boolean;

  /**
   * Whether to map IDs from _id to id field
   */
  mapIds?: boolean;

  /**
   * Pagination information
   */
  pagination?: {
    page: number;
    limit: number;
  };

  /**
   * Function to transform each document
   */
  transformDocument?: (doc: any) => any;
}

@Injectable()
export class ResultFormatter {
  /**
   * Format raw Elasticsearch search results into standardized SearchResult object
   */
  formatSearchResults<T>(
    rawResults: any,
    options: FormatterOptions = {},
  ): SearchResult<T> {
    const defaults: FormatterOptions = {
      includeHighlights: true,
      includeScore: true,
      includeAggregations: true,
      includeSuggestions: true,
      mapIds: true,
      transformDocument: (doc) => doc,
    };

    const opts = { ...defaults, ...options };

    // Format the metadata
    const meta = {
      total: this.extractTotalHits(rawResults),
      maxScore: rawResults.hits.max_score || 0,
      took: rawResults.took || 0,
    };

    // Format the hits
    const hits = rawResults.hits.hits.map((hit) => {
      const source = { ...hit._source };

      // Map _id to id if needed
      if (opts.mapIds) {
        source.id = hit._id;
      }

      // Add score if needed
      if (opts.includeScore) {
        source.score = hit._score;
      }

      // Add highlights if needed
      if (opts.includeHighlights && hit.highlight) {
        source.highlights = hit.highlight;
      }

      // Apply custom transformation if provided
      if (opts.transformDocument) {
        return opts.transformDocument(source);
      }
      
    });

    // Create the result object
    const result: SearchResult<T> = {
      meta,
      hits: hits as Array<
        T & { score: number; highlights?: Record<string, string[]> }
      >,
    };

    // Add aggregations if needed
    if (opts.includeAggregations && rawResults.aggregations) {
      result.aggregations = rawResults.aggregations;
    }

    // Add suggestions if needed
    if (opts.includeSuggestions && rawResults.suggest) {
      result.suggestions = rawResults.suggest;
    }

    // Add pagination if needed
    if (opts.pagination) {
      return this.addPagination(result, opts.pagination, meta.total);
    }

    return result;
  }

  /**
   * Extract total hits count from Elasticsearch response
   * Handles different response formats in ES 7.x vs older versions
   */
  private extractTotalHits(rawResults: any): number {
    // For Elasticsearch 7.x and above, total is an object
    if (rawResults.hits.total && typeof rawResults.hits.total === 'object') {
      return rawResults.hits.total.value;
    }

    // For older Elasticsearch versions, total is a number
    return rawResults.hits.total || 0;
  }

  /**
   * Add pagination metadata to search results
   */
  private addPagination<T>(
    result: SearchResult<T>,
    pagination: { page: number; limit: number },
    totalItems: number,
  ): PaginatedSearchResult<T> {
    const { page, limit } = pagination;
    const totalPages = Math.ceil(totalItems / limit);

    const paginationMeta: PaginationMeta = {
      page,
      limit,
      totalPages,
      totalItems,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };

    return {
      ...result,
      pagination: paginationMeta,
    };
  }

  /**
   * Format suggestion results from Elasticsearch
   */
  formatSuggestions(
    rawSuggestions: Record<string, any[]>,
  ): Record<string, string[]> {
    const formattedSuggestions: Record<string, string[]> = {};

    Object.entries(rawSuggestions).forEach(([key, suggestions]) => {
      formattedSuggestions[key] = suggestions[0].options.map(
        (option) => option.text,
      );
    });

    return formattedSuggestions;
  }

  /**
   * Format aggregation results from Elasticsearch
   */
  formatAggregations(
    rawAggregations: Record<string, any>,
  ): Record<string, any> {
    const formattedAggs: Record<string, any> = {};

    Object.entries(rawAggregations).forEach(([key, agg]) => {
      // Handle terms aggregation
      if (agg.buckets) {
        formattedAggs[key] = agg.buckets.map((bucket) => ({
          key: bucket.key,
          count: bucket.doc_count,
          // Handle nested aggregations
          ...this.extractNestedAggregations(bucket),
        }));
      }
      // Handle metric aggregations
      else if (agg.value !== undefined) {
        formattedAggs[key] = agg.value;
      }
      // Handle range aggregations
      else if (agg.ranges) {
        formattedAggs[key] = agg.ranges.map((range) => ({
          from: range.from,
          to: range.to,
          count: range.doc_count,
        }));
      }
      // Just pass through any other aggregation types
      else {
        formattedAggs[key] = agg;
      }
    });

    return formattedAggs;
  }

  /**
   * Extract nested aggregations from an aggregation bucket
   */
  private extractNestedAggregations(bucket: any): Record<string, any> {
    const nestedAggs: Record<string, any> = {};

    Object.entries(bucket).forEach(([key, value]) => {
      // Skip standard bucket properties
      if (['key', 'doc_count', 'key_as_string'].includes(key)) {
        return;
      }

      // Format the nested aggregation
      nestedAggs[key] = this.formatAggregations({ [key]: value })[key];
    });

    return nestedAggs;
  }
}
