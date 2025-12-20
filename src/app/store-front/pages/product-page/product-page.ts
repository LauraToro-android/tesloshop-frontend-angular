import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '../../../products/services/products.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { ProductCarousel } from "../../../products/components/product-carousel/product-carousel";
import { DecimalPipe, NgClass } from '@angular/common';
import { EMPTY, of } from 'rxjs';
import { Size } from '../../../products/interfaces/products-response.interface';
import { ProductCartService } from '../../../products/services/product-cart.service';
@Component({
  selector: 'app-product-page',
  imports: [ ProductCarousel, DecimalPipe, NgClass],
  templateUrl: './product-page.html',
})
export class ProductPage {
  private activatedRoute = inject(ActivatedRoute);
  private productService = inject(ProductsService);
  cartService = inject(ProductCartService);

  productIdSlug = signal(this.activatedRoute.snapshot.paramMap.get('slug') || '');
  productId = signal(this.activatedRoute.snapshot.paramMap.get('id') || '');
  selectedSize = signal<string>('');

  productResource = rxResource({
    params: () => ({ slug: this.productIdSlug() }),
    stream: ({params}) => this.productService.getProductByIdSlug(params.slug),
  });
  productResourceId = rxResource({
    params: () => {
    const p = this.productResource.value();
    return p ? { id: p.id } : null; 
  },
  stream: ({ params }) => {
    // Si params es null (porque el primero no ha cargado), rxResource no hace nada
    if (!params) return EMPTY; 
    return this.productService.getProductById(params.id);
  },
  });
  selectSize(size: string){
    this.selectedSize.update(current => current === size ? '' : size);
  }
  get hasSelectedSize(): boolean{
    return !!this.selectedSize();
  }

  getStockForSize(size: string, stockEntries: any[] | undefined) {
  if (!stockEntries) return null;
  return stockEntries.find(entry => entry.size === size);
}
  
  // ... tu signal de selectedSize y recursos ...

getStockItem(size: string, stockEntries: any[] | undefined) {
    if (!stockEntries) return null;
    return stockEntries.find(s => s.size === size);
}
// Lista completa de tallas
ALL_SIZES: Size[] = [Size.Xs,
  Size.S,
  Size.M,
  Size.L,
  Size.Xl,
  Size.Xxl];

// Computed property que normaliza entries
get normalizedEntries() {
  const stockEntries = this.productResourceId.value()?.stockEntries ?? [];
  const simpleSizes = this.productResource.value()?.sizes ?? [];

  const hasStock = stockEntries.length > 0;

  return this.ALL_SIZES.map(size => {
    // 🟢 Caso 1: producto con stockEntries
    if (hasStock) {
      const entry = stockEntries.find(e => e.size === size);
      return entry ?? { size, quantity: 0 };
    }

    // 🟢 Caso 2: producto simple (sizes)
    if (simpleSizes.includes(size)) {
      return { size, quantity: 1 }; // disponible
    }

    // 🔴 No disponible
    return { size, quantity: 0 };
  });
}
addToCart() {
  if (!this.selectedSize()) return; // obligar a seleccionar talla

  const product = this.productResource.value();
  if(!product) return;

  this.cartService.addItem({
    productId: this.productResource.value()!.id,
    title: this.productResource.value()!.title,
    price: this.productResource.value()!.price,
    size: this.selectedSize() as Size,
    quantity: 1,
    image: this.productResource.value()!.images[0]
  });

  // Abrir modal
  document.getElementById('cart-modal')?.click();
}

}