import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Put, HttpException, HttpStatus } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { RolesGuard } from 'src/auth/guards/rolesGuard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { Rol } from 'src/users/entity/users.entity';
import { Collection } from './entity/collections.entity';
import { CollectionProduct } from './entity/collectionProduct.entity';

@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Post()
  create(@Body() createCollectionDto: CreateCollectionDto) {
    return this.collectionsService.create(createCollectionDto);
  }

  @Get()
  findAll() {
    return this.collectionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.collectionsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCollectionDto: UpdateCollectionDto) {
    return this.collectionsService.update(id, updateCollectionDto);
  }

  async deleteCategoryAndRelations(collectionId: string): Promise<void> {
    try {
      // 1. Verificar si la categoría existe
      const category = await Collection.findByPk(collectionId);

      if (!category) {
        throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
      }

      // 2. Eliminar las relaciones de productos en la tabla ProductCategories
      await CollectionProduct.destroy({
        where: {
          collectionId,
        },
      });

      // 3. Eliminar la categoría
      await category.destroy();
    } catch (error) {
      throw new HttpException('Error deleting category and its relations', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // @Post('create-with-products')
  // createWithProducts() {
  //   return this.collectionsService.createCollectionWithProducts();
  // }

  @Post('create-with-products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.admin)
  async createCategoryWithProducts(
  @Body() createCategoryDto: any,
  ) {
    try {
      // Llama al servicio para crear la categoría y las relaciones con los productos
      const category = await this.collectionsService.createCollectionWithProducts(createCategoryDto);

      return { message: 'Category and products created successfully', createdCategory: category };
    } catch (error) {
      throw new HttpException(
        'Error creating category with products',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('all/names')
  async getCollectionNames() {
    return this.collectionsService.getCollectionNamesWithProducts();
  }

  @Get('/admin/get')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.admin)
  getAllCategoriesAdmin(
  @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.collectionsService.getAllAdmin(+page, +limit, search);
  }

  @Put(':id/products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.admin)
  async updateCategoryProducts(
  @Param('id') categoryId: string,
    @Body('products') productTitles: string[],
    @Body('') collectionDto: any, // Se agrega el nuevo nombre como parámetro opcional
  ) {
    return this.collectionsService.updateCollectionProducts(categoryId, productTitles, collectionDto);
  }

  // Método para eliminar una categoría por su ID
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.admin)
  async deleteCollection(@Param('id') collectionId: string): Promise<{ message: string }> {
    try {
      // Llamar al servicio para eliminar la categoría y sus relaciones
      await this.collectionsService.deleteCollectionAndRelations(collectionId);

      return { message: 'Category and its relations deleted successfully' };
    } catch (error) {
      throw new HttpException('Error deleting category and relations', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
