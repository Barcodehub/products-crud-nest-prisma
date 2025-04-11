import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductEntity } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { WebSocketsGateway } from 'src/websockets/websockets.gateway';
import { ProductHistoryService } from 'src/product-history/product-history.service';
import { DeleteProductResponse } from './dto/delete-response.type';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private websocketsGateway: WebSocketsGateway,
    private historyService: ProductHistoryService,
  ) {}

  async create(data: CreateProductDto, userId: number): Promise<ProductEntity> {
    // Recibe el ID del usuario creador
    // 1. Crear el producto
    const newProduct = await this.prisma.product.create({
      data,
    });

    // 2. Registrar en el historial (acción "CREATE")
    await this.historyService.recordHistory(
      'CREATE',
      newProduct.id,
      userId,
      null, // No hay datos anteriores (es creación)
      newProduct, // Datos nuevos
    );

    return newProduct;
  }

  async findAll(): Promise<ProductEntity[]> {
    return this.prisma.product.findMany();
  }

  async findOne(id: number): Promise<ProductEntity | null> {
    return this.prisma.product.findUnique({ where: { id } });
  }

  // async update(id: number, data: UpdateProductDto): Promise<ProductEntity> {
  //   return this.prisma.product.update({ where: { id }, data });
  // }

  async update(id: number, data: UpdateProductDto, userId: number) {
    const oldProduct = await this.prisma.product.findUnique({ where: { id } });
    const updatedProduct = await this.prisma.product.update({
      where: { id },
      data,
    });

    await this.historyService.recordHistory(
      'UPDATE',
      id,
      userId,
      oldProduct,
      updatedProduct,
    );

    return updatedProduct;
  }

  async remove(id: number, userId: number): Promise<DeleteProductResponse> {
    const productToDelete = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!productToDelete) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    // Registrar en historial
    await this.prisma.productHistory.create({
      data: {
        action: 'DELETE',
        productId: id,
        userId,
        oldData: JSON.parse(JSON.stringify(productToDelete)),
        newData: Prisma.JsonNull,
      },
    });

    // Eliminar producto
    const deletedProduct = await this.prisma.product.delete({
      where: { id },
    });

    return {
      deletedProduct,
      message: 'Producto eliminado correctamente',
      timestamp: new Date(),
    };
  }

  //stock via websocket
  async updateStock(id: number, stockChange: number): Promise<ProductEntity> {
    const product = await this.prisma.product.update({
      where: { id },
      data: { stock: { increment: stockChange } }, // Incrementa/decrementa stock
    });

    // Emitir actualización en tiempo real
    this.websocketsGateway.emitStockUpdate(id, product.stock);
    return product;
  }
}
