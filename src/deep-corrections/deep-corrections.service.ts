import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';
import { DeepCorrectionsEntity } from './entities/deep-corrections.entity';
import { DeepCorrectionsQueryBuilder } from './auxiliary-methods/deep-corrections-query.builder';
import { FilterDeepCorrectionsDto } from './dto/filter-message.dto';
import { UpdateDeepCorrectionsDto } from './dto/update-deep-corrections.dto';
import { CreateDeepCorrectionsDto } from './dto/create-deep-corrections.dto';

@Injectable()
export class DeepCorrectionsService {
  constructor(private readonly prisma: PrismaService) {}

  async createMany(
    dtos: CreateDeepCorrectionsDto[],
  ): Promise<{ count: number }> {
    return this.prisma.deepCorrections.createMany({
      data: dtos,
    });
  }

  async findAll(
    filters: FilterDeepCorrectionsDto,
  ): Promise<{ data: DeepCorrectionsEntity[]; count: number }> {
    const {
      messageId,
      profileId,
      page = 1,
      limit = 20,
      orderBy = 'createdAt',
      orderDirection = 'desc',
      ...rest
    } = filters ?? {};

    const qb = new DeepCorrectionsQueryBuilder();
    const where = qb.buildWhere({ messageId, profileId, ...rest });

    const [data, count] = await Promise.all([
      this.prisma.deepCorrections.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [orderBy]: orderDirection },
      }),

      this.prisma.deepCorrections.count({ where }),
    ]);

    return { data, count };
  }

  async findOne(
    id: string,
  ): Promise<{ data: DeepCorrectionsEntity; count: number }> {
    const deepCorrection = await this.prisma.deepCorrections.findUnique({
      where: { id },
    });

    if (!deepCorrection)
      throw new NotFoundException('Deep correction not found');

    return {
      data: deepCorrection,
      count: 1,
    };
  }

  async update(
    id: string,
    dto: UpdateDeepCorrectionsDto,
  ): Promise<DeepCorrectionsEntity> {
    return this.prisma.deepCorrections.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string): Promise<boolean> {
    await this.prisma.deepCorrections.delete({ where: { id } });
    return true;
  }
}
