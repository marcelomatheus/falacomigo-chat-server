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
import { UserWithoutPassword } from '@/user/types/user-without-password.type';
import { CreateUserDto } from '@/user/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async login(loginUserDto: LoginUserDto) {
    const user = await this.validateUser(loginUserDto);

    const access_token = this.generateAccessToken(user);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
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
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.userService.excludePassword(user);
  }

  async register(registerUserDto: RegisterUserDto) {
    const { email, password } = registerUserDto;

    const userAlredyExist = await this.userService.findOneByEmail(email);

    if (userAlredyExist) {
      throw new ConflictException('User with this email alredy exist.');
    }

    const newUserDto: CreateUserDto = {
      email,
      password,
    };

    try {
      const createdUser = await this.userService.create(newUserDto);

      const access_token = this.generateAccessToken(createdUser);

      return {
        access_token,
        user: {
          id: createdUser.id,
          email: createdUser.email,
        },
      };
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
