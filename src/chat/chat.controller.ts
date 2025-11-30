import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseGuards,
  Param,
  Patch,
  Delete,
  BadRequestException,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentProfile } from '@/auth/decorators/current-profile.decorator';
import { FilterChatDto } from './dto/filter-chat.dto';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  async findAll(
    @CurrentProfile() profileId: string,
    @Query() filters: FilterChatDto,
  ) {
    const chats = await this.chatService.findAll({
      ...filters,
      participantId: profileId,
    });
    return chats;
  }

  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return this.chatService.findOne(id);
  }

  @Post()
  async create(
    @CurrentProfile() profileId: string,
    @Body() createChatDto: CreateChatDto,
  ) {
    return this.chatService.create({
      ...createChatDto,
      participantIds: [profileId, ...(createChatDto.participantIds || [])],
    });
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateChatDto: UpdateChatDto) {
    return this.chatService.update(id, updateChatDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.chatService.remove(id);
  }

  @Post('/find-or-create')
  async findOrCreateChat(
    @CurrentProfile() profileId: string,
    @Body('recipientId') recipientId: string,
  ) {
    if (!recipientId || typeof recipientId !== 'string') {
      throw new BadRequestException('Recipient profile ID is required');
    }

    return this.chatService.findOrCreateChat(profileId, recipientId);
  }

  @Get('by-profile')
  async getChatByProfile(
    @CurrentProfile() profileId: string,
    @Query('profileId') recipientProfileId: string,
  ) {
    if (!recipientProfileId || typeof recipientProfileId !== 'string') {
      throw new BadRequestException('Recipient profile ID is required');
    }

    return this.chatService.findOrCreateChat(profileId, recipientProfileId);
  }
}
