import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderEntity } from './entities/order.entity';
import { RequestWithUser } from '../auth/interfaces/request-with-user.interface';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @Roles('admin', 'user')
  @UseGuards(RolesGuard)
  create(
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: RequestWithUser,
  ): Promise<OrderEntity> {
    return this.ordersService.create(req.user.id, createOrderDto);
  }

  @Get()
  @Roles('admin', 'user')
  @UseGuards(RolesGuard)
  findAll(@Req() req: RequestWithUser): Promise<OrderEntity[]> {
    return this.ordersService.findAll(req.user.id);
  }

  @Get(':id')
  @Roles('admin', 'user')
  @UseGuards(RolesGuard)
  findOne(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<OrderEntity | null> {
    return this.ordersService.findOne(req.user.id, +id);
  }

  @Patch(':id')
  @Roles('admin', 'user')
  @UseGuards(RolesGuard)
  update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @Req() req: RequestWithUser,
  ): Promise<OrderEntity> {
    return this.ordersService.update(req.user.id, +id, updateOrderDto);
  }

  @Delete(':id')
  @Roles('admin', 'user')
  @UseGuards(RolesGuard)
  remove(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<OrderEntity> {
    return this.ordersService.remove(req.user.id, +id);
  }
}
