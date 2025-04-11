import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0) // Precio no puede ser negativo
  price: number;

  @IsNumber()
  @Min(0) // Stock mínimo es 0
  stock: number; // Nuevo campo
}
