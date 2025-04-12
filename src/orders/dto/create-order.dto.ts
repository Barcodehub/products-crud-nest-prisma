import { IsInt, IsPositive, Min } from 'class-validator';

export class CreateOrderDto {
  @IsInt()
  @IsPositive()
  productId: number;

  @IsInt()
  @Min(1)
  quantity: number = 1;
}
