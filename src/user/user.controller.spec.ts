import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from '@/user/user.service';
import { CreateUserDto } from '@/user/dto/create-user.dto';
import { UpdateUserDto } from '@/user/dto/update-user.dto';
import { FilterUserDto } from '@/user/dto/filter-user.dto';

const mockCreateUserDto: CreateUserDto = {
  email: 'test@example.com',
  name: 'Test User',
  password: 'password123',
};

const mockUpdateUserDto: UpdateUserDto = {
  name: 'Updated Name',
};

const mockUserResponse = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  createdAt: new Date(),
  updatedAt: new Date(),
  lastLoginTimestamp: null,
  confirmEmailTimestamp: null,
};

const mockUserService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('UserController', () => {
  let controller: UserController;
  let service: typeof mockUserService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call userService.create with the correct data', async () => {
      service.create.mockResolvedValue(mockUserResponse);

      const result = await controller.create(mockCreateUserDto);

      expect(service.create).toHaveBeenCalledWith(mockCreateUserDto);
      expect(result).toEqual(mockUserResponse);
    });
  });

  describe('findAll', () => {
    it('should call userService.findAll with the correct filters', async () => {
      const filters: FilterUserDto = { name: 'Test' };
      const expectedResult = [mockUserResponse];
      service.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(filters);

      expect(service.findAll).toHaveBeenCalledWith(filters);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should call userService.findOne with the correct id', async () => {
      const id = '1';
      service.findOne.mockResolvedValue(mockUserResponse);

      const result = await controller.findOne(id);

      expect(service.findOne).toHaveBeenCalledWith(id);

      expect(result).toEqual(mockUserResponse);
    });
  });

  describe('update', () => {
    it('should call userService.update with the correct id and data', async () => {
      const id = '1';
      const updatedUser = { ...mockUserResponse, ...mockUpdateUserDto };
      service.update.mockResolvedValue(updatedUser);

      const result = await controller.update(id, mockUpdateUserDto);

      expect(service.update).toHaveBeenCalledWith(id, mockUpdateUserDto);

      expect(result).toEqual(updatedUser);
    });
  });

  describe('remove', () => {
    it('should call userService.remove with the correct id', async () => {
      const id = '1';

      const serviceResponse = {
        message: `User with ID '1' successfully deleted.`,
      };
      service.remove.mockResolvedValue(serviceResponse);

      const result = await controller.remove(id);

      expect(service.remove).toHaveBeenCalledWith(id);

      expect(result).toEqual(serviceResponse);
    });
  });
});
