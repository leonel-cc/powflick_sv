import { Module } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CouponController } from './coupon.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Coupon } from './entities/coupon.entity';
import { CouponUser } from './entities/coupon-user.entity';
import { User } from 'src/users/entity/users.entity';

@Module({
  imports: [SequelizeModule.forFeature([Coupon, CouponUser, User])],
  controllers: [CouponController],
  providers: [CouponService],
  exports: [CouponService, SequelizeModule],
})
export class CouponModule {}
