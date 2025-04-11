import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Patch,
  Req,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductEntity } from './entities/product.entity';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Nuevo guard
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequestWithUser } from 'src/product-history/request-with-user.interface';
import { ProductHistoryService } from 'src/product-history/product-history.service';
import { DeleteProductResponse } from './dto/delete-response.type';

@Controller('products')
@UseGuards(JwtAuthGuard) // Protege todas las rutas del controlador
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly historyService: ProductHistoryService,
  ) {}

  @Post()
  @Roles('admin') // Solo admins pueden crear productos
  @UseGuards(JwtAuthGuard, RolesGuard) // Asegura autenticación + roles
  async create(
    @Body() data: CreateProductDto,
    @Req() req: RequestWithUser, // Obtiene el usuario autenticado
  ): Promise<ProductEntity> {
    return this.productsService.create(data, req.user.id); // Pasa el userId al servicio
  }

  @Get()
  @Roles('admin', 'user') // Solo estos roles pueden acceder
  @UseGuards(RolesGuard) // Aplica el guard de roles
  findAll(): Promise<ProductEntity[]> {
    return this.productsService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'user')
  @UseGuards(RolesGuard)
  findOne(@Param('id') id: string): Promise<ProductEntity | null> {
    return this.productsService.findOne(+id);
  }

  @Put(':id')
  @Roles('admin')
  @UseGuards(RolesGuard)
  async update(
    @Param('id') id: string,
    @Body() data: UpdateProductDto,
    @Req() req: RequestWithUser,
  ) {
    return this.productsService.update(+id, data, req.user.id);
  }

  @Delete(':id')
  @Roles('admin')
  @UseGuards(RolesGuard)
  async remove(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<DeleteProductResponse> {
    // Usamos un tipo de respuesta específico
    return this.productsService.remove(+id, req.user.id);
  }

  @Patch(':id/stock')
  @Roles('admin')
  @UseGuards(RolesGuard)
  async updateStock(
    @Param('id') id: string,
    @Body() { change }: { change: number }, // Ej: { "change": -1 } para decrementar
  ) {
    return this.productsService.updateStock(Number(id), change);
  }

  @Get(':id/history')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getHistory(@Param('id') id: string) {
    return this.historyService.getHistory(+id);
  }

  @Get('history/all')
  @Roles('admin') // Solo accesible por admins
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getFullHistory() {
    return this.historyService.getFullHistory();
  }

  @Post('revert/:historyId')
  @Roles('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async revertVersion(
    @Param('historyId') historyId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Req() req: RequestWithUser,
  ) {
    return this.historyService.revertToVersion(+historyId);
  }
}
