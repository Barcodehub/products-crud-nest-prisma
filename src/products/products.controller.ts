import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductEntity } from './entities/product.entity';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() data: CreateProductDto): Promise<ProductEntity> {
    return this.productsService.create(data);
  }

  @Get()
  findAll(): Promise<ProductEntity[]> {
    return this.productsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ProductEntity | null> {
    return this.productsService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() data: UpdateProductDto,
  ): Promise<ProductEntity> {
    return this.productsService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<ProductEntity> {
    return this.productsService.remove(+id);
  }
}
