import { computed, Injectable, signal } from "@angular/core";
import { ProductCartItem } from "../interfaces/product-cart-item.interface";


@Injectable({providedIn: 'root'})
export class ProductCartService{
    private itemsSignal = signal<ProductCartItem[]>([]);
    private isOpenSignal = signal(false);

  items = computed(() => this.itemsSignal());
  isOpen = computed(() => this.isOpenSignal());

  openCart(){
    this.isOpenSignal.set(true);
  }
  closeCart(){
    this.isOpenSignal.set(false);
  }
  toggleCart(){
    this.isOpenSignal.update(v => !v);
  }

  addItem(item: ProductCartItem) {
    const existing = this.itemsSignal().find(
      i => i.productId === item.productId && i.size === item.size
    );

    if (existing) {
      this.itemsSignal.update(current => 
        current.map(i => i === existing ? {...i, quantity: i.quantity + item.quantity} : i)
      );
    } else {
      this.itemsSignal.update(current => [...current, item]);
    }
    this.openCart();
  }

  removeItem(item: ProductCartItem) {
    this.itemsSignal.update(current =>
      current.filter(i => !(i.productId === item.productId && i.size === item.size))
    );
  }

  clearCart() {
    this.itemsSignal.set([]);
  }
  get total() {
  return this.itemsSignal().reduce((sum, i) => sum + i.price * i.quantity, 0);
}
}