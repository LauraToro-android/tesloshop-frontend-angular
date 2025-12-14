import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { Product, ProductStockEntry } from '../../../../products/interfaces/products-response.interface';
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
  productStock = signal<ProductStockEntry[]>([]);

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
    //stock: ['', [Validators.required, Validators.min(0)]],
    sizes: this.fb.control<string[]>([], { nonNullable: true}),
    images: [['']],
    tags: [''],
    gender: ['men', [Validators.required, Validators.pattern(/men|women|kid|unisex/)]],
  });

  sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  onStockQuantityChange(event: Event, size: string) {
    const target = event.target as HTMLInputElement;
    // Usamos parseInt y 0 como fallback para asegurarnos que es un número
    const newQuantity = parseInt(target.value) || 0; 

    this.productStock.update(currentStock => {
        return currentStock.map(entry => {
            if (entry.size === size) {
                return { ...entry, quantity: newQuantity };
            }
            return entry;
        });
    });
  }
  ngOnInit(): void {
    const loadedProduct = this.product();
    this.currentProduct.set(loadedProduct);
    this.setFormValue(loadedProduct); // Llama al método simplificado

    const existingStock = loadedProduct.stockEntries || [];
    
    // 1. Crear un mapa para buscar rápidamente el stock existente por talla.
    const stockMap = new Map(existingStock.map(entry => [entry.size, entry.quantity]));

    // 2. Crear la lista completa de stock (todas las tallas con cantidad 0 por defecto)
    // Esto asegura que la tabla de tallas siempre se muestre completa.
    const initialStock: ProductStockEntry[] = this.sizes.map(size => ({
        size: size,
        quantity: stockMap.get(size) || 0 // Si existe en el mapa, usa la cantidad existente
    }));

    // 3. Inicializar la señal productStock con la lista completa.
    this.productStock.set(initialStock);

    // 4. Parchear el control 'sizes' (opcional, pero buena práctica si el DTO lo espera)
    const selectedSizes = loadedProduct.sizes && loadedProduct.sizes.length > 0
        ? loadedProduct.sizes
        : initialStock.map(e => e.size); // En modo "nuevo", parcheamos todas las tallas
        
    this.productForm.patchValue({ sizes: selectedSizes });
  }
  
  setFormValue( formLike: Partial<Product>) {
    //this.productForm.reset(this.product() as any);
    //this.productForm.patchValue(formLike as any);
    const { id, images, stockEntries, sizes, ...valuesToPatch } = formLike;

    // 2. Establecer los valores planos (title, price, slug, gender, sizes)
    this.productForm.patchValue(valuesToPatch as any);
    
    // 3. Formatear y establecer las etiquetas (tags)
    this.productForm.patchValue({ tags: valuesToPatch.tags?.join(' ,') });
    
    //const initialSizes = stockEntries 
    //    ? stockEntries.map(e => e.size) 
    //    : this.sizes; // En caso de que se cargue una 'Product' antigua sin stockEntries.

    //if (initialSizes) {
    //    this.productForm.patchValue({ sizes: initialSizes }); 
    //}
  }
  onSizeCliked(size: string){
    const currentStock = this.productStock();
    const index = currentStock.findIndex(entry => entry.size === size);

    if(index !== -1){
        // Si la talla ya existe, la eliminamos
        currentStock.splice(index, 1);
    }else{
        // Si no existe, la añadimos con cantidad inicial 0
        currentStock.push({ size: size, quantity: 0 });
    }
    
    // 1. Actualiza la señal con la nueva lista
    this.productStock.set([...currentStock]); 

    // 2. Opcional: Actualizar el control 'sizes' para que siga reflejando el estado
    // Esto es útil si tienes validaciones en el control 'sizes'
    const selectedSizes = this.productStock().map(entry => entry.size);
    this.productForm.patchValue({ sizes: selectedSizes });
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
    const filesToUpload = this.imageFileList;
    
    // 1. Filtrar las entradas de stock (solo las que tienen cantidad > 0)
    const stockEntries = this.productStock()
      .filter( entry => entry.quantity > 0 );

    
    // 2. Desestructuración para EXCLUIR 'sizes' e 'images' del payload
    // Mantenemos la desestructuración para evitar el campo 'sizes' obsoleto del formValue
    const { sizes, images, ...restOfFormValue } = formValue; 

    // 3. Construir el objeto productLike
    const productLike: Partial<Product> = {
      // Usamos restOfFormValue que contiene: title, description, slug, price, tags, gender
      ...(restOfFormValue as any),
      tags: 
       formValue.tags?.toLowerCase()
        .split(',')
        .map( tag => tag.trim()) ?? [],

      // 4. Añadir el array stockEntries (el DTO de NestJS SÍ lo espera)
      stockEntries: stockEntries,
      images: this.currentProduct()?.images || [],
    };

    try {
    // ... (El resto de la lógica de guardado y manejo de errores se mantiene igual)
    let savedProduct: Product;
    
    if (this.currentProduct()?.id === 'new') {
      // CREAR NUEVO PRODUCTO
      savedProduct = await firstValueFrom(
        this.productsService.createProduct(productLike, filesToUpload) 
      );
      this.wasSaved.set(true);
      alert('🎉 Producto creado exitosamente.');
      this.router.navigate(['/admin/products/edit', savedProduct.id]);
      
    } else {
      // ACTUALIZAR PRODUCTO EXISTENTE
      savedProduct = await firstValueFrom(
        this.productsService.updateProduct(this.currentProduct()!.id!, productLike, filesToUpload) 
      );
      this.wasSaved.set(true);
      alert('✅ Producto actualizado exitosamente.');
      this.currentProduct.set(savedProduct);
      this.tempImages.set([]); 
      this.imageFileList = undefined; 
    }
    
  } catch (error: any) {
    console.error('Error al guardar/crear producto (400 Bad Request):', error);
    
    // Manejo de errores detallado
    if (error.error && error.error.message) {
        const errorMessage = Array.isArray(error.error.message) 
            ? error.error.message.join('\n') 
            : error.error.message;
            
        alert(`Error de Validación (400):\n${errorMessage}`);
    } else {
        alert('Ocurrió un error desconocido al comunicarse con el servidor. Consulte la consola.');
      }
    }
    
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
