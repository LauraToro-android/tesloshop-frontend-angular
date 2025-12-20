
import { Size } from "./products-response.interface";

export interface ProductCartItem { 
  productId: string;
  title: string;
  price: number;
  size: Size;
  quantity: number;
  image: string;
}

