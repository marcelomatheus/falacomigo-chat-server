import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { Prisma } from '@prisma/client';
import { UserService } from '@/user/user.service';
import { LoginUserDto } from '@/auth/dto/login-user.dto';
import { RegisterUserDto } from '@/auth/dto/register-user.dto';
import {
  IUserAndProfile,
  UserWithoutPassword,
} from '@/user/types/user-without-password.type';
import { CreateUserDto } from '@/user/dto/create-user.dto';
import { ProfileService } from '@/profile/profile.service';
import { CreateProfileDto } from '@/profile/dto/create-profile.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { ConfirmAccountService } from '@/auth/confirm-account.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private profileService: ProfileService,
    private jwtService: JwtService,
    private confirmAccountService: ConfirmAccountService,
  ) {}

  async login(loginUserDto: LoginUserDto) {
    const user = await this.validateUser(loginUserDto);

    const access_token = this.generateAccessToken(user);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        profile: user.profile,
      },
    };
  }

  private generateAccessToken(user: UserWithoutPassword) {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }

  private async validateUser(loginUserDto: LoginUserDto) {
    const user = await this.userService.findOneByEmail(loginUserDto.email);

    if (
      !user ||
      !(await bcrypt.compare(loginUserDto.password, user.password))
    ) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    if (!user.confirmEmailTimestamp) {
      try {
        await this.confirmAccountService.requestCode({ email: user.email });
      } catch {
        await Promise.resolve();
      }

      throw new UnauthorizedException(
        'Confirme sua conta antes de fazer login.',
      );
    }

    return this.userService.excludePassword(user as IUserAndProfile);
  }

  async register(registerUserDto: RegisterUserDto) {
    const { name, email, password, tokensBalance } = registerUserDto;

    const userAlredyExist = await this.userService.findOneByEmail(email);

    if (userAlredyExist) {
      throw new ConflictException('User with this email alredy exist.');
    }

    try {
      const newUserDto: CreateUserDto = {
        email,
        password,
      };

      const registerResponse = await this.prisma.$transaction(async (tx) => {
        const createdUser = await this.userService.create(newUserDto, tx);

        const newProfileDto: CreateProfileDto = {
          name,
          userId: createdUser.id,
          tokensBalance: tokensBalance || 30,
        };

        await this.profileService.create(newProfileDto, tx);

        return {
          message: 'User has been created.',
        };
      });

      try {
        await this.confirmAccountService.requestCode({ email });
      } catch {
        await Promise.resolve();
      }

      return registerResponse;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('User with this email alredy exist.');
        }
      }
      throw new InternalServerErrorException('Issue at register a new user.');
    }
  }
}
