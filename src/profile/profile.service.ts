import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { FilterProfileDto } from './dto/filter-profile.dto';
import { ProfileEntity } from './entities/profile.entity';
import { ProfileQueryBuilder } from './auxiliary-methods/profile-query.builder';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProfileDto, tx?: Prisma.TransactionClient) {
    const client = tx || this.prisma;

    return client.profile.create({
      data: dto,
    });
  }

  async findAll(filters?: FilterProfileDto): Promise<ProfileEntity[]> {
    const {
      page = 1,
      limit = 10,
      orderBy = 'createdAt',
      orderDirection = 'desc',
      search,
      knownLanguages,
      ...rest
    } = filters ?? {};

    const safeOrderBy = ['createdAt', 'updatedAt', 'name'].includes(
      orderBy as string,
    )
      ? orderBy
      : 'createdAt';

    const qb = new ProfileQueryBuilder();
    const where = qb.buildWhere({ search, knownLanguages, ...rest });

    return this.prisma.profile.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [safeOrderBy]: orderDirection },
    });
  }

  async findOne(id: string | number): Promise<ProfileEntity> {
    const profile = await this.prisma.profile.findUnique({
      where: { id: String(id) },
    });
    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }

  async findByUserId(userId: string): Promise<ProfileEntity> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });
    if (!profile) throw new NotFoundException('Profile not found for user');
    return profile;
  }

  async update(
    id: string | number,
    dto: UpdateProfileDto,
  ): Promise<ProfileEntity> {
    return this.prisma.profile.update({
      where: { id: String(id) },
      data: dto,
    });
  }

  async remove(id: string | number): Promise<boolean> {
    await this.prisma.profile.delete({ where: { id: String(id) } });
    return true;
  }
}
