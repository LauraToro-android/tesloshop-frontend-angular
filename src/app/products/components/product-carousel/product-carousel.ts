import { AfterViewInit, Component, ElementRef, EventEmitter, input, OnChanges, Output, SimpleChanges, viewChild } from '@angular/core';

import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';

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
export class ProductCarousel implements AfterViewInit, OnChanges { 

  @Output() onRemoveImage = new EventEmitter<string>();


  images = input.required<string[]>();
  showRemoveButton = input(false);
  swiperDiv = viewChild.required<ElementRef>('swiperDiv');
  swiper: Swiper|undefined = undefined;

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['images'].firstChange){
      return;
    }

    if (!this.swiper) return;

    this.swiper.destroy(true, true);

    //necesario para la vista previa de las imagenes en crear producto
    const paginationElement: HTMLDivElement = this.swiperDiv().nativeElement?.querySelector('.swiper-pagination');
    paginationElement.innerHTML = '';
    //necesario para que slider de los puntitos vaya acorde con las imagenes
    setTimeout(() => {
      this.swiperInit();
    },100);
    
  }



  ngAfterViewInit(): void {
    this.swiperInit();
  }    

  swiperInit(){
    const element = this.swiperDiv().nativeElement as HTMLElement;
    if (!element) return;

    this.swiper = new Swiper( element, {
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
