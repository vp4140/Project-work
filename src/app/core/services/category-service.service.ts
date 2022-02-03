import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { retry, catchError } from 'rxjs/operators';
import { BaseService } from './base.service';
import { CountryIsoService } from './country-iso.service';
import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { throwError } from 'rxjs';
import { AuthGuardService } from '../services/auth-guard.service';
import { Routes, RouterModule, CanActivate } from '@angular/router';
import { HandleErrorService } from './handle-error.service';
@Injectable({
  providedIn: 'root'
})
export class CategoryServiceService {
  baseUrl: string;
  token: any;
  constructor(
    private http: HttpClient,
    private baseService: BaseService,
    private countryIsoService: CountryIsoService,
    private handleErrorservice: HandleErrorService
  ) {
    this.baseUrl = this.baseService.baseUrlCountry;

  }

  getCategories() {
    let url = `http://localhost:3000/api/v1/web/getAllCategory?countryId=38`
    return this.http
      .get(this.baseUrl + 'getAllCategory?countryId=' + this.countryIsoService.selectedCountry[0]?.id).pipe(
        catchError(this.handleErrorservice.handleError)
      )
    //.get(url).pipe(
    //catchError(this.handleErrorservice.handleError)
    //);
  }
}
