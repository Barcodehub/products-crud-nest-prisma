import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductEntity } from './entities/product.entity';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Nuevo guard
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('products')
@UseGuards(JwtAuthGuard) // Protege todas las rutas del controlador
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles('admin')
  @UseGuards(RolesGuard)
  create(@Body() data: CreateProductDto): Promise<ProductEntity> {
    return this.productsService.create(data);
  }

  @Get()
  @Roles('admin', 'user') // Solo estos roles pueden acceder
  @UseGuards(RolesGuard) // Aplica el guard de roles
  findAll(): Promise<ProductEntity[]> {
    return this.productsService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'user')
  @UseGuards(RolesGuard)
  findOne(@Param('id') id: string): Promise<ProductEntity | null> {
    return this.productsService.findOne(+id);
  }

  @Put(':id')
  @Roles('admin')
  @UseGuards(RolesGuard)
  update(
    @Param('id') id: string,
    @Body() data: UpdateProductDto,
  ): Promise<ProductEntity> {
    return this.productsService.update(+id, data);
  }

  @Delete(':id')
  @Roles('admin')
  @UseGuards(RolesGuard)
  remove(@Param('id') id: string): Promise<ProductEntity> {
    return this.productsService.remove(+id);
  }
}
