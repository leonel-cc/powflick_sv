import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { TagsService } from './tags.service';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { RolesGuard } from 'src/auth/guards/rolesGuard';
import { Rol } from 'src/users/entity/users.entity';

@Controller('tags')
export class TagsController {
  constructor(
    private readonly tagsService: TagsService,
  ) {}

  @Get()
  findAll() {
    return this.tagsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tagsService.findOne(id);
  }

  @Get('/admin/get')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.admin)
  getAllCategoriesAdmin(
  @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.tagsService.getAllAdmin(+page, +limit, search);
  }

  @Post('create-with-products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.admin)
  async createTagWithProducts(
  @Body() createTagDto: any,
  ) {
    try {
      // Llama al servicio para crear la categoría y las relaciones con los productos
      const tag = await this.tagsService.createTagWithProducts(createTagDto);

      return { message: 'Tag and products created successfully', createdTag: tag };
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
  @Param('id') tagId: string,
    @Body('products') productTitles: string[],
    @Body('') tagDto: any, // Se agrega el nuevo nombre como parámetro opcional
  ) {
    return this.tagsService.updateTagProducts(tagId, productTitles, tagDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.admin)
  async deleteTag(@Param('id') tagId: string): Promise<{ message: string }> {
    try {
      // Llamar al servicio para eliminar la categoría y sus relaciones
      await this.tagsService.deleteTagAndRelations(tagId);

      return { message: 'Tag and its relations deleted successfully' };
    } catch (error) {
      throw new HttpException('Error deleting Tag and relations', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
