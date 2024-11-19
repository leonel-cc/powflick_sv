import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { DirectionsService } from './directions.service';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { CreateDirectionDto } from './dto/create-direetion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import { IGetUser } from '../auth/interfaces/getUser.interface';
import { GetUser } from '../auth/decorator/auth-user.decorator';
import { IResDirection } from './interfaces/direction.interface';
import { UpdateDirectionDto } from './dto/update-direetion.dto';
import { Response } from '../products/interface/serviceInterfaces';

@ApiTags('Directions')
@Controller('directions')
export class DirectionsController {
  constructor(private readonly directionsService: DirectionsService) {}

  @ApiOperation({ summary: 'Crear una nueva dirección' })
  @ApiBody({ type: CreateDirectionDto })
  @ApiResponse({
    status: 201,
    description: 'La dirección ha sido creada exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Solicitud inválida' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @GetUser() { userId }: IGetUser,
      @Body() createDirectionDto: CreateDirectionDto,
  ): Promise<IResDirection> {
    const response = await this.directionsService.create(
      createDirectionDto,
      userId,
    );
    return response;
  }

  @ApiOperation({ summary: 'Obtener direcciones' })
  @ApiResponse({
    status: 200,
    description: 'Direcciones obtenidas',
  })
  @ApiResponse({ status: 404, description: 'Direcciones no encontradas' })
  @ApiResponse({ status: 500, description: 'Error del servidor' })
  @ApiParam({
    name: 'id',
    description: 'id del usuario del que obtengo las direcciones',
    type: 'string',
  })
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@GetUser() { userId }: IGetUser): Promise<IResDirection> {
    const response = await this.directionsService.findAll(userId);
    return response;
  }

  @ApiOperation({ summary: 'Modificar una direccion' })
  @ApiBody({ type: UpdateDirectionDto })
  @ApiResponse({
    status: 200,
    description: 'La dirección ha sido modificada exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Solicitud inválida' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  @UseGuards(JwtAuthGuard)
  @Patch()
  async update(
    @GetUser() { userId }: IGetUser,
      @Body() updateDirectionDto: UpdateDirectionDto,
  ): Promise<IResDirection> {
    const response = await this.directionsService.update(
      updateDirectionDto,
      userId,
    );
    return response;
  }

  @ApiOperation({ summary: 'Eliminar una direccion' })
  @ApiResponse({
    status: 204,
    description: 'Direccion eliminada exitosamente',
  })
  @ApiResponse({ status: 404, description: 'Direccion no encontrada' })
  @ApiResponse({ status: 500, description: 'Error del servidor' })
  @ApiParam({
    name: 'id',
    description: 'id de la dirección a eliminar',
    type: 'string',
  })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(
    @GetUser() { userId }: IGetUser,
      @Param('id') id: string,
  ): Promise<Response> {
    const response = await this.directionsService.remove(id, userId);
    return response;
  }
}
