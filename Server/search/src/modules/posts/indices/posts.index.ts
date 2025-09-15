export const postsIndex = {
  name: 'posts',
  aliases: ['posts_alias'],
  settings: {
    number_of_shards: 3,
    number_of_replicas: 1,
    analysis: {
      tokenizer: {
        autocomplete_tokenizer: {
          type: 'edge_ngram',
          min_gram: 1,
          max_gram: 20,
          token_chars: ['letter', 'digit'],
        },
      },
      analyzer: {
        autocomplete: {
          type: 'custom',
          tokenizer: 'autocomplete_tokenizer',
          filter: ['lowercase', 'asciifolding'],
        },
        custom_analyzer: {
          type: 'custom',
          tokenizer: 'standard',
          filter: ['lowercase', 'asciifolding'],
        },
      },
    },
  },
  mappings: {
    properties: {
      id: { type: 'keyword' },
      title: {
        type: 'text',
        analyzer: 'autocomplete',
        search_analyzer: 'standard',
        fields: {
          keyword: { type: 'keyword' },
        },
      },
      content: {
        type: 'text',
        analyzer: 'autocomplete',
        search_analyzer: 'standard',
      },
      caption: {
        type: 'text',
        analyzer: 'autocomplete',
        search_analyzer: 'standard',
      },
      authorId: { type: 'keyword' },
      authorName: {
        type: 'text',
        analyzer: 'autocomplete',
        search_analyzer: 'standard',
        fields: { keyword: { type: 'keyword' } },
      },
      privacy: { type: 'keyword' }, 
      createdAt: { type: 'date' },
      updatedAt: { type: 'date' },
      tags: { type: 'keyword' },
      likesCount: { type: 'integer' },
      commentsCount: { type: 'integer' },
      status: { type: 'keyword' },
      category: { type: 'keyword' },
    },
  },
};
