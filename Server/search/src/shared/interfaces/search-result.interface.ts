/**
 * Generic interface for search results
 * T represents the document type being searched
 */
export interface SearchResult<T> {
  /**
   * Metadata about the search operation
   */
  meta: {
    /**
     * Total number of matching documents
     */
    total: number;

    /**
     * Highest relevance score among search results
     */
    maxScore: number;

    /**
     * Time taken to execute the search in milliseconds
     */
    took: number;
  };

  /**
   * Array of search result documents
   */
  hits: Array<
    T & {
      /**
       * Document relevance score
       */
      score: number;

      /**
       * Highlighted content snippets
       */
      highlights?: Record<string, string[]>;
    }
  >;

  /**
   * Optional aggregations from the search results
   */
  aggregations?: Record<string, any>;

  /**
   * Optional suggestions for search terms
   */
  suggestions?: Record<string, any[]>;
}

/**
 * Interface for pagination metadata
 */
export interface PaginationMeta {
  /**
   * Current page number
   */
  page: number;

  /**
   * Number of items per page
   */
  limit: number;

  /**
   * Total number of pages
   */
  totalPages: number;

  /**
   * Total number of items
   */
  totalItems: number;

  /**
   * Whether there is a next page
   */
  hasNextPage: boolean;

  /**
   * Whether there is a previous page
   */
  hasPreviousPage: boolean;
}

/**
 * Interface for paginated search results
 */
export interface PaginatedSearchResult<T> extends SearchResult<T> {
  /**
   * Pagination metadata
   */
  pagination: PaginationMeta;
}
