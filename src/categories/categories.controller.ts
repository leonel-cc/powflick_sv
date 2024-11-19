import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly CategoryService: CategoriesService) {}

  @ApiOperation({
    summary: 'Obtener todos las categorias',
  })
  @Get()
  getAllCategories() {
    return this.CategoryService.getAll();
  }
}
