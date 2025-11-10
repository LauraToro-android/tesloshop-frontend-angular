import { Component, Input } from '@angular/core';
import { RouterLink } from "@angular/router";
import { Product } from '../../interfaces/products-response.interface';
import { CommonModule } from '@angular/common';
import { ProductImagePipe } from '../../pipes/product-image.pipe';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, CommonModule, ProductImagePipe],
  templateUrl: './product-card.html',
})

export class ProductCard {
    @Input() product!: Product; // Aquí recibimos un producto

    
 }
