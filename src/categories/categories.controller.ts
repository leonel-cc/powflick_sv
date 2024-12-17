import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { RolesGuard } from 'src/auth/guards/rolesGuard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { Rol } from 'src/users/entity/users.entity';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly CategoryService: CategoriesService) { }

  @ApiOperation({
    summary: 'Obtener todos las categorias',
  })
  @Get()
  getAllCategories() {
    return this.CategoryService.getAllTitles();
  }

  @Get('/admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.admin)
  getAllCategoriesAdmin(
  @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.CategoryService.getAllAdmin(+page, +limit, search);
  }

  @Get(':id')
  async getCategoryWithProducts(@Param('id') categoryId: string) {
    return this.CategoryService.getCategoryWithProducts(categoryId);
  }

  @Post('create-with-products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.admin)
  async createCategoryWithProducts(
  @Body() createCategoryDto: { name: string; products: string[] },
  ) {
    const { name, products } = createCategoryDto;

    if (!name || !products || !Array.isArray(products)) {
      throw new HttpException(
        'Invalid data: name and productTitles are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      // Llama al servicio para crear la categoría y las relaciones con los productos
      const category = await this.CategoryService.createCategoryWithProducts(name, products);

      return { message: 'Category and products created successfully', createdCategory: category };
    } catch (error) {
      throw new HttpException(
        'Error creating category with products',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id/products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.admin)
  async updateCategoryProducts(
    @Param('id') categoryId: string,
      @Body('products') productTitles: string[],
      @Body('name') newCategoryName?: string, // Se agrega el nuevo nombre como parámetro opcional
  ): Promise<void> {
    return this.CategoryService.updateCategoryProducts(categoryId, productTitles, newCategoryName);
  }

  // Método para eliminar una categoría por su ID
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.admin)
  async deleteCategory(@Param('id') categoryId: string): Promise<{ message: string }> {
    try {
      // Llamar al servicio para eliminar la categoría y sus relaciones
      await this.CategoryService.deleteCategoryAndRelations(categoryId);

      return { message: 'Category and its relations deleted successfully' };
    } catch (error) {
      throw new HttpException('Error deleting category and relations', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
