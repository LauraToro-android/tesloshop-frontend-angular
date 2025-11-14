import { AfterViewInit, Component, ElementRef, input, viewChild } from '@angular/core';

import Swiper from 'swiper';
import { Navigation, Pagination, Scrollbar } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { ProductImagePipe } from "../../pipes/product-image.pipe";


@Component({
  selector: 'product-carousel',
  imports: [ProductImagePipe],
  templateUrl: './product-carousel.html',
  styles: `
    .swiper {
      width: 100%;
      height: auto;
    }
    .swiper-slide{
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .swiper-slide img{
      max-width: 100%;
      max-height: 90vh;
      object-fit: contain;
    }
  `
})
export class ProductCarousel implements AfterViewInit { 

  images = input.required<string[]>();
  swiperDiv = viewChild.required<ElementRef>('swiperDiv');

  ngAfterViewInit(): void {
    const element = this.swiperDiv().nativeElement as HTMLElement;
    if (!element) return;

    const swiper = new Swiper( element, {
      // Optional parameters
      direction: 'horizontal',
      loop: true,

      modules: [
        Navigation, Pagination
      ],

      // If we need pagination
      pagination: {
        el: '.swiper-pagination',
      },

      // Navigation arrows
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },

      // And if we need scrollbar
      scrollbar: {
        el: '.swiper-scrollbar',
        draggable: true,
      },
      
    });
  }    
    
}
