import { OrderStatus } from '../shared/enums/order-status.enum';

export type OrderEntity = {
  id: number;
  userId: number;
  productId: number;
  paymentId: string | null;
  status: OrderStatus;
  amount: number;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
};
