import { BadRequestException, HttpException, Inject, Injectable, InternalServerErrorException, UnauthorizedException, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Rol } from '../users/entity/users.entity';
import * as jwt from 'jsonwebtoken';
import { RecoverPasswordDto } from './dto/recover-password.dto';
import { CLIENT_URL, JWT_SECRET } from '../config/enviroments';
import { UsersService } from '../users/users.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Response } from '../products/interface/serviceInterfaces';
import { ChangePasswordDto } from './dto/change-password.dto';
import { IGetUser } from './interfaces/getUser.interface';
import { Cases } from '../mail/dto/sendMail.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly mailsService: MailService,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
  ) { }

  async generatePassword(password: string): Promise<string> {
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      return hashedPassword;
    } catch (error) {
      throw new HttpException(error.message, 500);
    }
  }

  async generateToken(
    userId: string,
    userEmail: string,
    rol: Rol,
  ): Promise<string> {
    const token = await this.jwtService.signAsync({
      userId: userId,
      userEmail: userEmail,
      rol: rol,
    });
    return token;
  }

  async validateToken(token: string) {
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      return { isValid: true, payload }; // Retornar un objeto indicando que el token es válido y el payload
    } catch (error) {
      return { isValid: false, error }; // Retornar un objeto indicando que el token no es válido y el error
    }
  }

  // Método para obtener la fecha de expiración del token
  getTokenExpirationDate(token: string): Date {
    const decoded = this.jwtService.decode(token) as { exp: number } | null;
    if (!decoded || !decoded.exp) {
      throw new Error('Invalid token');
    }
    return new Date(decoded.exp * 1000); // Convertir el timestamp de expiración a una fecha
  }

  async comparePassword(
    receivePassword: string,
    savedPassword: string,
  ): Promise<boolean> {
    const checkPassword = await bcrypt.compare(receivePassword, savedPassword);
    return checkPassword;
  }

  async recoverPassword(
    recoverPassword: RecoverPasswordDto,
  ) {
    try {
      const { email } = recoverPassword;
      const user = await this.usersService.findOneByEmail(email);
      const token = jwt.sign({ sub: user.email }, JWT_SECRET, {
        expiresIn: '30m',
      });

      //Setting up for email sending
      const context = {
        name: user.firstName,
        link: `${CLIENT_URL}/login/recoverPassword?token=${token}`,
      };
      const mailData = {
        EmailAddress: user.email,
        subject: Cases.RESET_PASSWORD,
        context: context,
      };
      await this.mailsService.sendMails(mailData);

      // return mail;
    } catch (error) {
      switch (error.constructor) {
        case BadRequestException:
          throw new BadRequestException(error.message);
        case UnauthorizedException:
          throw new UnauthorizedException(error.message);
        default:
          throw new InternalServerErrorException('Internal server error');
      }
    }
  }

  async resetPassword(
    resetPassword: ResetPasswordDto,
    token: string,
  ): Promise<Response> {
    try {
      if (token) {
        const payload = jwt.verify(token, JWT_SECRET);
        if (payload) {
          const { sub } = payload;
          const userEmail = sub.toString();
          const { password } = resetPassword;

          const userChangePassword = await this.usersService.findOneByEmail(
            userEmail,
          );
          userChangePassword.password = await this.generatePassword(password);
          userChangePassword.save();
          return {
            status: 200,
            message: 'Password change was successful.',
          };
        } else {
          throw new UnauthorizedException(
            'You are not authorized for this action',
          );
        }
      } else {
        throw new UnauthorizedException(
          'Missing data to complete this action',
        );
      }
    } catch (error) {
      switch (error.constructor) {
        case BadRequestException:
          throw new BadRequestException(error.message);
        case UnauthorizedException:
          throw new UnauthorizedException(error.message);
        default:
          throw new InternalServerErrorException('Internal server errror');
      }
    }
  }

  async changePassword(
    changePassword: ChangePasswordDto,
    user: IGetUser,
  ): Promise<Response> {
    try {
      const { oldPassword, newPassword } = changePassword;
      const { userEmail } = user;

      const userFind = await this.usersService.findOneByEmail(userEmail);

      const validatePassword = await this.comparePassword(
        oldPassword,
        userFind.password,
      );

      if (validatePassword) {
        userFind.password = await this.generatePassword(newPassword);
        userFind.save();
        return {
          status: 204,
          message: 'Password change was successful.',
        };
      } else {
        throw new BadRequestException(
          'The current password received does not correspond to the one saved in the application',
        );
      }
    } catch (error) {
      switch (error.constructor) {
        case BadRequestException:
          throw new BadRequestException(error.message);
        case UnauthorizedException:
          throw new UnauthorizedException(error.message);
        default:
          throw new InternalServerErrorException('Error interno del servidor');
      }
    }
  }
}
