import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ForgotPasswordDialogComponent } from '../../../shared/components/forgot-password-dialog/forgot-password-dialog.component';
import { ResetPasswordComponent } from '../../../core/auth/reset-password/reset-password.component';
import { Router } from '@angular/router';
import { HttpResponse } from '@angular/common/http';
import * as CryptoJS from 'crypto-js';
import { EncrDecrServiceService } from '../../services/encr-decr-service.service';
import { CountryIsoService } from '../../services/country-iso.service';
import { BrowserModule, Title } from '@angular/platform-browser';
import data from '../../../../assets/data.json';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  public loading = false;
  hide1 = true;
  loginForm: FormGroup;
  selectedValues: string[] = [];
  submitted: boolean = false;
  dialogFlag: boolean = false;
  loginResponseObj: any;
  public encrypted: string;
  initialButton: boolean = true;

  constructor(
    private formBuilder: FormBuilder,
    public authService: AuthService,
    private dialog: MatDialog,
    private toastr: ToastrService,
    public router: Router,
    private EncrDecr: EncrDecrServiceService,
    private countryISO: CountryIsoService,
    private title: Title
  ) {
    this.EncrDecr.myMethodToStoreToken(this.encrypted);
    this.title.setTitle(this.countryISO.MessageTitile.signup);
  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      userId: new FormControl(this.authService.noVerifyUsername?this.authService.noVerifyUsername:'', [ //newly added code
        Validators.required,
        Validators.pattern(
          '^[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,3}$'
        ),
      ]),
      password: [this.authService.noVerifyPassword?this.authService.noVerifyPassword:'', Validators.required],  //newly added code
    });

    if(!this.loginForm.invalid){            //newly added code
      this.onSubmit()                       //newly added code
      this.authService.noVerifyUsername=''  //newly added code
      this.authService.noVerifyPassword=''  //newly added code
    }                                       //newly added code
  }

  openDialog() {
    const dialogRef = this.dialog.open(ForgotPasswordDialogComponent, {
      width: '666px',
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }

  onSubmit() {
    this.loading = true;
    this.submitted = true;
    if (this.loginForm.invalid) {
      this.loading = false;
      return;
    }
    this.authenticateLogIn();
  }

  get f() {
    return this.loginForm.controls;
  }

  login() {
    this.initialButton = true;
    this.router.navigate([`/${this.countryISO.getCountryCode()}/login`]);
  }

  register() {
    this.initialButton = false;
    this.router.navigate([`/${this.countryISO.getCountryCode()}/register`]);
  }

  ngOnDestroy() {
    this.loginForm.value.userId = null;
    this.loginForm.value.password = null;
  }
  authenticateLogIn() {
    if (navigator.onLine) {
      this.authService
        .onLogin(
          this.loginForm.value.userId.toLowerCase(),
          this.loginForm.value.password
        )
        .subscribe(
          (response: HttpResponse<any>) => {
            this.loading = false;
            this.loginResponseObj = response;
            this.authService.loginFlag = true;
            this.authService.showPrice = true;

            this.authService.loggedInCustomerName =
              response.body.data.firstName;
            this.toastr.success('Login Successful');
            this.encrypted = this.EncrDecr.set(
              '123456$#@$^@1ERF',
              response.headers.get('authtoken')
            );
            console.log('Encrypted :' + this.encrypted);
            localStorage.setItem('token', response.headers.get('authtoken'));
            this.authService.showPrice = true;
            localStorage.setItem('UserData', JSON.stringify(response));
            localStorage.setItem('country', JSON.stringify(data.allCountries));
            let productId = localStorage.getItem('productId');
            let productInfo = localStorage.getItem('productInfo');
            let topUp = localStorage.getItem('top-up');

            if (topUp) {
              this.router.navigate(
                [`/${this.countryISO.getCountryCode()}/pay32/top-up`],
                { queryParams: { topUpId: topUp } }
              );
              return;
            }

            if (productInfo && productInfo != '') {
              this.router.navigate(
                [
                  `../../${this.countryISO.getCountryCode()}/p/${this.countryISO.convertToSlug(
                    productInfo
                  )}`,
                ],
                { queryParams: { pid: productId } }
              );
              console.log('ngonit from login');
            } else if (this.authService.routePay32)
              this.router.navigate([
                `/${this.countryISO.getCountryCode()}/my-wallet`,
              ]);
            else this.router.navigate([`${this.countryISO.getCountryCode()}`]);
          },
          (error) => {
            this.loading = false;
            if (error.error.message == 'Email not verify') {
              this.authService.noVerifyUsername=this.loginForm.value.userId.toLowerCase()      //newly added code 
              this.authService.noVerifyPassword=this.loginForm.value.password                  //newly added code 
              this.router.navigate([
                `/${this.countryISO.getCountryCode()}/verify-otp`,
              ]);
              this.toastr.info('Verify your email');
            } else {
              console.log('???');
              this.toastr.error(error.error.message);
            }
            if (error.status == 401) {
              this.router.navigate([
                `/${this.countryISO.getCountryCode()}/login`,
              ]);
            }
          }
        );
    } else {
      this.loading = false;
      this.toastr.error('Check your Internet Connection');
    }
  }
}
