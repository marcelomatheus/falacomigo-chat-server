import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { FilterProfileDto } from './dto/filter-profile.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CurrentProfile } from '@/auth/decorators/current-profile.decorator';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post()
  create(@Body() createProfileDto: CreateProfileDto) {
    return this.profileService.create(createProfileDto);
  }

  @Get()
  findAll(@Query() filters: FilterProfileDto) {
    return this.profileService.findAll(filters);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMyProfile(@CurrentProfile() profileId: string) {
    return this.profileService.findOne(profileId);
  }

  @Get('user/:userId')
  getProfileByUserId(@Param('userId') userId: string) {
    return this.profileService.findOne(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.profileService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profileService.update(id, updateProfileDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.profileService.remove(id);
  }
}
