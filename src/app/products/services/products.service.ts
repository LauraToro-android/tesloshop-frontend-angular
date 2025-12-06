import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Gender, Product, ProductsResponse } from "../interfaces/products-response.interface";
import { count, Observable, of, tap } from "rxjs";
import { environment } from "../../../environments/environment.development";
import { User } from "../../auth/interfaces/user.interface";

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
    price: 0,
    description: "",
    slug: "",
    stock: 0,
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

    updateProduct(id: string, productLike: Partial<Product>): Observable<Product>{
       return this.http.patch<Product>(`${baseUrl}/products/${id}`, productLike)
        .pipe(
            tap((product) => this.updateProductCache(product)));
    }
    
    createProduct(productLike: Partial<Product>): Observable<Product> {
        return this.http.post<Product>(`${baseUrl}/products`, productLike)
           .pipe(tap((product) => this.updateProductCache(product)));
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
}