import { BadRequestException, HttpException, Inject, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Rol } from '../users/entity/users.entity';
import * as jwt from 'jsonwebtoken';
import { RecoverPasswordDto } from './dto/recover-password.dto';
import { CLIENT_URL, JWT_SECRET } from '../config/enviroments';
import { UsersService } from '../users/users.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
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

  async recoverPassword(recoverPassword: RecoverPasswordDto): Promise<{ message: string }> {
    try {
      const { email } = recoverPassword;

      // Buscar usuario por email
      const user = await this.usersService.findOneByEmail(email);

      // Generar token de recuperación
      const token = jwt.sign({ sub: user.email }, JWT_SECRET, {
        expiresIn: '48h',
      });

      // Configurar datos del correo
      const context = {
        name: user.firstName,
        link: `${CLIENT_URL}/recoverPassword?token=${token}`,
      };
      const mailData = {
        EmailAddress: user.email,
        subject: Cases.RESET_PASSWORD,
        context,
      };

      // Enviar correo
      await this.mailsService.sendMails(mailData);

      return { message: 'Password recovery email sent successfully' };
    } catch (error) {
      // Lanza errores específicos si ya fueron detectados
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      }

      // Lanza error genérico para otros casos
      throw new InternalServerErrorException(
        'Failed to send password recovery email. Please try again later.',
      );
    }
  }


  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
    token: string,
  ): Promise<{ status: number; message: string }> {
    try {
      if (!token) {
        throw new UnauthorizedException('Token is required to reset the password.');
      }

      // Verificar token
      const payload: any = jwt.verify(token, JWT_SECRET);
      const userEmail = payload.sub.toString();
      const { password } = resetPasswordDto;

      // Buscar usuario por email
      const user = await this.usersService.findOneByEmail(userEmail);
      if (!user) {
        throw new NotFoundException('User not found.');
      }

      // Cambiar contraseña
      user.password = await this.generatePassword(password);
      await user.save();

      return {
        status: 200,
        message: 'Password reset successfully.',
      };
    } catch (error) {
      // Manejar errores específicos
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) {
        throw error;
      }
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Invalid or expired token.');
      }

      // Manejo de errores genéricos
      throw new InternalServerErrorException('An error occurred while resetting the password.');
    }
  }


  async changePassword(
    changePasswordDto: ChangePasswordDto,
    user: IGetUser,
  ): Promise<{ status: number; message: string }> {
    const { oldPassword, newPassword } = changePasswordDto;
    const { userEmail } = user;

    try {
      // Buscar al usuario por email
      const userFind = await this.usersService.findOneByEmail(userEmail);
      if (!userFind) {
        throw new NotFoundException('User not found.');
      }

      // Validar la contraseña actual
      const isPasswordValid = await this.comparePassword(oldPassword, userFind.password);
      if (!isPasswordValid) {
        throw new BadRequestException(
          'The current password received does not correspond to the one saved in the application',
        );
      }

      // Generar y guardar la nueva contraseña
      userFind.password = await this.generatePassword(newPassword);
      await userFind.save();

      return {
        status: 204,
        message: 'Password change was successful.',
      };
    } catch (error) {
      // Manejo de errores específicos
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      // Manejo de errores genéricos
      throw new InternalServerErrorException('Internal server error while changing password');
    }
  }

}
