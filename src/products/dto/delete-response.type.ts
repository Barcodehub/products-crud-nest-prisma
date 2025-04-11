import { ProductEntity } from '../entities/product.entity';

export type DeleteProductResponse = {
  deletedProduct: ProductEntity;
  message: string;
  timestamp: Date;
};
