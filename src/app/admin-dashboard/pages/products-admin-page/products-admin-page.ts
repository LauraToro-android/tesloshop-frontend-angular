import { Component, inject, signal } from '@angular/core';
import { ProductTable } from "../../../products/components/product-table/product-table";
import { PaginationService } from '../../../shared/components/pagination/pagination.service';
import { ProductsService } from '../../../products/services/products.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { Pagination } from "../../../shared/components/pagination/pagination";
import { ProductDetails } from '../product-admin-page/product-details/product-details';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-products-admin-page',
  imports: [ProductTable, Pagination, RouterLink],
  templateUrl: './products-admin-page.html',
})
export class ProductsAdminPage { 
  private productsService = inject(ProductsService);

  paginationService = inject(PaginationService)
  limitForPage = signal(10)


  productsResource = rxResource({
    params: () => ({ page: this.paginationService.currentPage(),
                     limit: this.limitForPage(),
                    }),
    stream: ({ params }) =>
      this.productsService.getProducts({
        offset: (params.page - 1) * 9,
        limit: params.limit,
      }),
  });

  constructor() {
    console.log(this.productsResource.value());
  }
}
