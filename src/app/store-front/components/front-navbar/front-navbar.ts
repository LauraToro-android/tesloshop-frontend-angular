import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { ProductCartService } from '../../../products/services/product-cart.service';
import { CommonModule, NgIf } from '@angular/common';
import { ProductCart } from '../../../products/components/product-cart-item/product-cart';

@Component({
  selector: 'app-front-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, NgIf, ProductCart],
  templateUrl: './front-navbar.html',
})
export class FrontNavbar { 
  authService = inject(AuthService);
  cartService = inject(ProductCartService);
}
