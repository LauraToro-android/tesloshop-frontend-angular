import { Component, inject } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { ProductsService } from '../../../products/services/products.service';
import { ProductCard } from "../../../products/components/product-card/product-card";
import { PaginationService } from '../../../shared/components/pagination/pagination.service';
import { Pagination } from "../../../shared/components/pagination/pagination";

@Component({
  selector: 'app-gender-page',
  imports: [CommonModule, ProductCard, Pagination, NgIf],
  templateUrl: './gender-page.html',
})
export class GenderPage { 

  route = inject(ActivatedRoute);
  productsService = inject(ProductsService);
  paginationService = inject(PaginationService);

  ggender = toSignal(
  this.route.params.pipe(
    map(({ gender }) => gender)
  )
);


  gender = this.route.params.pipe(
      map(({ gender }) => gender));
    
    productsResource = rxResource({
      params: () => ({
        gender: this.ggender(),
        page: this.paginationService.currentPage(),
      }),
      stream: ({params}) => this.productsService.getProducts({
        gender: params.gender,
        offset: (params.page -1) * 9,
      }),
    });


  constructor() {
    console.log(this.productsResource.value()); // siempre seguro
  }

  

}
