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
import { QueryMessagesDto } from './dto/query-messages.dto';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { RolesGuard } from 'src/auth/guards/rolesGuard';
import { Rol } from 'src/users/entity/users.entity';
import { Conversation } from './entity/conversationMessage';
import { GetUser } from 'src/auth/decorator/auth-user.decorator';
import { IGetUser } from 'src/auth/interfaces/getUser.interface';

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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.admin)
  async getCategoryTotals(
  ) {
    return this.messagesService.getCategoryTotals();
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.admin)
  @ApiOkResponse({ description: 'Todos los mensajes obtenidos correctamente', type: [Messages] })
  @ApiInternalServerErrorResponse({ description: 'Error interno del servidor' })
  async findAll(
  @Query() querys: QueryMessagesDto,
  ) {
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.admin)
  @ApiOkResponse({ description: 'Mensaje actualizado correctamente', type: Messages })
  @ApiBadRequestResponse({ description: 'No se pudo actualizar el mensaje' })
  @ApiNotFoundResponse({ description: 'Mensaje no encontrado' })
  @ApiInternalServerErrorResponse({ description: 'Error interno del servidor' })
  @ApiParam({ name: 'id', description: 'ID del mensaje' })
  @ApiBody({ type: UpdateMessageDto })
  async update(
  @Param('id') id: string,
    @Body() updateMessageDto: UpdateMessageDto) {

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

  // Agregar una conversación a un mensaje
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post(':id/conversations')
  async addConversation(
    @GetUser() user: IGetUser,
      @Param('id') id: string,
      @Body() data: Partial<Conversation>,
  ): Promise<Conversation> {
    return this.messagesService.addConversation(id, data, user);
  }
}