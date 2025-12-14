export interface ProductsResponse {
    count:    number;
    pages:    number;
    products: Product[];
}

export interface Product {
    id:          string;
    title:       string;
    price:       number;
    description: string;
    slug:        string;
    //stock:       number;
    stockEntries: ProductStockEntry[];
    sizes:       Size[];
    gender:      Gender;
    tags:        string[];
    images:      string[];
}

export enum Gender {
    Kid = "kid",
    Men = "men",
    Unisex = "unisex",
    Women = "women",
}

export enum Size {
    L = "L",
    M = "M",
    S = "S",
    Xl = "XL",
    Xs = "XS",
    Xxl = "XXL",
}

export interface ProductStockEntry {
    size:     string;
    quantity: number;
}

