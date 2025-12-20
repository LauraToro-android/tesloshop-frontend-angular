import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Gender, Product, ProductsResponse } from "../interfaces/products-response.interface";
import { catchError, forkJoin, map, Observable, of, Subject, switchMap, tap, throwError } from "rxjs";
import { environment } from "../../../environments/environment.development";

const baseUrl = environment.baseUrl;

interface Options {
    limit?: number;
    offset?: number;
    gender?: string;
}
//creamos un producto vacio que va a regresar el boton Nuevo producto
const emptyProduct: Product = {
    id: "new",
    title: "",
    price: null as any,
    description: "",
    slug: "",
    //stock: 0,
    stockEntries: [],
    sizes: [],
    gender: Gender.Men,
    tags: [],
    images: []
}


@Injectable({providedIn: 'root'})
export class ProductsService {
    private http = inject(HttpClient);

    private productsCache = new Map<string, ProductsResponse>();
    private productCache = new Map<string, Product>();

    private productOperationSubject = new Subject<void>();
    public productOperation$ = this.productOperationSubject.asObservable();

    getProducts(options: Options): Observable<ProductsResponse> {

        

        const { limit = 9, offset = 0, gender = ''} = options;

        const key = `${ limit }-${offset}-${gender}`;
        if( this.productsCache.has(key)) {
            return of(this.productsCache.get(key)!);
        }
        

        return this.http.get<ProductsResponse>(`${baseUrl}/products`, {
            params: {
                limit: limit,
                offset: offset,
                gender: gender,
            },
        })
        .pipe(tap(resp => console.log(resp)),
            tap((resp) => this.productsCache.set(key,resp)),
        );
    }

    getProductByIdSlug(slug: string): Observable<Product> {

        if(this.productCache.has(slug)){
            return of (this.productCache.get(slug)!);
        }

        return this.http.get<Product>(`${baseUrl}/products/${slug}`).pipe(
            tap(product => console.log(slug, product)),
            tap(product => this.productCache.set(slug, product)),
        );
    }
    
    getProductById(id: string):Observable<Product> {
        if( id === 'new') {
            return of(emptyProduct);
        }
        if(this.productCache.has(id)) {
            return of(this.productCache.get(id)!);
        }
        return this.http.get<Product>(`${baseUrl}/products/${id}`)
        .pipe(tap((product) => this.productCache.set(id, product)));
    }

    updateProduct(id: string, productLike: Partial<Product>, imageFileList?: FileList): Observable<Product>{
       const currentImages = productLike.images ?? [];
       return this.uploadImages(imageFileList) 
       .pipe(
        map((imageNames) => ({
            ...productLike,
            images: [... currentImages, ... imageNames],
        })),
        switchMap((updateProduct) => 
            this.http.patch<Product>(`${baseUrl}/products/${id}`,updateProduct)
        ),
        tap((product) => {
            this.updateProductCache(product);
            this.notifyOperationComplete();
        
        })
        );
        
    
        //return this.http.patch<Product>(`${baseUrl}/products/${id}`, productLike)
        //.pipe(tap((product) => this.updateProductCache(product)));
    }
    
    createProduct(productLike: Partial<Product>, imageFileList?: FileList): Observable<Product> {

        let newlyUploadedImageNames: string[] = [];

        return this.uploadImages(imageFileList).pipe(
            tap((imageNames) => newlyUploadedImageNames = imageNames),
            map((imageNames) => ({
            ...productLike,
            images: [...imageNames]  
            })),
        switchMap((newProduct) =>
            this.http.post<Product>(`${baseUrl}/products`, newProduct)
        ),

    // 🛑 2. MANEJO DE ERRORES: Si la creación falla
        catchError((error) => {
            // 3. Si hay un error, limpiar las imágenes huérfanas
            if (newlyUploadedImageNames.length > 0) {
                console.warn('Fallo la creación del producto. Limpiando imágenes huérfanas.');
                
                // Llamamos a un método auxiliar para borrar las imágenes
                // El pipe toPromise() convierte el Observable en Promise, 
                // permitiendo ejecutarlo dentro de catchError (o se puede usar un forEach con subscribe)
                this.deleteProductImages(newlyUploadedImageNames).subscribe({
                    next: () => console.log('Imágenes huérfanas eliminadas con éxito.'),
                    error: (deleteErr) => console.error('Error al limpiar imágenes huérfanas:', deleteErr)
                });
            }
            // 4. Re-lanzar el error original para que el componente lo maneje
            return throwError(() => error); 
        }),

        tap((product) => {
            this.updateProductCache(product);
            this.notifyOperationComplete();
        })
        );
    }

    updateProductCache(product: Product){
        const productId = product.id;
        //Actualizamos el producto en caché de producto
        this.productCache.set(productId, product);
        //Actualizamos el producto en el caché de todos los productos el producto actualizado
        this.productsCache.forEach((productResponse) => {
            productResponse.products = productResponse.products.map(
                (currentProduct) => {
                    return currentProduct.id === productId ? product : currentProduct;
                }                                               
            );
        });
        console.log('Cache actualizado');
    }

    uploadImages(images?: FileList): Observable<string[]> {
        if( !images ) return of ([]); 

        const uploadObservables = Array.from(images).map((imageFile) =>
            this.uploadImage(imageFile));
        //forkJoin espera a que todos emitan un valor si alguno falla salta exception solo recibe array
        return forkJoin(uploadObservables).pipe(
            tap((imageNames) => console.log({ imageNames }))
        );
    }
    uploadImage(imageFile: File): Observable<string>{
        const formData = new FormData();
        formData.append('file', imageFile);

        return this.http.post<{fileName: string}>(`${baseUrl}/files/product`, formData)
            .pipe(
                map( resp => resp.fileName));
    }
    deleteImage(imageName: string): Observable<void> {
      return this.http.delete<void>(`${baseUrl}/files/product/${imageName}`);
    }
    deleteProduct(id: string): Observable<void> {
       if(id === 'new') return of (void 0);
       
       return this.getProductById(id).pipe(
        switchMap((product) => this.deleteProductImages(product.images)),
        switchMap(() => this.http.delete<void>(`${baseUrl}/products/${id}`)), // borrar producto
         tap(() => {
         // limpiar caché individual
         this.productCache.delete(id);

      // limpiar listas en caché
        this.productsCache.forEach((productResponse, key) => {
        const updatedResponse = {
          ...productResponse,
          products: productResponse.products.filter(p => p.id !== id)
        };
        this.productsCache.set(key, updatedResponse);
      });
        this.notifyOperationComplete();
        console.log(`Producto ${id} eliminado correctamente.`);
        })
       );
    }
       deleteProductImages(images: string[]): Observable<void> {
         if (!images || images.length === 0) return of (void 0);

         const deleteCalls = images.map(img =>
         this.http.delete<void>(`${baseUrl}/files/product/${img}`).pipe(
            catchError(err => {
                console.warn(`No se pudo eliminar la imagen ${img}: ${err.message}`);
                return of (void 0);
            })
         ));

         return forkJoin(deleteCalls).pipe(map(() => void 0));
       }
       // Función que notifica un cambio
       private notifyOperationComplete() {
           // 1. Limpiamos el caché de listas para forzar la recarga
           this.productsCache.clear();
        
           // 2. 🚀 NOTIFICAMOS que el cambio ocurrió con éxito
           this.productOperationSubject.next();
        }

}