import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductEntity } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateProductDto): Promise<ProductEntity> {
    return this.prisma.product.create({ data });
  }

  async findAll(): Promise<ProductEntity[]> {
    return this.prisma.product.findMany();
  }

  async findOne(id: number): Promise<ProductEntity | null> {
    return this.prisma.product.findUnique({ where: { id } });
  }

  async update(id: number, data: UpdateProductDto): Promise<ProductEntity> {
    return this.prisma.product.update({ where: { id }, data });
  }

  async remove(id: number): Promise<ProductEntity> {
    return this.prisma.product.delete({ where: { id } });
  }
}
