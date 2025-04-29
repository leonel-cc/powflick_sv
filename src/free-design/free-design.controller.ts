import { Controller, Post, Get, Body, Query, UseGuards, Param } from '@nestjs/common';
import { FreeDesignService } from './free-design.service';
import { CreateFreeDesignDto } from './dto/create-free-design.dto';
import { Roles } from '../auth/decorator/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import { RolesGuard } from '../auth/guards/rolesGuard';
import { Rol } from '../users/entity/users.entity';

@Controller('free-design')
export class FreeDesignController {
  constructor(private readonly service: FreeDesignService) {}

  @Post('/create')
  create(@Body() dto: CreateFreeDesignDto) {
    return this.service.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.admin)
  findAll(
  @Query('order') order?: string,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
    @Query('filter') filter?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(order, limit, page, filter, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id); // si el ID es numérico
  }
}