import { Component, effect, inject } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { ProductsService } from '../../../products/services/products.service';
import { ProductDetails } from './product-details/product-details';

@Component({
  selector: 'app-product-admin-page',
  imports: [ ProductDetails ],
  templateUrl: './product-admin-page.html',
})
export class ProductAdminPage { 
  activatedRoute = inject(ActivatedRoute);
  router = inject(Router);
  productService = inject(ProductsService);

  productId = toSignal(
    this.activatedRoute.params.pipe(
      map(params => params['id'])
    )
  );

  productResource = rxResource({
    params: () => ({id: this.productId()}),
    stream: ({params}) => this.productService.getProductById(params.id),
  });

  redirectEffect = effect(() => {
    if(this.productResource.error()) {
      this.router.navigate(['/admin/products']);
    }
    
  });

}  