import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { AuthService } from '../../auth/auth.service';
import { MailService } from '../../mail/mail.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { createUserObject } from '../../../test/faker';
import { MailModule } from '../../mail/mail.module';
import { JwtService } from '@nestjs/jwt';
import { DatabaseTestModule } from '../../database/database.test.module';
import { User } from '../entity/users.entity';
import { ConflictException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let userMock: CreateUserDto;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseTestModule, MailModule],
      providers: [UsersService, MailService, AuthService, JwtService],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userMock = createUserObject();
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create User', () => {
    it('should create a user and send email', async () => {
      jest.spyOn(authService, 'generatePassword').mockResolvedValue('asd');
      jest.spyOn(authService, 'generateToken').mockResolvedValue('token');

      const result = await service.create(userMock);

      expect(authService.generateToken).toBeCalled();
      expect(result).toEqual({ statusCode: 201, token: 'token' });

      const user = await User.findByPk(userMock.id);

      expect(user).toBeDefined();
    });

    it('should throw InternalServerErrorException if password generation fails', async () => {
      // Mock de generatePassword que falla
      jest.spyOn(authService, 'generatePassword').mockRejectedValue(new Error('Password generation failed'));
      jest.spyOn(authService, 'generateToken');

      // Llamada al método create
      await expect(service.create(userMock)).rejects.toThrowError(InternalServerErrorException);

      // Verifica que generateToken no haya sido llamado
      expect(authService.generateToken).not.toBeCalled();

      // Verifica que el usuario no haya sido creado
      const user = await User.findByPk(userMock.id);
      expect(user).toBeNull(); // o expect(user).toBeUndefined();
    });

  });

  describe('verifyEmail', () => {
    it('should return true if no user found with the provided email', async () => {
      // Arrange
      jest.spyOn(User, 'findOne').mockResolvedValue(null);

      // Act
      const result = await service.verifyEmail('test@example.com');

      // Assert
      expect(result).toBe(true);
      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
    });

    it('should throw ConflictException if user found with the provided email', async () => {
      // Arrange
      const userDBMock = await User.create(createUserObject());

      jest.spyOn(User, 'findOne').mockResolvedValue(userDBMock);

      // Act & Assert
      await expect(service.verifyEmail(userDBMock.email)).rejects.toThrowError(ConflictException);
      expect(User.findOne).toHaveBeenCalledWith({ where: { email: userDBMock.email } });
    });

    it('should throw InternalServerErrorException if an internal error occurs', async () => {
      // Arrange
      jest.spyOn(User, 'findOne').mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.verifyEmail('test@example.com')).rejects.toThrowError(InternalServerErrorException);
      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });
  });

  describe('signIn', () => {
    let userDBMock: User;

    beforeEach(async () => {
      userDBMock = await User.create(createUserObject());
    });

    it('should sign in successfully and return token', async () => {
      // Arrange
      const loginUserDto = { email: 'test@example.com', password: 'password123' };
      const checkUser = { id: userDBMock.id, email: userDBMock.email, password: userDBMock.password, rol: 'user' };
      const token = 'generatedToken';

      jest.spyOn(authService, 'comparePassword').mockResolvedValue(true);
      jest.spyOn(authService, 'generateToken').mockResolvedValue(token);
      jest.spyOn(service, 'findOneByEmail').mockResolvedValue(userDBMock);

      // Act
      const result = await service.signIn(loginUserDto);

      // Assert
      expect(result).toEqual({ statusCode: 200, token });
      expect(authService.generateToken).toHaveBeenCalledWith(checkUser.id, checkUser.email, checkUser.rol);
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      // Arrange
      const loginUserDto = { email: 'test@example.com', password: 'wrongPassword' };

      jest.spyOn(authService, 'comparePassword').mockResolvedValue(false);
      jest.spyOn(service, 'findOneByEmail').mockResolvedValue(userDBMock);

      // Act & Assert
      await expect(service.signIn(loginUserDto)).rejects.toThrowError(UnauthorizedException);
    });

    it('should throw InternalServerErrorException if an internal error occurs', async () => {
      // Arrange
      const loginUserDto = { email: 'test@example.com', password: 'password123' };

      jest.spyOn(service, 'findOneByEmail').mockRejectedValue(new Error('Database error'));

      // Act & Assert
      await expect(service.signIn(loginUserDto)).rejects.toThrowError(InternalServerErrorException);
    });
  });
});
