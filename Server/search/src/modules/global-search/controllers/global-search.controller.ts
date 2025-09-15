import { Controller, Get, Query, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GlobalSearchService } from '../services/global-search.service';
import { GlobalSearchRequestDto } from '../dto/global-search-request.dto';
import { GlobalSearchResponse } from '../dto/global-search-response.dto';
import * as jwt from 'jsonwebtoken';


@ApiTags('Search')
@Controller('search')
export class GlobalSearchController {
  constructor(private readonly globalSearchService: GlobalSearchService) {}

  @Get()
  @ApiOperation({
    summary: 'Search across all entities (users, posts, comments, tags)',
  })
  @ApiResponse({
    status: 200,
    description: 'Search results from all entities',
    type: GlobalSearchResponse,
  })
  @ApiResponse({ status: 400, description: 'Invalid request parameters' })
  async search(
    @Query() searchRequestDto: GlobalSearchRequestDto,
    @Req() req
  ){
    const token = req.headers['authorization']?.replace('Bearer ', '');

    const decoded: any = jwt.decode(token);
    const userId = decoded?.sub;    

    if (!userId) {
      throw new Error('Không thể lấy thông tin người dùng từ token');
    }
    
    return this.globalSearchService.search(searchRequestDto, userId);
  }

  @Get('suggestions')
  @ApiOperation({
    summary: 'Get search query suggestions based on partial input',
  })
  @ApiResponse({
    status: 200,
    description: 'List of search suggestions',
    schema: {
      type: 'object',
      properties: {
        suggestions: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    },
  })
  async getSuggestions(
    @Query('query') query: string,
  ): Promise<{ suggestions: string[] }> {
    return this.globalSearchService.getSuggestions(query);
  }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending search topics' })
  @ApiResponse({
    status: 200,
    description: 'List of trending search topics',
    schema: {
      type: 'object',
      properties: {
        trending: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              topic: { type: 'string' },
              count: { type: 'number' },
              trend: { type: 'number' },
            },
          },
        },
      },
    },
  })
  async getTrending(): Promise<{
    trending: Array<{ topic: string; count: number; trend: number }>;
  }> {
    return this.globalSearchService.getTrending();
  }
}
