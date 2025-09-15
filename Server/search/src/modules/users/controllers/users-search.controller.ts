import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersSearchService } from '../services/users-search.service';
import { UsersSearchRequestDto } from '../dto/users-search-request.dto';
import { UsersSearchResponseDto } from '../dto/users-search-response.dto';

@ApiTags('users')
@Controller('search/users')
export class UsersSearchController {
  constructor(private readonly usersSearchService: UsersSearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search users' })
  @ApiResponse({
    status: 200,
    description: 'List of matching posts',
    type: UsersSearchResponseDto,
  })
  async search(
    @Query() query: UsersSearchRequestDto,
  ): Promise<UsersSearchResponseDto> {
    return this.usersSearchService.search(query);
  }
}
