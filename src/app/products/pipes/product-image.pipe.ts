import { Pipe, PipeTransform } from "@angular/core";
import { environment } from "../../../environments/environment.development";

const baseUrl = environment.baseUrl;

@Pipe({
    name: 'productImage',
    standalone: true,
})

export class ProductImagePipe implements PipeTransform {
    transform(value:null | undefined | string | string[]): string {

       const fallback = '/images/_no-image.jpg';




        if(value == null){
            return fallback;
        }
        
        if(typeof value === 'string') {
            return `${ baseUrl}/files/product/${value}`
        }
        const image = value.at(0);

        if ( !image ) {
            return fallback;
        }

        return `${baseUrl}/files/product/${image}`;
    }
}