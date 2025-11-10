import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '../../../products/services/products.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { ProductCarousel } from "../../../products/components/product-carousel/product-carousel";

@Component({
  selector: 'app-product-page',
  imports: [ ProductCarousel],
  templateUrl: './product-page.html',
})
export class ProductPage {
  private activatedRoute = inject(ActivatedRoute);
  private productService = inject(ProductsService);

  productIdSlug = signal(this.activatedRoute.snapshot.paramMap.get('slug') || '');

  productResource = rxResource({
    params: () => ({ slug: this.productIdSlug() }),
    stream: ({params}) => this.productService.getProductByIdSlug(params.slug),
  });
 }
