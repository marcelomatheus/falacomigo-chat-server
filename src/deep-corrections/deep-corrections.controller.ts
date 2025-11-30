import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DeepCorrectionsService } from './deep-corrections.service';
import { UpdateDeepCorrectionsDto } from './dto/update-deep-corrections.dto';
import { FilterDeepCorrectionsDto } from './dto/filter-message.dto';

@ApiTags('Messages')
@Controller('messages')
export class MessageController {
  constructor(
    private readonly deepCorrectionsService: DeepCorrectionsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List deep corrections with filters' })
  @ApiResponse({ status: 200, description: 'List of deep corrections' })
  findAll(@Query() filters: FilterDeepCorrectionsDto) {
    return this.deepCorrectionsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one deep correction by id' })
  @ApiResponse({ status: 200, description: 'Deep correction founded' })
  findOne(@Param('id') id: string) {
    return this.deepCorrectionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a deep correction by id' })
  @ApiResponse({ status: 200, description: 'Deep correction updated' })
  update(@Param('id') id: string, @Body() dto: UpdateDeepCorrectionsDto) {
    return this.deepCorrectionsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a deep correction by id' })
  @ApiResponse({ status: 200, description: 'Deep correction removed' })
  remove(@Param('id') id: string) {
    return this.deepCorrectionsService.remove(id);
  }
}
