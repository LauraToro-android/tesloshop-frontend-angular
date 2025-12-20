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

  // 1. Convertir el evento del servicio a una señal reactiva
  // Se convierte a señal para que el effect pueda reaccionar a él.
  private operationSuccess = toSignal(this.productService.productOperation$);

  productId = toSignal(
    this.activatedRoute.params.pipe(
      map(params => params['id'])
    )
  );

  productResource = rxResource({
    params: () => ({id: this.productId()}),
    stream: ({params}) => this.productService.getProductById(params.id),
  });

  // 2. 🚀 EFECTO BASADO EN EVENTO DE ÉXITO
  successRedirectEffect = effect(() => {
    // Cuando operationSuccess emite un valor (cualquier valor), el efecto se dispara.
    // Usamos el `if` para evitar que el efecto se dispare en la inicialización (null/undefined).
    if (this.operationSuccess() !== undefined) { 
        // 3. Redirigir a la lista de productos
        // Esto fuerza a la lista de productos a recargarse (usando el caché vacío)
        this.router.navigate(['/admin/products']);
    }
  });

  redirectEffect = effect(() => {
    if(this.productResource.error()) {
      this.router.navigate(['/admin/products']);
    }
    
  });

}  