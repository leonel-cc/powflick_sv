import {
  Controller,
  Get,
  Post,
  Param,
  Patch,
  Body,
  Query,
  UseGuards,
  Delete,
  HttpException,
  Headers,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { IGetOrders, IOrder } from './interfaces/response-order.interface';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import { GetUser } from '../auth/decorator/auth-user.decorator';
import { GetAllOrdersDto } from './dto/getAllOrders.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { IGetUser } from '../auth/interfaces/getUser.interface';
import { Rol } from 'src/users/entity/users.entity';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  //Obtener una orden por id
  @ApiOperation({ summary: 'Obtener orden' })
  @ApiResponse({
    status: 200,
    description: 'Orden obtenida',
  })
  @ApiResponse({ status: 404, description: 'Orden no encontrada' })
  @ApiResponse({ status: 500, description: 'Error del servidor' })
  @ApiParam({
    name: 'id',
    description: 'id de la orden que busco',
    type: 'string',
  })
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOneOrder(
    @GetUser() user: IGetUser,
      @Param('id') id: string,
  ): Promise<IOrder> {
    const response = await this.ordersService.findOneOrder(id, user);
    return response;
  }

  //Obtener órdenes por usuario
  @ApiOperation({
    summary: 'Obtener ordenes de un usuario',
    description: 'Es necesario estar logeado.',
  })
  @UseGuards(JwtAuthGuard)
  @Get('by/user')
  async findAlByUser(@GetUser() { userId }: IGetUser): Promise<IOrder> {
    const response = await this.ordersService.findAllByUser(userId);
    return response;
  }

  @ApiOperation({
    summary: 'Crear orden',
    description: 'Es necesario tener un producto en el carrito.',
  })
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
  @GetUser() { userId }: IGetUser,
    @Body() createOrder: CreateOrderDto,
    @Headers('Currency') currency: string,
    @Headers('CurrencyValue') currencyValue: string,
  ) {
    const response = await this.ordersService.create({
      couponId: createOrder.couponId,
      userId,
      directionId: createOrder.directionId,
    }, { name: currency, value: +currencyValue });
    return response;
  }

  /* Ajustar despues para que solo los usuarios de Rol x puedan acceder a la misma */
  @ApiOperation({
    summary: 'Obtener todas las ordenes',
    description: 'Se debe enviar por query paginado limite y orden, ademas se puede filtrar por estado.',
  })
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllOrders(
    @GetUser() { rol }: IGetUser,
      @Query() getAllOrders: GetAllOrdersDto,
  ): Promise<IGetOrders> {
    if (rol !== Rol.admin) throw new HttpException('This user is not an admin', 403);

    const response = await this.ordersService.findAll(getAllOrders);
    return response;
  }

  //Actualizar el estado de una orden
  @ApiOperation({
    summary: 'Actualizar estado de orden',
    description: 'Se envia orderId y state por body',
  })
  @UseGuards(JwtAuthGuard)
  @Patch()
  async patchUpdateStateOrder(
  @GetUser() { rol }: IGetUser,
    @Body() updateDto: UpdateOrderDto,
  ) {
    if (rol !== Rol.admin) throw new HttpException('This user is not an admin', 403);

    const response = await this.ordersService.updateStateOrder(updateDto);

    return response;
  }

  //Eliminar una orden
  @ApiOperation({
    summary: 'Eliminar una orden',
    description: 'recibe el id de la orden por parametro.',
  })
  @Delete(':id')
  async deleteOrder(@Param('id') orderId: string) {
    const response = await this.ordersService.deleteOrder(orderId);

    return response;
  }
}
