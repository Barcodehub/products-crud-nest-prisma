import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from './shared/enums/order-status.enum';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderEntity } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  private toOrderEntity(order: any): OrderEntity {
    return {
      ...order,
      status: order.status as OrderStatus,
    };
  }

  async create(userId: number, createOrderDto: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Obtener producto con su precio actual
      const product = await tx.product.findUnique({
        where: { id: createOrderDto.productId },
        select: { price: true, stock: true },
      });

      if (!product) throw new NotFoundException('Producto no encontrado');
      if (product.stock < createOrderDto.quantity) {
        throw new BadRequestException('Stock insuficiente');
      }

      // 2. Calcular amount automáticamente
      const amount = product.price * createOrderDto.quantity;

      // 3. Crear orden
      const order = await tx.order.create({
        data: {
          userId,
          productId: createOrderDto.productId,
          amount, // Usamos el monto calculado
          quantity: createOrderDto.quantity,
          status: OrderStatus.PENDING,
        },
      });

      // 3. Actualizar el stock del producto
      await tx.product.update({
        where: { id: createOrderDto.productId },
        data: { stock: { decrement: createOrderDto.quantity } },
      });

      // 4. Registrar en el historial
      await tx.productHistory.create({
        data: {
          action: 'STOCK_UPDATE',
          productId: createOrderDto.productId,
          userId,
          oldData: { stock: product.stock },
          newData: { stock: product.stock - 1 },
        },
      });

      return this.toOrderEntity(order);
    });
  }

  async findAll(userId: number): Promise<OrderEntity[]> {
    const orders = await this.prisma.order.findMany({
      where: { userId },
    });
    return orders.map((order) => this.toOrderEntity(order));
  }

  async findOne(userId: number, id: number): Promise<OrderEntity | null> {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
    });
    return order ? this.toOrderEntity(order) : null;
  }

  async update(
    userId: number,
    id: number,
    updateOrderDto: UpdateOrderDto,
  ): Promise<OrderEntity> {
    const order = await this.prisma.order.update({
      where: { id, userId },
      data: updateOrderDto,
    });
    return this.toOrderEntity(order);
  }

  async remove(userId: number, id: number): Promise<OrderEntity> {
    const order = await this.prisma.order.delete({
      where: { id, userId },
    });
    return this.toOrderEntity(order);
  }

  async updateStatus(id: number, status: OrderStatus): Promise<OrderEntity> {
    const order = await this.prisma.order.update({
      where: { id },
      data: { status },
    });
    return this.toOrderEntity(order);
  }

  async prepareForPayment(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { product: true },
    });

    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    return {
      transaction_amount: order.amount,
      external_reference: order.id.toString(),
      description: `Compra de ${order.product.name}`,
      items: [
        {
          id: order.product.id.toString(),
          title: order.product.name,
          description: order.product.description || '',
          quantity: order.quantity,
          unit_price: order.amount / order.quantity,
        },
      ],
    };
  }
}
