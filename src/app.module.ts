import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { WebSocketsModule } from './websockets/websockets.module';

@Module({
  imports: [AuthModule, ProductsModule, WebSocketsModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
