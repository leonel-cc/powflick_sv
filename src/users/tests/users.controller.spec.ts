import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { DatabaseTestModule } from '../../database/database.test.module';
import { UsersService } from '../users.service';
import { MailModule } from '../../mail/mail.module';
import { AuthModule } from '../../auth/auth.module';
import { CreateUserDto } from '../dto/create-user.dto';
import { createUserObject } from '../../../test/faker';
import { User } from '../entity/users.entity';
import { AuthService } from '../../auth/auth.service';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let userService: UsersService;
  let userMock: CreateUserDto;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseTestModule, MailModule, AuthModule],
      providers: [UsersService],
      controllers: [UsersController],
    }).compile();

    userMock = createUserObject();
    authService = module.get<AuthService>(AuthService);
    userService = module.get<UsersService>(UsersService);
    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create / register', () => {
    it('should create a new user', async () => {
      jest.spyOn(userService, 'verifyEmail').mockResolvedValue(true);
      jest.spyOn(userService, 'create').mockResolvedValue({ statusCode: 200, token: 'asd' });
      jest.spyOn(authService, 'generateToken').mockResolvedValueOnce('asd');

      const result = await controller.create(userMock);

      expect(result).toEqual({ statusCode: 201, token: 'asd' });

      const user = await User.findByPk(userMock.id);

      expect(user).toBeDefined();
    });

    it('should fail if email verification fails', async () => {
      jest.spyOn(userService, 'verifyEmail').mockRejectedValueOnce(new Error('Email verification failed'));

      await expect(controller.create(userMock)).rejects.toThrowError();
    });

    it('should fail if user creation fails', async () => {
      jest.spyOn(userService, 'create').mockRejectedValueOnce(new Error('User creation failed'));

      await expect(controller.create(userMock)).rejects.toThrowError();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
  });

  describe('sign in', () => {
    let userDBMock: User;

    beforeEach(async () => {
      userDBMock = await User.create(createUserObject());
    });

    it('should return a token upon sign in', async () => {
      jest.spyOn(authService, 'comparePassword');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
      jest.spyOn(authService, 'generateToken').mockResolvedValue('asd');
      jest.spyOn(userService, 'signIn').mockResolvedValueOnce({ statusCode: 200, token: 'asd' });

      const result = await controller.signIn({ email: userDBMock.email, password: userDBMock.password });

      expect(result).toEqual({ statusCode: 200, token: 'asd' });
    });

    it('should throw UnauthorizedException when password does not match', async () => {
      jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(userDBMock);
      jest.spyOn(authService, 'comparePassword').mockResolvedValue(false);

      await expect(controller.signIn({ email: userDBMock.email, password: 'incorrectPassword' })).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when email does not exist', async () => {
      jest.spyOn(userService, 'findOneByEmail').mockResolvedValue(null);

      await expect(controller.signIn({ email: 'nonexistent@example.com', password: 'password' })).rejects.toThrow(UnauthorizedException);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
  });
});
