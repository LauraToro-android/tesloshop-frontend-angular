import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap } from 'rxjs';
import { ProductsService } from '../../../products/services/products.service';
import { ProductCard } from "../../../products/components/product-card/product-card";
import { ProductsResponse } from '../../../products/interfaces/products-response.interface';

@Component({
  selector: 'app-gender-page',
  imports: [ CommonModule ,ProductCard],
  templateUrl: './gender-page.html',
})
export class GenderPage { 

  route = inject(ActivatedRoute);
  productsService = inject(ProductsService);

  ggender = toSignal(
  this.route.params.pipe(
    map(({ gender }) => gender)
  )
);


  gender = this.route.params.pipe(
      map(({ gender }) => gender));
    
    productResource = toSignal(
    this.gender.pipe(
      // Cada vez que cambia el gender, pedimos los productos
      switchMap(gender => this.productsService.getProducts({ gender })) // observable de productos
    ),
    {
      // Valor inicial seguro
      initialValue: { count: 0, pages: 0, products: [] } as ProductsResponse
    }
  );

  constructor() {
    console.log(this.productResource()); // siempre seguro
  }

  

}
