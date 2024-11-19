import { Body, Controller, Delete, Get, HttpException, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { QueryProductsDto } from './dto/query-products.dto';
import { UpdateMostSoldBodyDto } from './dto/update-mostsold.dto';
import { UpdateDiscountBodyDto } from './dto/update-dIscount.dto copy';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import { GetUser } from '../auth/decorator/auth-user.decorator';
import { IGetUser } from '../auth/interfaces/getUser.interface';
import { CreateCustomizationDto } from './dto/create-customization.dto';
import { Response } from './interface/serviceInterfaces';
import { UpdateProductDto } from './dto/update-products.dto';
import { Rol } from '../users/entity/users.entity';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { RolesGuard } from 'src/auth/guards/rolesGuard';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ApiOperation({
    summary: 'Obtener todos los productos (se debe enviar "page" y "limit" por query).',
  })
  @ApiResponse({
    status: 200,
    description:
      'En caso de no haber error, la respuesta de la misma será un objeto con informacion del paginado y los productos solicitados, ademas de traer un conteo de sus atributos',
  })
  @Get()
  allProducts(
  @Query() querys: QueryProductsDto,
  ) {
    return this.productsService.allProducts(querys);
  }

  @ApiOperation({
    summary: 'Obtener todos los productos (se debe enviar "page" y "limit" por query).',
  })
  @ApiResponse({
    status: 200,
    description:
      'En caso de no haber error, la respuesta de la misma será un objeto con informacion del paginado y los productos solicitados, ademas de traer un conteo de sus atributos',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.admin)
  @Get('/admin')
  allProductsAdmin(
  @Query() querys: QueryProductsDto,
  ) {

    return this.productsService.allProducts(querys, true);
  }

  @ApiOperation({
    summary: 'Obtener un solo producto mediante id pasado por parametro',
  })
  @Get(':id')
  oneProduct(
  @Param('id') id: string,
  ) {
    return this.productsService.oneProduct(id);
  }

  @ApiOperation({ summary: 'Modificar un producto' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({
    status: 200,
    description: 'El producto ha sido modificado exitosamente',
  })
  @ApiResponse({ status: 400, description: 'Solicitud inválida' })
  @ApiResponse({ status: 500, description: 'Error interno del servidor' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.admin)
  @Patch(':id')
  async update(
    @Body() updateProductDto: UpdateProductDto,
      @Param('id') productId: string,
  ): Promise<any> {

    return this.productsService.update(productId, updateProductDto);
  }

  @ApiOperation({
    summary: 'Insertar descuento en productos seleccionados.',
  })
  @ApiBody({ type: UpdateDiscountBodyDto })
  @Post('discount')
  setDiscountProducts(
  @Body() body: UpdateDiscountBodyDto,
  ) {
    const { productsIds, discount } = body;
    return this.productsService.setDiscount(productsIds, discount);
  }

  @ApiOperation({
    summary: 'Destacar productos seleccionados como mas vendidos.',
  })
  @ApiBody({ type: UpdateMostSoldBodyDto })
  @Post('mostSold')
  setMostSoldProducts(
  @Body() body: UpdateMostSoldBodyDto,
  ) {
    const { productsIds } = body;
    return this.productsService.setMostSold(productsIds);
  }

  @ApiOperation({
    summary: 'Generar customizacion personalizada de un producto',
  })
  @UseGuards(JwtAuthGuard)
  @Post('customization/:productId')
  setCustomization(
    @GetUser() { userId }: IGetUser,
      @Param('productId') productId: string,
      @Body() customization: CreateCustomizationDto,
  ): Promise<Response> {
    return this.productsService.setCustomization(userId, productId, customization);
  }

  @ApiOperation({
    summary: 'Cargar varias customizaciones de un producto',
  })
  @UseGuards(JwtAuthGuard)
  @Post('customization/bulk/:productId')
  setBulkCustomizations(
    @GetUser() { userId }: IGetUser,
      @Param('productId') productId: string,
      @Body() customization: CreateCustomizationDto[],
  ): Promise<Response> {
    return this.productsService.setBulkCustomizations(userId, productId, customization);
  }


  @ApiOperation({
    summary: 'Actualizar customizacion personalizada de un producto',
  })
  @UseGuards(JwtAuthGuard)
  @Patch('customization/:customizationId')
  updateCustomization(
    @Param('customizationId') customizationId: string,
      @Body() customization: CreateCustomizationDto,
  ): Promise<Response> {
    return this.productsService.updateCustomization(customizationId, customization);
  }

  @ApiOperation({
    summary: 'Eliminar una customizacion de un producto.',
  })
  @Delete('customization/:id')
  deleteCustomization(
    @Param('id') id: string,
  ): Promise<Response> {
    return this.productsService.deleteCustomization(id);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'agregar un producto a favoritos o eliminarlo' })
  @ApiResponse({
    status: 201,
    description: 'Producto agregado a favoritos',
  })
  @ApiParam({
    name: 'id',
    description: 'id del producto a agregar',
    type: 'string',
  })
  @Post('/fav/:productId')
  async favProduct(
  @GetUser() { userId }: any,
    @Param('productId') productId: string,
    @Body() { firstCall }: { firstCall: boolean },
  ) {
    const response = await this.productsService.favOrUnfavProduct(userId, productId, firstCall);
    return response;
  }

  @UseGuards(JwtAuthGuard)
  @Get('fav/all')
  async getProductsFav(
  @GetUser() { userId }: any,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    const response = await this.productsService.getProductsFav(userId, { limit, page });
    return response;
  }

  @Get('all/titles')
  async getAllProductsTitlesFav(
  @Query('search') search: string,
  ) {
    const response = await this.productsService.getAllProductsTitles(search, true);
    return response;
  }

  @Get('all/productsName')
  async getAllProductsTitles(
  ) {
    const response = await this.productsService.getAllProductsTitles('', false);
    return response;
  }

  @Get('all/productsIds')
  async getAllProductsIds(
  ) {
    const response = await this.productsService.getAllProductsIds();
    return response;
  }
}