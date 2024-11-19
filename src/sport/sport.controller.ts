import { Controller, Get } from '@nestjs/common';
import { SportService } from './sport.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Sports')
@Controller('sport')
export class SportController {
  constructor(private readonly sportService: SportService) {}

  @ApiOperation({
    summary: 'Ruta para obtener todos los deportes y sus materiales de fabricacion.',
  })
  @Get('')
  async getAllSports() {
    const allSport = this.sportService.getAll();
    return allSport;
  }
}
