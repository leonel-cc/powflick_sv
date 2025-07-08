import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateMockReviewDto, CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review, ReviewType } from './entity/reviews.entity';
import { User, UserProviders } from '../users/entity/users.entity';
import { IReview } from './interfaces/response-review.interface';
import { ActivateReviewDto } from './dto/activate-review.dto';
import { UsersService } from '../users/users.service';
import { Sequelize } from 'sequelize-typescript';
import { Op, Transaction, WhereOptions } from 'sequelize';
import { Order } from '../orders/entity/order.entity';
import { GetAllReviewsDto } from './dto/query-get-review.dto';
import { Product } from '../products/entity/products.entity';

@Injectable()
export class ReviewsService {
  constructor(
    private userService: UsersService,
    private sequelize: Sequelize,
  ) {}

  async create(id: string, createReviewDto: CreateReviewDto): Promise<IReview> {
    const transaction: Transaction = await this.sequelize.transaction();
    try {
      const user = await this.userService.findByPkGenericUser(id, {
        transaction,
      });

      const Newreview = await Review.create({
        ...createReviewDto,
        type: createReviewDto.type,
        userId: user.id,
        orderId:
          createReviewDto.type === ReviewType.ORDER
            ? createReviewDto.typeId
            : null,
        productId:
          createReviewDto.type === ReviewType.PRODUCT
            ? createReviewDto.typeId
            : null,
        isActive: false,
      });

      if (createReviewDto.type === ReviewType.ORDER) {
        const order = await Order.findByPk(createReviewDto.typeId);

        order.reviewId = Newreview.id;

        await order.save();
      }

      const response = {
        statusCode: 201,
        data: Newreview,
      };

      await transaction.commit();
      return response;
    } catch (error) {
      await transaction.rollback();
      throw new InternalServerErrorException(
        'Something went wrong when creating the review ' + error.message,
      );
    }
  }

  async createMock(createReviewDto: CreateMockReviewDto): Promise<IReview> {
    const transaction: Transaction = await this.sequelize.transaction();

    // crear falso usuario
    const { firstName, lastName } = createReviewDto;
    const randomSuffix = Math.floor(Math.random() * 1000000); // 6 dígitos aleatorios
    const email = `${firstName}${lastName}${createReviewDto.title[0]}${randomSuffix}@mock.com`;
    const phone = '+111111111';
    const userImage = createReviewDto.userImage;
    try {
      const user = await User.create({
        firstName,
        lastName,
        email,
        phone,
        image: userImage,
        password: 'null',
      });

      let productId: string = null;
      let orderId: string = null;

      if (createReviewDto.type === ReviewType.PRODUCT) {
        // Buscar el producto por nombre (typeId)
        const product = await Product.findOne({
          where: { title: { [Op.iLike]: createReviewDto.typeId } },
        });
        if (!product) {
          throw new HttpException(
            'The product with that name was not found',
            404,
          );
        }
        productId = product.id;
      } else if (createReviewDto.type === ReviewType.ORDER) {
        orderId = createReviewDto.typeId;
      }

      const Newreview = await Review.create({
        ...createReviewDto,
        type: createReviewDto.type,
        userId: user.id,
        orderId,
        productId,
        isActive: false,
      });

      if (createReviewDto.type === ReviewType.ORDER) {
        const order = await Order.findByPk(createReviewDto.typeId);
        order.reviewId = Newreview.id;
        await order.save();
      }

      const response = {
        statusCode: 201,
        data: Newreview,
      };

      await transaction.commit();
      return response;
    } catch (error) {
      console.log(error.message);
      await transaction.rollback();
      throw new InternalServerErrorException(
        'Something went wrong when creating the review ' + error.message,
      );
    }
  }

  async findAll(admin: boolean, query: GetAllReviewsDto): Promise<any> {
    try {
      const whereClause: WhereOptions = {};

      // Construir cláusula de búsqueda según los parámetros proporcionados en el DTO
      if (!admin) {
        whereClause.isActive = true;
      }
      if (admin && query.isActive !== undefined) {
        whereClause.isActive = query.isActive === 'true' ?? false;
      }
      if (query.type) {
        whereClause.type = query.type;
      }
      if (query.rating) {
        whereClause.rating = query.rating;
      }
      if (query.show) {
        whereClause.show = query.show;
      }

      if (query.search) {
        // Check if search is a number
        const searchIsNumber = !isNaN(Number(query.search));

        if (searchIsNumber) {
          // Search by order ID
          whereClause.orderId = query.search;
        } else {
          // Search by product title
          const products = await Product.findAll({
            where: {
              title: {
                [Op.iLike]: `%${query.search}%`,
              },
            },
            attributes: ['id'],
          });

          const productIds = products.map((product) => product.id);

          whereClause.productId = {
            [Op.in]: productIds,
          };
        }
      }

      const totalReviews = await Review.count({ where: whereClause });

      const limit = parseInt(query.limit);
      const page = parseInt(query.page);
      const offset = limit * (page - 1);

      const reviews = await Review.findAll({
        where: whereClause,
        include: {
          model: User,
          attributes: ['firstName', 'lastName', 'email', 'image'],
        },
        attributes: [
          'id',
          'title',
          'review',
          'type',
          'orderId',
          'productId',
          'isActive',
          'show',
          'rating',
          'image',
          'createdAt',
          'updatedAt',
        ],
        limit: limit,
        offset: offset,
        order: [['createdAt', 'DESC']],
      });

      const reviewsToShowPromises = reviews.map(
        async ({ dataValues, type, productId }) => {
          if (type === 'PRODUCT') {
            const product = await Product.findByPk(String(productId));
            if (product) {
              const { title, images, slug } = product;
              return { ...dataValues, product: { title, images, slug } };
            } else {
              // Producto no encontrado, devolver valores por defecto o null
              return { ...dataValues, product: { title: null, images: [] } };
            }
          }
          return { ...dataValues };
        },
      );

      const reviewsToShow = await Promise.all(reviewsToShowPromises);
      const totalPages = Math.ceil(totalReviews / limit);
      const prevPage = page > 1 ? page - 1 : null;
      const nextPage = page < totalPages ? page + 1 : null;

      const ratingsCount = await Review.findAll({
        where: whereClause,
        attributes: [
          'rating',
          [Sequelize.fn('COUNT', Sequelize.col('rating')), 'count'],
        ],
        group: ['rating'],
        order: [['rating', 'DESC']],
      });

      return {
        statusCode: HttpStatus.OK,
        data: {
          reviews: reviewsToShow,
          totalReviews: totalReviews,
          totalPages: totalPages,
          prevPage: prevPage,
          page: page,
          nextPage: nextPage,
          ratingsCount: ratingsCount.map((rc) => ({
            rating: rc.rating,
            count: rc.get('count'),
          })),
        },
      };
    } catch (error) {
      throw new HttpException(
        error.message,
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(updateReviewDto: UpdateReviewDto): Promise<IReview> {
    try {
      //Update
      const count = await Review.update(updateReviewDto, {
        where: {
          id: updateReviewDto.reviewId,
        },
      });

      if (count[0] === 0)
        throw new BadRequestException(
          'Could not update review, check submitted id',
        );

      const review = await Review.findByPk(updateReviewDto.reviewId, {
        include: {
          model: User,
          attributes: ['firstName', 'lastName', 'email', 'image'],
        },
        attributes: [
          'id',
          'title',
          'review',
          'type',
          'orderId',
          'productId',
          'isActive',
          'show',
          'rating',
          'image',
          'createdAt',
          'updatedAt',
        ],
      });

      return {
        statusCode: 200,
        message: 'Review updated successfuly',
        reviewUpdated: review,
      };
    } catch (error) {
      throw new HttpException(error.message, error.status);
    }
  }

  async removeOrActivate(
    changeReviewState: ActivateReviewDto,
  ): Promise<IReview> {
    try {
      const REVIEW_NOT_FOUND = 'This review does not exist.';
      const review = await Review.findByPk(changeReviewState.reviewId);

      if (!review) {
        throw new HttpException(REVIEW_NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      // Cambiar el estado de la reseña
      review.isActive = !review.isActive;
      await review.save();

      const user = await User.findByPk(review.userId);

      const action = review.isActive ? 'activated' : 'disabled';
      const message = `User review was ${action}: ${
        user?.firstName || 'Unknown'
      } ${user?.lastName || 'User'} successfully.`;

      return {
        message,
        statusCode: HttpStatus.ACCEPTED,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'An error occurred while updating the review status.',
      );
    }
  }

  async delete(id: string) {
    try {
      const deletedCount = await Review.destroy({ where: { id } });

      if (deletedCount === 0) {
        throw new HttpException('Review not found', 404);
      }

      return { message: 'The Review has been deleted' };
    } catch (error) {
      // Manejar errores específicos de Sequelize si es necesario
      throw new HttpException(
        error.message || 'An error occurred when deleting the review',
        400,
      );
    }
  }
}
