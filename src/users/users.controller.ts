import { Body, Controller, Delete, Get, HttpCode, HttpException, InternalServerErrorException, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ICreateUser } from './interfaces/user.interfaces';
import { LoginUserDto } from './dto/login-user.dto';
import { GetUser } from '../auth/decorator/auth-user.decorator';
import { IGetUser } from '../auth/interfaces/getUser.interface';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import { Rol } from './entity/users.entity';
import { QueryUsersDto } from './dto/query-user.dto';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { RolesGuard } from 'src/auth/guards/rolesGuard';
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({
    summary: 'Ruta para crear la cuenta de un nuevo usuario.',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description:
        'Si todo sale bien, se devolverá un objeto con un statusCode 201 y el token de verificación de usuario.',
  })
  @ApiResponse({
    status: 409,
    description:
          'Si el usuario se encuentra registrado, se le solicita que inicie sesión (en una versión posterior seguramente se redireccionara a la ruta de login en el front)',
  })
  @ApiResponse({
    status: 500,
    description: 'Erron interno del servidor, intente mas tarde',
  })
  @Post('register')
  @HttpCode(201)
  async create(@Body() createUserDto: CreateUserDto): Promise<ICreateUser> {
    try {
      // Verificar el correo electrónico del usuario
      await this.usersService.verifyEmail(createUserDto.email);

      // Si la verificación es exitosa, crear un nuevo usuario
      const newUser = await this.usersService.create(createUserDto);
      return newUser;
    } catch (error) {
      // Manejar cualquier error que ocurra durante la verificación del correo electrónico o la creación del usuario
      throw new InternalServerErrorException(error.message);
    }
  }

  @ApiOperation({
    summary: 'Ruta para inicio de sesión de usuarios.',
  })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({
    status: 201,
    description:
      'Si todo sale bien, se devolverá un objeto con un statusCode 200 y el token de verificación de usuario.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Indica que hubo un error con los datos enviados o estos no se encontraron',
  })
  @ApiResponse({
    status: 401,
    description:
      'Si el usuario ingresa una password o correo invalidos, se le solicita que verifique sus datos.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  @Post('login')
  @HttpCode(200)
  async signIn(@Body() loginUserDto: LoginUserDto): Promise<ICreateUser> {
    const response = await this.usersService.signIn(loginUserDto);
    return response;
  }

  @ApiOperation({
    summary: 'Ruta para actualizacion de datos del usuario.',
  })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 201,
    description:
      'Si todo sale bien, se devolverá un mensaje con un statusCode 204, indicando que todo estuvo bien, pero sin devolver contenido.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Indica que hubo un error con el id enviado, debido a que, no pertenece a ningun usuario.',
  })
  @ApiResponse({
    status: 500,
    description: 'Error interno del servidor.',
  })
  @ApiParam({
    name: 'id',
    description: 'id del usuario a modificar',
    type: 'string',
  })
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
  @GetUser() user: IGetUser,
    @Body() updateUserDto: UpdateUserDto,
    @Param('id') userId: string,
  ) {
    try {
      // if (updateUserDto.email) {
      //   await this.usersService.verifyEmail(updateUserDto.email);
      // }
      const response = await this.usersService.update(user.rol === Rol.admin && userId !== 'update' ? userId : user.userId, updateUserDto);

      return response;
    } catch (error) {
      // Manejar cualquier error que ocurra durante la verificación del correo electrónico o la creación del usuario
      throw new InternalServerErrorException(error.message);
    }
  }

  @ApiOperation({
    summary:
      'Ruta para ver todos los usuarios (se debe enviar "page" y "limit" por query).',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.admin)
  @Get()
  getUsers(
  @Query() querys: QueryUsersDto,
  ) {
    const { limit, page, desc, isActive, role, filter, search } = querys;
    const order = desc === 'true' ? 'DESC' : 'ASC';

    return this.usersService.getAll(+page, +limit, order, isActive, role, filter, search);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getUsersProfile(@GetUser() { userId }: IGetUser) {
    const thisUser = await this.usersService.findProfileUser(userId);
    return thisUser;
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Ruta para eliminar un usuario.',
  })
  @Delete(':id')
  deleteUser(
  @GetUser() user: IGetUser,
    @Param('id') userId: string,
  ) {
    return this.usersService.deleteUser(user.rol === Rol.admin ? userId : user.userId);
  }
}
