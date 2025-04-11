import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaService } from '../prisma/prisma.service';
import { WebSocketsModule } from 'src/websockets/websockets.module';
import { ProductHistoryService } from 'src/product-history/product-history.service';

@Module({
  imports: [WebSocketsModule],
  controllers: [ProductsController],
  providers: [ProductsService, PrismaService, ProductHistoryService],
})
export class ProductsModule {}
