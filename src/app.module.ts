import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AuthModule, ProductsModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
