export const usersIndex = {
  name: 'users',
  aliases: ['users_alias'],
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
        custom_analyzer: {
          type: 'custom',
          tokenizer: 'standard',
          filter: ['lowercase', 'asciifolding'],
        },
        autocomplete: {
          type: 'custom',
          tokenizer: 'autocomplete_tokenizer',
          filter: ['lowercase', 'asciifolding'], // ✅ thêm asciifolding vào đây
        },
      },
    },
  },
  mappings: {
    properties: {
      username: {
        type: 'text',
        analyzer: 'autocomplete',
        search_analyzer: 'standard',
        fields: {
          keyword: { type: 'keyword' },
        },
      },
      email: { type: 'keyword' },
      password: { type: 'keyword', index: false },
      fullName: {
        type: 'text',
        analyzer: 'autocomplete',
        search_analyzer: 'standard',
        fields: {
          keyword: { type: 'keyword' },
        },
      },
      bio: {
        type: 'text',
        analyzer: 'autocomplete',
        search_analyzer: 'standard',
      },
      avatar: {
        properties: {
          avatar_url: { type: 'keyword' },
          avatar_public_id: { type: 'keyword' },
        },
      },
      isPrivate: { type: 'boolean' },
      isVerified: { type: 'boolean' },
      phoneNumber: { type: 'keyword' },
      gender: { type: 'keyword' },
      website: { type: 'keyword' },
      location: {
        properties: {
          country: { type: 'keyword' },
          city: { type: 'keyword' },
        },
      },
      statistics: {
        properties: {
          postCount: { type: 'integer' },
          followerCount: { type: 'integer' },
          followingCount: { type: 'integer' },
        },
      },
      lastActive: { type: 'date' },
      accountStatus: { type: 'keyword' },
      createdAt: { type: 'date' },
    },
  },
};
