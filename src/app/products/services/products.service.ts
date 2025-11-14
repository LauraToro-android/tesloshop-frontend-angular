import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Product, ProductsResponse } from "../interfaces/products-response.interface";
import { count, Observable, of, tap } from "rxjs";
import { environment } from "../../../environments/environment.development";

const baseUrl = environment.baseUrl;

interface Options {
    limit?: number;
    offset?: number;
    gender?: string;
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
}