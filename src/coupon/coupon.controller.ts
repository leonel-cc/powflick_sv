import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth-guard';
import { GetUser } from '../auth/decorator/auth-user.decorator';
import { IGetUser } from '../auth/interfaces/getUser.interface';
import { CreateCouponUserDto } from './dto/create-coupon-user.dto';

@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService) {}

  @Post()
  create(@Body() createCouponDto: CreateCouponDto) {
    return this.couponService.create(createCouponDto);
  }

  @Get()
  findAll() {
    return this.couponService.findAll();
  }

  @Get('coupon-users')
  findAllCouponUsers() {
    return this.couponService.findAllCouponUsers();
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  findUserCoupons(@GetUser() { userId }: IGetUser) {
    return this.couponService.findCouponUserByUserId(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.couponService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCouponDto: UpdateCouponDto) {
    return this.couponService.update(id, updateCouponDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.couponService.remove(id);
  }

  //coupon-users

  @Post('coupon-users')
  @UseGuards(JwtAuthGuard)
  createCouponUsers(
  @GetUser() { userId }: IGetUser,
    @Body() createCouponUserDto: CreateCouponUserDto,
    @Query('title') titleQuery: string,
  ) {
    return this.couponService.createCouponUsers(
      createCouponUserDto,
      userId,
      titleQuery,
    );
  }
}
