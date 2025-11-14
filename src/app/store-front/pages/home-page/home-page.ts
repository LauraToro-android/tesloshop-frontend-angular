import { Component, inject } from '@angular/core';
import { ProductCard } from "../../../products/components/product-card/product-card";
import { ProductsService } from '../../../products/services/products.service';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { Pagination } from "../../../shared/components/pagination/pagination";
import { PaginationService } from '../../../shared/components/pagination/pagination.service';

@Component({
  selector: 'app-home-page',
  imports: [ProductCard, CommonModule, Pagination],
  templateUrl: './home-page.html',
})
export class HomePage {
  private productsService = inject(ProductsService);

  paginationService = inject(PaginationService)


  productsResource = rxResource({
    params: () => ({ page: this.paginationService.currentPage() }),
    stream: ({ params }) =>
      this.productsService.getProducts({
        offset: (params.page - 1) * 9, // <-- corregido
      }),
  });

  constructor() {
    console.log(this.productsResource.value());
  }
  
 }
