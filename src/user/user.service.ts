import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

import { PrismaService } from '@/prisma/prisma.service';
import { CreateUserDto } from '@/user/dto/create-user.dto';
import { UpdateUserDto } from '@/user/dto/update-user.dto';
import { FilterUserDto } from '@/user/dto/filter-user.dto';
import { UserWithoutPassword } from '@/user/types/user-without-password.type';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  excludePassword(user: User): UserWithoutPassword {
    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async create(createUserDto: CreateUserDto) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      saltRounds,
    );

    try {
      const user = await this.prisma.user.create({
        data: {
          ...createUserDto,
          password: hashedPassword,
        },
      });

      return this.excludePassword(user);
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('A user with this email already exists.');
      }
      throw new InternalServerErrorException('Failed to create user.');
    }
  }

  async findAll(filters: FilterUserDto) {
    const users = await this.prisma.user.findMany({
      where: {
        email: {
          contains: filters.email,
          mode: 'insensitive',
        },
      },
    });
    return users.map((user) => this.excludePassword(user));
  }

  async findOneByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user;
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID '${id}' not found.`);
    }

    return this.excludePassword(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      const saltRounds = 10;
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        saltRounds,
      );
    }

    try {
      const user = await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });
      return this.excludePassword(user);
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException(`User with ID '${id}' not found.`);
      }
      throw new InternalServerErrorException('Failed to update user.');
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
      return { message: `User with ID '${id}' successfully deleted.` };
    } catch (_error) {
      throw new NotFoundException(`User with ID '${id}' not found.`);
    }
  }
}
