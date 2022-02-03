import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { map } from 'rxjs/operators';
import { PromotionService } from 'src/app/core/services/promotion.service';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class OffersComponent implements OnInit {
  name: string = '';
  convertHTML;
  categoriesOptions: any = [];
  categories$;
  categoriesArr: any;
  constructor(public promoService: PromotionService,
    private sanitizer: DomSanitizer
  ) {
    this.convertHTML = this.sanitizer;
  }

  ngOnInit(): void {
    this.categories$ = this.promoService.getPromoOffersCategory().pipe(
      map((res: any) => {
        this.categoriesOptions = res.data;
        return res.data;
      })
    );
    this.getPromotions();
  }

  getPromotions() {
    this.promoService.getPromotions().subscribe((res: any) => {
      this.categoriesArr = res?.data;
    });
  }

  slideConfig = {
    slidesToShow: 4,
    slidesToScroll: 1,
    speed: 1000,
    autoplay: true,
    loop: true,
    infinite: true,
    centerMode: false,
    responsive: [
      {
        breakpoint: 1125,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 3,
          dots: false,
          autoplay: true,
        },
      },
      {
        breakpoint: 1120,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          dots: false,
          autoplay: true,
        },
      },

      {
        breakpoint: 800,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  showOffer(value: any) {
    for (const iterator of this.categoriesOptions) {
      if (value === iterator.name) {
        document.getElementById(iterator.name).scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest',
        });
      }
    }
  }

  openLink(item) {
    return window.open(item?.urlLink, '_blank');
  }
}
