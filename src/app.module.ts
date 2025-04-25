import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { WebSocketsModule } from './websockets/websockets.module';
import { OrdersModule } from './orders/orders.module';
import { MercadoPagoModule } from './mercado_pago/mercado_pago.module';

@Module({
  imports: [
    AuthModule,
    ProductsModule,
    WebSocketsModule,
    OrdersModule,
    MercadoPagoModule,
  ],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
