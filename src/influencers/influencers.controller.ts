import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { InfluencerService } from './influencers.service';
import { Roles } from 'src/auth/decorator/roles.decorator';
import { Rol } from 'src/users/entity/users.entity';
import { RolesGuard } from 'src/auth/guards/rolesGuard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';

@Controller('influencers')
export class InfluencerController {
  constructor(private readonly influencerService: InfluencerService) { }

  @Post('create-with-products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.admin)
  create(@Body() dto: any) {
    return this.influencerService.createInfluencerWithProducts(dto);
  }

  @Put(':id/products')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.admin)
  update(@Param('id') id: string, @Body() dto: any) {
    return this.influencerService.updateInfluencerWithProducts(id, dto);
  }

  @Get()
  findAll() {
    return this.influencerService.getAllInfluencers();
  }

  @Get('/admin/get')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.admin)
  getAllAdmin(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search?: string,
  ) {
    return this.influencerService.getAllAdmin(+page, +limit, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.influencerService.getInfluencerById(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.admin)
  remove(@Param('id') id: string) {
    return this.influencerService.deleteInfluencer(id);
  }

}
