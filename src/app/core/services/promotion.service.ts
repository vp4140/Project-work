import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { CountryIsoService } from './country-iso.service';

@Injectable({
  providedIn: 'root',
})
export class PromotionService {
  countryId: string;
  constructor(
    private http: HttpClient,
    private baseService: BaseService
  ) {
  }

  getPromoOffersCategory() {
    this.countryId = localStorage.getItem("country_id");
    return this.http.get(
      this.baseService.baseUrlRaw +
      'getSubscriptionPromotionCategory?countryId=' +
      this.countryId
    );
  }

  getPromotions() {
    this.countryId = localStorage.getItem("country_id")
    return this.http.get(
      this.baseService.baseUrlRaw +
      'getSubscriptionPromotion?countryId=' +
      this.countryId
    );
  }
}
