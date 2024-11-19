import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ShoppingCartService } from './shopping-cart.service';
import { GetUser } from '../auth/decorator/auth-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IGetUser } from '../auth/interfaces/getUser.interface';
import { AddProductToCartDto } from './dto/add-product.dto';
import { RemoveProductFromCartDto } from './dto/remove-product.dto';
import { BulkCustomizationsToProductCartDto } from './dto/add.bulkCustomizations.dto';

@ApiTags('Shopping cart')
@Controller('shopping-cart')
export class ShoppingCartController {
  constructor(private readonly shoppingCartService: ShoppingCartService) {}

  @ApiOperation({ summary: 'Agregar producto al carrito' })
  @UseGuards(JwtAuthGuard)
  @Post()
  async postProductoInShoppingCart(
  @GetUser() { userId }: IGetUser,
    @Body() data: AddProductToCartDto,
  ) {
    const postThisProduct = await this.shoppingCartService.postProductsInCart(
      userId,
      data.productId,
      data.customizationsId,
    );
    return postThisProduct;
  }

  @ApiOperation({ summary: 'Agregar producto con sus customizaciones al carrito' })
  @UseGuards(JwtAuthGuard)
  @Post('/bulkCustomizations')
  async postProductInShoppingCartWithBulkCustomization(
  @GetUser() { userId }: IGetUser,
    @Body() data: BulkCustomizationsToProductCartDto,
  ) {
    const postThisCustomizationsProduct = await this.shoppingCartService.postProductsInCartBulkCustomization(
      userId,
      data.productId,
      data.customizations,
    );
    return postThisCustomizationsProduct;
  }

  @ApiOperation({ summary: 'Agregar varios producto con sus customizaciones al carrito' })
  @UseGuards(JwtAuthGuard)
  @Post('/bulk')
  async postProductsInShoppingCartWithBulkCustomization(
  @GetUser() { userId }: IGetUser,
    @Body() data: BulkCustomizationsToProductCartDto[],
  ) {
    for (const each of data) {
      await this.shoppingCartService.postProductsInCartBulkCustomization(
        userId,
        each.productId,
        each.customizations,
      );
    }

    return {
      statusCode: 200,
      message: 'Productos agregados con exito!',
    };
  }

  @ApiOperation({ summary: 'Eliminar un producto del carrito' })
  @ApiResponse({
    status: 204,
    description: 'Producto eliminado exitosamente',
  })
  @ApiResponse({ status: 500, description: 'Error del servidor' })
  @ApiResponse({
    status: 404,
    description: 'No se encontró el registro de CartProduct',
  })
  @UseGuards(JwtAuthGuard)
  @Delete('/:productId')
  async remove(
  @GetUser() { userId }: IGetUser,
    @Param() params: RemoveProductFromCartDto,
  ) {
    const { productId } = params;
    const response = await this.shoppingCartService.remove(userId, productId);
    return response;
  }

  @ApiOperation({ summary: 'Obtener un carrito por id' })
  @Get(':cartId') // Cambiar el parámetro a cartId
  async getCartProducts(@Param('cartId') cartId: string) {
    // Cambiar el nombre del parámetro a cartId
    const thisShoppingCart = await this.shoppingCartService.getCartProducts(
      cartId, // Pasar el cartId como parámetro
    );
    return thisShoppingCart;
  }

  @ApiOperation({ summary: 'Obtener un carrito por token del usuario' })
  @UseGuards(JwtAuthGuard)
  @Get()
  async getCart(@GetUser() { userId }: IGetUser) {
    const cart = await this.shoppingCartService.getCart(userId);
    return cart;
  }

  @ApiOperation({ summary: 'Actualizar cantidad de un producto en el carrito' })
  @Patch(':cartProductId')
  async updateProductQuantity(
  @Param('cartProductId') cartProductId: string,
    @Body() { amount }: any,
  ) {
    const response = await this.shoppingCartService.updateProductQuantity(cartProductId, amount);
    return response;
  }
}