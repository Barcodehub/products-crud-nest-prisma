/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Product } from '@prisma/client';

@Injectable()
export class ProductHistoryService {
  constructor(private readonly prisma: PrismaService) {}

  async recordHistory(
    action: string,
    productId: number,
    userId: number,
    oldData: Partial<Product> | null,
    newData: Partial<Product>,
  ) {
    try {
      return await this.prisma.productHistory.create({
        data: {
          action,
          productId,
          userId,
          oldData: oldData ? JSON.parse(JSON.stringify(oldData)) : null,
          newData: JSON.parse(JSON.stringify(newData)),
        },
      });
    } catch (error) {
      throw new Error(`Failed to record history: ${error.message}`);
    }
  }

  async getHistory(productId: number) {
    try {
      return await this.prisma.productHistory.findMany({
        where: { productId },
        include: { user: { select: { email: true } } },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw new Error(`Failed to get history: ${error.message}`);
    }
  }

  async getFullHistory() {
    return this.prisma.productHistory.findMany({
      include: {
        user: {
          select: {
            email: true,
          },
        },
        product: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async revertToVersion(historyId: number) {
    // 1. Obtener el registro de historial
    const history = await this.prisma.productHistory.findUnique({
      where: { id: historyId },
      include: { product: true },
    });

    if (!history)
      throw new NotFoundException('Registro de historial no encontrado');

    //1.1 si es nulo, restaurarlo (delete -> create)
    if (history.productId === null) {
      if (history.action === 'DELETE' && history.oldData) {
        // Recuperar producto eliminado
        const productData =
          history.oldData as unknown as Prisma.ProductCreateInput;
        const restoredProduct = await this.prisma.product.create({
          data: productData,
        });

        // Actualizar el registro de historial con el nuevo productId
        await this.prisma.productHistory.update({
          where: { id: history.id },
          data: { productId: restoredProduct.id },
        });

        return {
          success: true,
          message: 'Producto eliminado fue recreado exitosamente',
          product: restoredProduct,
        };
      }

      throw new BadRequestException(
        'Este registro de historial no puede ser revertido porque el producto fue eliminado',
      );
    }

    // 2. Revertir CREATE (ELIMINAR el producto permanentemente)
    if (history.action === 'CREATE') {
      try {
        // Verificar si el producto existe
        const product = await this.prisma.product.findUnique({
          where: { id: history.productId },
        });

        if (!product) {
          return {
            success: false,
            message: 'El producto ya no existe, reversion exitosa',
            productId: history.productId,
          };
        }

        // Eliminar el producto (automáticamente establece productId = null en ProductHistory)
        await this.prisma.product.delete({
          where: { id: history.productId },
        });

        return {
          success: true,
          message: 'Producto eliminado e historial conservado',
          productId: history.productId,
        };
      } catch (error) {
        // Manejo específico de errores de Prisma
        if (error.code === 'P2025') {
          throw new NotFoundException('Producto no encontrado');
        }
        if (error.code === 'P2011') {
          throw new ConflictException(
            'No se puede eliminar el producto debido a restricciones de base de datos',
          );
        }
        throw error;
      }
    }

    // 3. Revertir UPDATE (Restaurar versión anterior)
    if (history.action === 'UPDATE' && history.oldData) {
      const updateData =
        history.oldData as unknown as Prisma.ProductUpdateInput;
      const restoredProduct = await this.prisma.product.update({
        where: { id: history.productId },
        data: updateData,
      });

      return {
        success: true,
        message: 'Cambios en producto fueron revertidos',
        product: restoredProduct,
      };
    }

    throw new BadRequestException('No se puede revertir esta acción');
  }
}
