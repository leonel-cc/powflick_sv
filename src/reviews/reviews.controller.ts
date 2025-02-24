import { Controller, Get, Post, Body, Patch, UseGuards, HttpException, Query, Delete, Param, Inject } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ActivateReviewDto } from './dto/activate-review.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiFoundResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import { GetUser } from '../auth/decorator/auth-user.decorator';
import { IReview } from './interfaces/response-review.interface';
import { IGetUser } from '../auth/interfaces/getUser.interface';
import { Rol } from '../users/entity/users.entity';
import { GetAllReviewsDto } from './dto/query-get-review.dto';
import { RolesGuard } from '../auth/guards/rolesGuard';
import { Roles } from '../auth/decorator/roles.decorator';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Crea una nueva reseña' })
  //Posibles respuestas--------------------------------------------------------------------
  @ApiNotFoundResponse({ description: 'Sucede cuando el usuario no existe' })
  @ApiCreatedResponse({ description: 'Se creó la reseña de forma exitosa' })
  @ApiBadRequestResponse({
    description:
      'No se pudo crear la reseña, se sugiere revisar la información del body',
  })
  @ApiInternalServerErrorResponse({
    description:
      'Algo salió mal en el servidor, se sugiere revisar que el usuario en cuestión no tenga un review creado aún',
  })
  //Para la docu del dto--------------------------------------------------------------------
  @ApiBody({ type: CreateReviewDto })
  //Controller------------------------------------------------------------------------------
  async create(
    @GetUser() user: IGetUser,
      @Body() createReviewDto: CreateReviewDto,
  ): Promise<IReview> {
    //Se extrae el id del objeto req.user que nos retorna el decorador @GetUser
    const { userId } = user;
    const response = await this.reviewsService.create(userId, createReviewDto);
    return response;
  }

  @Get()
  @ApiOperation({
    summary: 'Obtiene todos los reviews activo',
  })
  //Posibles respuestas---------------------------------------------------------
  @ApiFoundResponse({
    description:
      'Cuando todo salga bien obtendrás este statusCode junto con todos los reviews',
  })
  @ApiNotFoundResponse({
    description: 'Por si no hay reseñas activas en este momento',
  })
  @ApiInternalServerErrorResponse({
    description: 'Hubo un problema en el servidor',
  })
  //Controller------------------------------------------------------------------
  async findAll(
    @Query() query: GetAllReviewsDto,
  ): Promise<IReview> {
    const response = await this.reviewsService.findAll(false, query);
    return response;
  }

  @Get('/admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.admin)
  @ApiOperation({
    summary: 'Obtiene todos los reviews activos e inactivos',
  })
  //Posibles respuestas---------------------------------------------------------
  @ApiFoundResponse({
    description:
      'Cuando todo salga bien obtendrás este statusCode junto con todos los reviews',
  })
  @ApiNotFoundResponse({
    description: 'Por si no hay reseñas en este momento',
  })
  @ApiInternalServerErrorResponse({
    description: 'Hubo un problema en el servidor',
  })
  //Controller------------------------------------------------------------------
  async findAllByAdmin(
    @Query() query: GetAllReviewsDto,
  ): Promise<IReview> {
    const response = await this.reviewsService.findAll(true, query);
    return response;
  }

  @Patch('update')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.admin)
  @ApiBody({ type: UpdateReviewDto })
  @ApiOperation({ summary: 'Actualiza un review' })
  //Posibles respuestas--------------------------------------------------------
  @ApiOkResponse({
    description:
      'Si todo sale bien, obtendrás la review editada con los nuevos datos',
  })
  @ApiNotFoundResponse({
    description: 'Cuando no existe la reseña que se está editando',
  })
  @ApiInternalServerErrorResponse({
    description:
      'Hubo un error en el servidor al momento de actualizar la review. Revisa una vez más los datos enviados',
  })
  //Controller-----------------------------------------------------------------
  async update(
    @Body() updateReviewDto: UpdateReviewDto,
  ): Promise<IReview> {

    const response = await this.reviewsService.update(updateReviewDto);
    this.cacheManager.del('landing');
    return response;
  }

  @Patch('activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.admin)
  //Para los docs del dto------------------------------------------------------
  @ApiBody({ type: ActivateReviewDto })
  @ApiOperation({ summary: 'Activa o desactiva un review(borrado lógico)' })
  //Posibles respuestas--------------------------------------------------------
  @ApiInternalServerErrorResponse({
    description: 'Hubo un error al momento de actualizar la reseña',
  })
  @ApiOkResponse({
    description:
      'Si todo sale bien, obtendrás el número de reviews actualizadas',
  })
  async removeOrActivate(
    @Body() activateReview: ActivateReviewDto,
  ): Promise<IReview> {
    const response = await this.reviewsService.removeOrActivate(activateReview);
    return response;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Rol.admin)
  async deleteReview(@Param('id') id: string) {
    const response = await this.reviewsService.delete(id);
    return response;
  }

}
