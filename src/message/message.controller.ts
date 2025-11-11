import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { FilterMessageDto } from './dto/filter-message.dto';

@ApiTags('Messages')
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new message' })
  @ApiResponse({ status: 201, description: 'Message created' })
  create(@Body() dto: CreateMessageDto) {
    return this.messageService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List messages with filters' })
  @ApiResponse({ status: 200, description: 'List of messages' })
  findAll(@Query() filters: FilterMessageDto) {
    return this.messageService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one message by id' })
  @ApiResponse({ status: 200, description: 'Message found' })
  findOne(@Param('id') id: string) {
    return this.messageService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a message by id' })
  @ApiResponse({ status: 200, description: 'Message updated' })
  update(@Param('id') id: string, @Body() dto: UpdateMessageDto) {
    return this.messageService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a message by id' })
  @ApiResponse({ status: 200, description: 'Message removed' })
  remove(@Param('id') id: string) {
    return this.messageService.remove(id);
  }
}
