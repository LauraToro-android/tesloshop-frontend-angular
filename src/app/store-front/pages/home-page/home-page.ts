import { Component, inject } from '@angular/core';
import { ProductCard } from "../../../products/components/product-card/product-card";
import { ProductsService } from '../../../products/services/products.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductsResponse } from '../../../products/interfaces/products-response.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home-page',
  imports: [ProductCard, CommonModule],
  templateUrl: './home-page.html',
})
export class HomePage {
  productsService = inject(ProductsService);

  productsResource = toSignal(this.productsService.getProducts({})
  ,{ initialValue: { count: 0, pages: 0, products: [] } as ProductsResponse } );

  constructor() {
    console.log(this.productsResource());
  }
 }
