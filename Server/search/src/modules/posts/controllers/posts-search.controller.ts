import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PostsSearchService } from '../services/posts-search.service';
import { PostsSearchRequestDto } from '../dto/posts-search-request.dto';
import { PostsSearchResponseDto } from '../dto/posts-search-response.dto';

@ApiTags('posts')
@Controller('search/posts')
export class PostsSearchController {
  constructor(private readonly postsSearchService: PostsSearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search posts' })
  @ApiResponse({
    status: 200,
    description: 'List of matching posts',
    type: PostsSearchResponseDto,
  })
  async search(
    @Query() query: PostsSearchRequestDto,
  ): Promise<PostsSearchResponseDto> {
    return this.postsSearchService.search(query);
  }
}
