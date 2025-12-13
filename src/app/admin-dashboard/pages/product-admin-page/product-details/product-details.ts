import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { Product } from '../../../../products/interfaces/products-response.interface';
import { ProductCarousel } from "../../../../products/components/product-carousel/product-carousel";
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtils } from '../../../../utils/form-utils';
import { FormErrorLabel } from "../../../../shared/components/form-error-label/form-error-label";
import { ProductsService } from '../../../../products/services/products.service';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'product-details',
  imports: [ProductCarousel, ReactiveFormsModule, FormErrorLabel],
  templateUrl: './product-details.html',
})
export class ProductDetails implements OnInit {

  product = input.required<Product>();
  currentProduct =  signal<Product | null>(null);

  productsService = inject(ProductsService);
  router = inject(Router);

  wasSaved = signal(false);
  imageFileList: FileList|undefined = undefined;
  tempImages = signal<string[]>([]);

  //para poder ver las imagenes seleccionadas para subir, en carousel de imagenes
  imagesToCarousel = computed(() => {
  const currentProductImages = [...(this.currentProduct()?.images ?? []), ...this.tempImages()];
  return currentProductImages;
  });




  fb = inject(FormBuilder);

  productForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    slug: ['', [Validators.required, Validators.pattern(FormUtils.slugPattern)]],
    price: ['', [Validators.required, Validators.min(0)]],
    stock: ['', [Validators.required, Validators.min(0)]],
    sizes: [['']],
    images: [['']],
    tags: [''],
    gender: ['men', [Validators.required, Validators.pattern(/men|women|kid|unisex/)]],
  });

  sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  ngOnInit(): void {
    this.currentProduct.set(this.product());
    this.setFormValue(this.product());
  }
  setFormValue( formLike: Partial<Product>) {
    this.productForm.reset(this.product() as any);
    //this.productForm.patchValue(formLike as any);
    this.productForm.patchValue({ tags: formLike.tags?.join(' ,') });
  }
  onSizeCliked(size: string){
    const currentSizes = this.productForm.value.sizes ?? [];

    if(currentSizes.includes(size)){
      currentSizes.splice(currentSizes.indexOf(size),1);
    }else{
      currentSizes.push(size);
    }
    this.productForm.patchValue({sizes: currentSizes});
  }
  async onDeleteProduct() {
    if (!this.currentProduct()?.id || this.currentProduct()?.id === 'new') return;

    const confirmDelete = confirm('¿Seguro que quieres eliminar este producto?');
    if (!confirmDelete) return;

    await firstValueFrom(this.productsService.deleteProduct(this.currentProduct()!.id));
    alert('Producto eliminado');
    this.router.navigate(['/admin/products']);
  }

  async onRemoveImage(imageNameOrUrl: string) {

    const imageName = imageNameOrUrl.split('/').pop()!; // solo el nombre del archivo
    const currentProd = this.currentProduct();

    if(!currentProd) return;

    if(currentProd.id === 'new') {
      // Solo imágenes temporales
      this.tempImages.set(this.tempImages().filter(img => img !== imageNameOrUrl));
      return;
    }

    const confirmDelete = confirm('¿Seguro que quieres eliminar esta imagen?');
    if(!confirmDelete) return;

    // 1️⃣ Borramos la imagen del servidor
    await firstValueFrom(this.productsService.deleteImage(imageName));

    // 2️⃣ Actualizamos el producto en el backend quitando la imagen
    const updatedImages = currentProd.images.filter(img => img !== imageName);
    await firstValueFrom(this.productsService.updateProduct(currentProd.id, { images: updatedImages }));

    // 3️⃣ Actualizamos la señal interna para refrescar la UI y formulario
    this.currentProduct.set({...currentProd, images: updatedImages});
    this.productForm.patchValue({images: updatedImages});

  // 4️⃣ Limpiamos imágenes temporales
    this.tempImages.set(this.tempImages().filter(img => img !== imageNameOrUrl));
}

  


  async onSubmit() {

    const isValid = this.productForm.valid;
    this.productForm.markAllAsTouched();

    if(!isValid) return;

    const formValue = this.productForm.value;
    const productLike: Partial<Product> = {
      ...(formValue as any),
      tags: 
       formValue.tags?.toLowerCase()
        .split(',')
        .map( tag => tag.trim()) ?? [],
    };
    if(this.currentProduct()?.id === 'new'){
      const product = await firstValueFrom(this.productsService.createProduct(productLike, this.imageFileList));
        console.log('Producto creado');
        this.router.navigate(['/admin/products', product.id]);
    }else{
      const updateProduct = await firstValueFrom(
        this.productsService.updateProduct(
          this.currentProduct()!.id, productLike, this.imageFileList)
        );
        this.currentProduct.set(updateProduct);
    }
    this.wasSaved.set(true);
    setTimeout(() => {
      this.wasSaved.set(false);
    }, 3000);

  }
  //Images
  onFilesChanged(event: Event) {
    const fileList = ( event.target as HTMLInputElement).files;
    if(!fileList) return;
    this.imageFileList = fileList;

    const imageUrls = Array.from(fileList).map(file => URL.createObjectURL(file));
    // concatenamos con las imágenes temporales que ya existían
    this.tempImages.set([...this.tempImages(), ...imageUrls]);

    this.tempImages.set(imageUrls);
  }

  
 }
