import { Controller, Get, Post, Body, Patch, Delete, Param, UseGuards, HttpException, Query } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import {
  ApiTags,
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiParam,
} from '@nestjs/swagger';
import { Messages } from './entity/messages.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import { GetUser } from '../auth/decorator/auth-user.decorator';
import { IGetUser } from '../auth/interfaces/getUser.interface';
import { Rol } from '../users/entity/users.entity';
import { QueryMessagesDto } from './dto/query-messages.dto';

@ApiTags('Messages')
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiCreatedResponse({ description: 'El mensaje se ha creado correctamente', type: Messages })
  @ApiBadRequestResponse({ description: 'No se pudo crear el mensaje' })
  @ApiInternalServerErrorResponse({ description: 'Error interno del servidor' })
  @ApiBody({ type: CreateMessageDto })
  async create(@Body() createMessageDto: CreateMessageDto) {
    return this.messagesService.create(createMessageDto);
  }

  @Get('/category/totals')
  @UseGuards(JwtAuthGuard)
  async getCategoryTotals(
  @GetUser() { rol }: IGetUser,
  ) {
    if (rol !== Rol.admin) throw new HttpException('Este usuario no es un admin', 403);
    return this.messagesService.getCategoryTotals();
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ description: 'Todos los mensajes obtenidos correctamente', type: [Messages] })
  @ApiInternalServerErrorResponse({ description: 'Error interno del servidor' })
  async findAll(
  @GetUser() { rol }: IGetUser,
    @Query() querys: QueryMessagesDto,
  ) {
    if (rol !== Rol.admin) throw new HttpException('Este usuario no es un admin', 403);

    const { desc, filter, search, answered, limit, page, category } = querys;
    const booleanAnswered = answered === undefined ? null : answered === 'true' ? true : false;
    const order = desc === 'true' ? 'DESC' : 'ASC';

    return this.messagesService.findAll(order, Number(limit), Number(page), category, filter, search, booleanAnswered);
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Mensaje obtenido correctamente', type: Messages })
  @ApiNotFoundResponse({ description: 'Mensaje no encontrado' })
  @ApiInternalServerErrorResponse({ description: 'Error interno del servidor' })
  @ApiParam({ name: 'id', description: 'ID del mensaje' })
  async findOne(@Param('id') id: string) {
    return this.messagesService.findOne(id);
  }

  //useguards admin
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ description: 'Mensaje actualizado correctamente', type: Messages })
  @ApiBadRequestResponse({ description: 'No se pudo actualizar el mensaje' })
  @ApiNotFoundResponse({ description: 'Mensaje no encontrado' })
  @ApiInternalServerErrorResponse({ description: 'Error interno del servidor' })
  @ApiParam({ name: 'id', description: 'ID del mensaje' })
  @ApiBody({ type: UpdateMessageDto })
  async update(
  @GetUser() { rol }: IGetUser,
    @Param('id') id: string,
    @Body() updateMessageDto: UpdateMessageDto) {
    if (rol !== Rol.admin) throw new HttpException('This user is not an admin', 403);

    return this.messagesService.update(id, updateMessageDto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Mensaje eliminado correctamente' })
  @ApiNotFoundResponse({ description: 'Mensaje no encontrado' })
  @ApiInternalServerErrorResponse({ description: 'Error interno del servidor' })
  @ApiParam({ name: 'id', description: 'ID del mensaje' })
  async remove(@Param('id') id: string) {
    return this.messagesService.remove(id);
  }
}