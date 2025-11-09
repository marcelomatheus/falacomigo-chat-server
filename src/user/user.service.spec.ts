import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { User } from '@prisma/client';

import { UserService } from '@/user/user.service';
import { PrismaService } from '@/prisma/prisma.service';

import { CreateUserDto } from '@/user/dto/create-user.dto';

const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  password: 'hashed_password_from_db',
  createdAt: new Date(),
  updatedAt: new Date(),
  lastLoginTimestamp: null,
  confirmEmailTimestamp: null,
};

const mockUserWithoutPassword = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: mockUser.createdAt,
  updatedAt: mockUser.updatedAt,
  lastLoginTimestamp: null,
  confirmEmailTimestamp: null,
};

const mockPrismaService = {
  user: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

jest.mock('bcrypt');
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UserService', () => {
  let service: UserService;
  let prismaMock: typeof mockPrismaService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaMock = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('excludePassword', () => {
    it('should remove the password field from a user object', () => {
      const result = service.excludePassword(mockUser);
      expect(result).toEqual(mockUserWithoutPassword);
      expect(result).not.toHaveProperty('password');
    });
  });

  describe('findAll', () => {
    it('should return an array of users without passwords', async () => {
      prismaMock.user.findMany.mockResolvedValue([mockUser]);

      const result = await service.findAll({});

      expect(prismaMock.user.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: undefined,
            mode: 'insensitive',
          },
          email: {
            contains: undefined,
            mode: 'insensitive',
          },
        },
      });
      expect(result).toBeInstanceOf(Array);
    });
  });

  describe('findOne', () => {
    it('should find a user by ID and return it without password', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne('1');

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockUserWithoutPassword);
    });

    it('should throw NotFoundException if user is not found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existing-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOneByEmail', () => {
    it('should find a user by email and return it without password', async () => {
      prismaMock.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOneByEmail('test@example.com');

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });

      expect(result).toEqual(mockUser);
    });
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      email: 'new@example.com',
      name: 'New User',
      password: 'raw_password123',
    };
    const hashedPassword = 'hashed_new_password';

    beforeEach(() => {
      (mockBcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      prismaMock.user.create.mockResolvedValue({
        ...mockUser,
        ...createUserDto,
        password: hashedPassword,
      });
    });

    it('should hash the password and create a new user', async () => {
      const result = await service.create(createUserDto);

      expect(mockBcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);

      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          ...createUserDto,
          password: hashedPassword,
        },
      });

      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe(createUserDto.email);
    });

    it('should throw ConflictException on duplicate email (P2002)', async () => {
      const error = new PrismaClientKnownRequestError('Duplicate email', {
        code: 'P2002',
        clientVersion: 'x.x.x',
      });
      prismaMock.user.create.mockRejectedValue(error);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw InternalServerErrorException on other errors', async () => {
      prismaMock.user.create.mockRejectedValue(new Error('Some DB error'));

      await expect(service.create(createUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update', () => {
    const dataToUpdate = {
      email: 'teste-2@example.com',
      password: 'new-password',
    };
    const password = dataToUpdate.password;
    const hashedPassword = 'new-hashed-password';

    beforeEach(() => {
      (mockBcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      prismaMock.user.update.mockResolvedValue({
        ...mockUser,
        ...dataToUpdate,
        password: hashedPassword,
      });
    });

    it('should update a user and return it without password', async () => {
      const { password: _password, ...restToUpdate } = dataToUpdate;

      const result = await service.update('1', dataToUpdate);

      expect(mockBcrypt.hash).toHaveBeenCalledWith(password, 10);

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          ...restToUpdate,
          password: hashedPassword,
        },
      });

      expect(result).toEqual({
        ...mockUserWithoutPassword,
        ...restToUpdate,
      });
      expect(result).not.toHaveProperty('password');
    });

    it('should throw NotFoundException if user to update does not exist (P2025)', async () => {
      const error = new PrismaClientKnownRequestError(
        'User with ID 1 not found.',
        {
          code: 'P2025',
          clientVersion: 'x.x.x',
        },
      );
      prismaMock.user.update.mockRejectedValue(error);

      await expect(service.update('1', dataToUpdate)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException on other errors', async () => {
      prismaMock.user.update.mockRejectedValue(new Error('Some DB error'));

      await expect(service.update('1', dataToUpdate)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('remove', () => {
    it('should delete a user and return a success message', async () => {
      prismaMock.user.delete.mockResolvedValue(mockUser);

      const result = await service.remove('1');

      expect(prismaMock.user.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual({
        message: `User with ID '1' successfully deleted.`,
      });
    });

    it('should throw NotFoundException if user to delete is not found', async () => {
      prismaMock.user.delete.mockRejectedValue(new Error('Record not found'));

      await expect(service.remove('non-existing-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
