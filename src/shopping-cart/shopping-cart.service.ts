import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { Product, StateProduct } from '../products/entity/products.entity';
import { CartProduct } from './entity/cart-product.entity';
import { ShoppingCart } from './entity/shopping-cart.entity';
import { Transaction } from 'sequelize';
import { ProductsService } from '../products/products.service';
import { Customization } from '../products/entity/customization.entity';
import { User } from '../users/entity/users.entity';
import { CreateCustomizationDto } from '../products/dto/create-customization.dto';

@Injectable()
export class ShoppingCartService {
  constructor(
    private readonly productsService: ProductsService,
  ) { }

  async postProductsInCart(
    userId: string,
    productId: string,
    customizationsId: string[],
  ): Promise<{ statusCode: number; message: string }> {
    try {
      const user: User = await User.findByPk(userId, {
        include: {
          model: ShoppingCart,
        },
      });
      const thisProduct: boolean = await this.getThisProduct(productId);

      const cartId = user.cart.id;

      if (thisProduct) {
        const [cartProduct, created] = await CartProduct.findOrCreate({
          where: {
            productId,
            cartId,
          },
        });

        let countAmount = cartProduct.amount;
        for (const customizationId of customizationsId) {
          const customization = await Customization.findByPk(customizationId);
          if (!customization) throw new HttpException('This customization does not exist', 400);
          if (customization && !customization.cartProductId) {
            customization.cartProductId = cartProduct.id;
            countAmount++;
            await customization.save();
          }
        }

        cartProduct.amount = countAmount;
        await cartProduct.save();

        if (created) {
          return {
            statusCode: 200,
            message: 'Product successfully added!',
          };
        } else return {
          statusCode: 201,
          message: 'Product updated successfully!',
        };
      }
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async postProductsInCartBulkCustomization(
    userId: string,
    productId: string,
    customizations: CreateCustomizationDto[],
  ) {
    try {
      const user: User = await User.findByPk(userId, {
        include: {
          model: ShoppingCart,
        },
      });

      const thisProduct: boolean = await this.getThisProduct(productId);

      const cartId = user.cart.id;

      if (thisProduct) {
        const [cartProduct, created] = await CartProduct.findOrCreate({
          where: {
            productId,
            cartId,
          },
        });

        const customizationsCreated = await this.productsService.setBulkCustomizations(userId, productId, customizations);

        let countAmount = cartProduct.amount;
        for (const customization of customizationsCreated.data.customizations) {
          const custom = await Customization.findByPk(customization.id);
          if (!custom) throw new HttpException('This customization does not exist', 400);
          if (custom && !customization.cartProductId) {
            customization.cartProductId = cartProduct.id;
            countAmount++;
            await customization.save();
          }
        }

        cartProduct.amount = countAmount;
        await cartProduct.save();

        if (created) {
          return {
            statusCode: 200,
            message: 'Product successfully added!',
          };
        } else return {
          statusCode: 201,
          message: 'Product updated successfully!',
        };
      }
    } catch (error) {
      console.log(error.message);

      throw new HttpException(error.message, error.status);
    }
  }

  private async getThisProduct(id: string): Promise<boolean> {
    try {
      const PRODUCT_NOT_FOUND = 'The product was not found among our available catalog.';
      const PRODUCT_INACTIVE = 'The selected product is not available for sale. Check another time.';

      const thisProduct = await this.productsService.findByPkToValidateExistentProduct(id, {
        attributes: ['id', 'status', 'stock', 'price'],
      });

      if (!thisProduct) {
        throw new NotFoundException(PRODUCT_NOT_FOUND);
      }

      if (thisProduct.status === StateProduct.Inactive) {
        throw new NotFoundException(PRODUCT_INACTIVE);
      }

      return true; // Producto válido
    } catch (error) {
      if (error instanceof HttpException) {
        // Si ya es una excepción HTTP conocida, la volvemos a lanzar
        throw error;
      }
      // Excepción genérica en caso de errores desconocidos
      throw new InternalServerErrorException(
        'An error occurred on the server while trying to search for a product.',
      );
    }
  }


  async remove(userId: string, productId: string) {
    try {
      const USER_NOT_FOUND = 'User or shopping cart not found.';
      const CART_PRODUCT_NOT_FOUND = 'CartProduct record not found.';
      const SUCCESS_MESSAGE = 'Product successfully removed.';

      // Buscar al usuario con su carrito
      const user: User = await User.findByPk(userId, {
        include: ShoppingCart,
      });

      if (!user?.cart) {
        throw new NotFoundException(USER_NOT_FOUND);
      }

      // Buscar el producto dentro del carrito
      const cartProductToDelete = await CartProduct.findOne({
        where: {
          cartId: user.cart.id,
          productId,
        },
      });

      if (!cartProductToDelete) {
        throw new NotFoundException(CART_PRODUCT_NOT_FOUND);
      }

      // Eliminar el producto del carrito
      await cartProductToDelete.destroy();

      return {
        statusCode: 204,
        message: SUCCESS_MESSAGE,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // Relanzar errores conocidos
      }

      throw new InternalServerErrorException('An unexpected server error occurred.');
    }
  }


  public async CreateShoppingCart(
    userId: { userId: string },
    transaction: Transaction,
  ): Promise<void> {
    await ShoppingCart.create(userId, { transaction });
    return;
  }

  public async destroyShoppingCart(
    userId: { userId: string },
    transaction: Transaction,
  ): Promise<void> {
    // const thisCart = await ShoppingCart.findOne({ where: userId });

    // const cp = await CartProduct.findOne({
    //   where: { cartId: thisCart.id },
    //   include: {
    //     model: Customization,
    //     attributes: ['frontSide', 'backSide'],
    //   },
    // });

    // for (const thisCustomization of cp.customizations) {
    //   if (thisCustomization.frontSide.logoId) {
    //     await this.vercelBlobService.deleteImage(thisCustomization.frontSide.logoId);
    //   }
    //   if (thisCustomization.backSide.logoId) {
    //     await this.vercelBlobService.deleteImage(thisCustomization.backSide.logoId);
    //   }
    // }

    await ShoppingCart.destroy({
      where: userId,
      transaction,
    });
    return;
  }

  async getCart(userId: string) {
    try {
      const cart = await ShoppingCart.findOne(
        {
          where: { userId },
          include: [
            {
              model: Product,
              attributes: ['id', 'title', 'price', 'genders', 'sports', 'product_categories', 'images'],
            },
          ],
        },
      );

      const products = await Promise.all(
        cart.products?.map(async (product) => {
          const cartProduct = await CartProduct.findOne({
            where: {
              cartId: cart.id,
              productId: product.id,
            },
            include: {
              model: Customization,
              attributes: [
                'id',
                'price',
                'size',
                'neck',
                'socks',
                'pants',
                'shorts',
                'materials',
                'frontSide',
                'backSide',
              ],
            },
          });

          const customizations = cartProduct.customizations;

          const totalCustomization = customizations.reduce((acc, customization) => acc + customization.price, 0);

          const subtotal = (product.price * cartProduct.amount) + totalCustomization;

          const customizationsReturn = customizations.map((c) => {
            return {
              ...c.dataValues,
              frontSide: {
                logos: c.frontSide.logos,
                texts: c.frontSide.texts,
                numbers: c.frontSide.numbers,
              },
              backSide: {
                logos: c.backSide.logos,
                texts: c.backSide.texts,
                numbers: c.backSide.numbers,
              },
            };
          });

          return {
            id: product.id,
            cartProductId: cartProduct.id,
            title: product.title,
            price: product.price,
            images: product.images.slice(0, 2),
            customizations: customizationsReturn,
            amount: cartProduct.amount,
            subtotal: Number(subtotal.toFixed(2)), // Agregar el subtotal para este producto
          };
        }),
      );


      const total = products.reduce(
        (acc, product) => acc + product.subtotal,
        0,
      );

      return {
        id: cart.id,
        products,
        total,
      };
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async getCartProducts(cartId: string) {
    try {
      const thisCart = await ShoppingCart.findByPk(cartId, {
        include: [{ model: Product, attributes: ['id', 'title', 'price', 'genders', 'sports', 'product_categories', 'images'] }],
      });

      if (!thisCart) {
        throw new NotFoundException('Shopping cart not found.');
      }

      const products = await Promise.all(
        thisCart.products?.map(async (product) => {
          const cartProduct = await CartProduct.findOne({
            where: {
              cartId,
              productId: product.id,
            },
            include: {
              model: Customization,
              attributes: [
                'id',
                'price',
                'size',
                'neck',
                'socks',
                'pants',
                'shorts',
                'materials',
                'frontSide',
                'backSide',
                'designName',
              ],
            },
          });

          const customizations = cartProduct.customizations;

          const totalCustomization = customizations.reduce((acc, customization) => acc + customization.price, 0);

          const subtotal = (product.price * cartProduct.amount) + totalCustomization;

          return {
            id: product.id,
            cartProductId: cartProduct.id,
            title: product.title,
            price: product.price,
            images: product.images.slice(0, 2),
            customizations: customizations,
            amount: cartProduct.amount,
            subtotal: Number((subtotal).toFixed(2)), // Agregar el subtotal para este producto
          };
        }),
      );

      const total = products.reduce(
        (acc, product) => acc + product.subtotal,
        0,
      ).toFixed(2);

      return {
        id: cartId,
        products,
        total,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new InternalServerErrorException(
          'Server error getting shopping cart.' + error.message,
        );
      }
    }
  }

  async updateProductQuantity(
    cartProductId: string,
    newQuantity: number,
  ): Promise<{ statusCode: number; message: string }> {
    try {
      const cartProductToUpdate = await CartProduct.findByPk(
        cartProductId,
      );

      if (!cartProductToUpdate) {
        throw new NotFoundException(
          'CartProduct record not found',
        );
      }

      const thisProduct: Product = await Product.findByPk(
        cartProductToUpdate.productId, // Usar el productId de la tabla intermedia
      );

      if (thisProduct) {
        cartProductToUpdate.amount = newQuantity;
        await cartProductToUpdate.save();

        return {
          statusCode: 200,
          message: 'Product quantity successfully updated!',
        };
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      } else {
        throw new InternalServerErrorException(
          'Server error updating product quantity.',
        );
      }
    }
  }
}
