import { Component, computed, inject, Injectable, signal } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { ProductCartService } from '../../services/product-cart.service';
import { ProductImagePipe } from "../../pipes/product-image.pipe";

@Component({
    selector: 'app-product-cart',
    standalone: true,
    imports: [CommonModule, NgIf, NgFor, ProductImagePipe],
    templateUrl: './product-cart.html',
})

export class ProductCart {
    cartService = inject(ProductCartService);

    trackByItem(index: number, item: any){
        return item.productId + item.size;
    }
  
}
