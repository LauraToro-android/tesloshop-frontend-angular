import { Component, input } from '@angular/core';
import { Product } from '../../interfaces/products-response.interface';
import { ProductImagePipe } from '../../pipes/product-image.pipe';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-product-table',
  imports: [ProductImagePipe, RouterLink, CurrencyPipe],
  templateUrl: './product-table.html',
})
export class ProductTable { 
  products = input.required<Product[]>()

  public getTotalStock(product: Product): number {
      if (!product.stockEntries || product.stockEntries.length === 0) {
          return 0;
      }
      // Sumamos todas las cantidades del array stockEntries
      return product.stockEntries.reduce((acc, entry) => acc + entry.quantity, 0);
  }
}
