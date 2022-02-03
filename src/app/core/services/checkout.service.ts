import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { BaseService } from './base.service';
import { CountryIsoService } from './country-iso.service';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  TAXAMOUNT: any;
  deliveryDisplay: boolean = true;
  carddisplay: boolean = true;
  addMoneyDisplay: boolean = true;
  payLaterIconDisplay: boolean = false;
  addToCartProductsDetails: any;
  dueDate: any = null;
  toastMessage: any;
  servicePayLaterBalance: any;
  numberVerified: boolean = false;
  userPayOption: any;
  userCardPayOption: any;
  userWalletPayOption: any;
  saveCardForUser: boolean;
  card: any = {};
  token: any;
  selectPaymentCard: any
  selectedCreditCard: any
  cardselected: boolean = false;
  cardVerify: boolean;
  cod: any;
  promoDiscountid: any;
  paymenttype: any;
  activeStep2: boolean;
  activeStep3: boolean;
  activeStep4: boolean;
  activeStep5: boolean;
  cardPayAmount: any = '';
  minimumOrderAmount: number;
  alldeliveryData: any;
  isDefaultDeliverySelected: any;
  constructor(
    private http: HttpClient,
    private router: Router,
    private baseService: BaseService,
    private countryIso: CountryIsoService
  ) { }
  billingAddress: any = {};
  userBillingAddress: any = {};
  creditToken: any;
  delieveryAddress: any;

  cardPayment: any;
  throughWallet: any;
  throughPaylater: any;
  checkoutOrder: any;

  orderTotal: any;

  orderTotalWithoutTax: any;

  walletBalance: any;

  useWallet: boolean;

  orderProductByCustomer: any;

  userSelectDelieverAddress: any;

  orderStatusComments: any;

  delieveryType: any;

  delieveryPrice: any;

  delieverData: any;

  del: any;

  newAddress: any = {};

  orderData: any = {
    orderDetails: {},
    productData: {},
    walletPayment: {},
  };

  countryModel: any;
  customerId: any;

  dialogDisplay: boolean = false;

  editCount = 0;
  editButtonDisplay = 'Add New Address';
  payLaterBalance: any;
  //http://175.41.182.101/
  taxData: any;
  shippingMobileNo: any;
  verifyCard(body) {
    //let url = "http://175.41.182.101/api/v1/card_validator"
    return this.http
      .post(`${this.baseService.baseUrlRaw}card_validator`, body)
      .pipe(catchError(this.handleError));
  }
  allCards: any;
  getAllSavedCards(id) {
    let url = 'http://175.41.182.101/api/v1/listPaymentMethods?customerId=';
    return this.http
      .get(`${this.baseService.baseUrlRaw}listPaymentMethods?customerId=${id}`)
      .pipe(catchError(this.handleError));
  }
  promoApplied: boolean = false;
  promoDiscount: any;
  getPromoOffer(code, custid, total) {
    let url = 'http://175.41.182.101/api/v1/listPaymentMethods?customerId=';
    return this.http
      .get(
        this.baseService.baseUrlRaw +
        `applyPromotionOffers?code=${code}&customerId=${custid}&total=${total}`
      )
      .pipe(catchError(this.handleError));
  }
  /* coupon used */
  couponUsedByCustomer(body) {
    let url = 'http://175.41.182.101/api/v1/listPaymentMethods?customerId=';
    return this.http
      .post(
        this.baseService.baseUrl +
        `${this.countryIso.getLoggedInCustomerId()}/couponCodeUsed`,
        body
      )
      .pipe(catchError(this.handleError));
  }
  /* wallet adjustment */
  walletAdjustment(id, body) {
    let url = 'http://localhost:3000/api/v1/customer/' + id + '/wallet';
    return this.http.post(this.baseService.baseUrl + id + '/wallet', body).pipe(
      // return this.http.post(url,body).pipe(
      catchError(this.handleError)
    );
  }
  /* this fuction will fetch wallet and pay laterb alance */
  fetchWalletPayLaterBalance(id) {
    //let url = "http://localhost:3000/api/v1/admin/customerAllWallet/"+id
    return this.http
      .get(this.baseService.baseUrlAdmin + 'customerAllWallet/' + id)
      .pipe(
        //return this.http.get(url).pipe(
        catchError(this.handleError)
      );
  }
  deductWallet(id, body) {
    return this.http
      .post(this.baseService.baseUrl + `${id}/wallet`, body)
      .pipe(catchError(this.handleError));
  }
  /* pay-pal integration in transaction table */
  paymentTransactionDetailsInDB(body) {
    // let url = "http://localhost:3000/api/v1/customer/create-transaction";
    return this.http
      .post(this.baseService.baseUrl + 'create-transaction', body)
      .pipe(
        // return this.http.post(url,body).pipe(
        catchError(this.handleError)
      );
  }
  deductStock(body) {
    return this.http
      .post(this.baseService.baseUrl + `orders/deduct-stock`, body)
      .pipe(catchError(this.handleError));
  }

  getQuoteForUser(body) {
    return this.http
      .post(this.baseService.baseUrlRaw + 'customer/quotation', body)
      .pipe(catchError(this.handleError));
  }

  userMobileNumber: any;
  userVerifiedDisplay: boolean = true;
  varifyMobileNumber(body) {
    // let url = "http://localhost:3000/api/v1/admin/"
    //return this.http.post(url+ "verify-number" , body).
    return this.http
      .post(this.baseService.baseUrlAdmin + 'verify-number', body)
      .pipe(catchError(this.handleError));
  }

  verifynumberOfCustomerSaveInDb(id, body) {
    // let url = `http://localhost:3000/api/v1/customer/${id}/shippingMobileVerifyOTP`
    // return this.http.post(url ,body).
    return this.http
      .post(`${this.baseService.baseUrl} ${id}/shippingMobileVerifyOTP`, body)
      .pipe(catchError(this.handleError));
  }
  paymentThroughCard(body) {
    //let url = "http://175.41.182.101/api/v1/checkouts"
    return this.http
      .post(this.baseService.baseUrlRaw + 'stripe/checkouts', body)
      .pipe(catchError(this.handleError));
  }
  getBrainTreeToken() {
    return this.http
      .get(`${this.baseService.baseUrlRaw}client_token`)
      .pipe(catchError(this.handleError));
  }
  placeCustomerOrder(body, type, dis_id) {
    // let url = "http://localhost:3000/api/v1/customer/"
    // return this.http.post(url + 'orders/insert-order?orderBy=online', body)
    //return this.http.post(this.baseService.baseUrl + `orders/insert-order?orderBy=online&paymentType=${type}`, body)
    return this.http
      .post(
        this.baseService.baseUrlRaw +
        `order/checkout?orderBy=online&paymentType=${type}&promotionOffersId=${dis_id}`,
        body
      )
      .pipe(catchError(this.handleError));
  }

  placeCustomePayPalrOrder(body) {
    // let url = "http://localhost:3000/api/v1/customer/"
    // return this.http.post(url + 'orders/insert-order?orderBy=online', body)
    return (
      this.http
        .post(
          this.baseService.baseUrl + `orders/insert-order?orderBy=online`,
          body
        )
        //return this.http.post(this.baseService.baseUrlRaw + `order/checkout?orderBy=online&paymentType=${type}&promotionOffersId=${dis_id}`, body)
        .pipe(catchError(this.handleError))
    );
  }
  getCountry() {
    return this.http
      .get(this.baseService.baseUrlAdmin + 'country')
      .pipe(catchError(this.handleError));
  }

  rollbackOrderForCustomer(id) {
    return this.http
      .post(this.baseService.baseUrlRaw + `order-rollback?orderId=${id}`, null)
      .pipe(catchError(this.handleError));
  }
  saveNewDelieverAddress(body) {
    return this.http
      .post(this.baseService.baseUrl + 'address', body)
      .pipe(catchError(this.handleError));
  }
  id: any;
  updateExistingDelieveryAddress(id, body) {
    return this.http
      .put(this.baseService.baseUrl + 'update/delievery-address/' + id, body)
      .pipe(catchError(this.handleError));
  }
  getAllUserAddress(id) {
    return this.http
      .get(this.baseService.baseUrl + 'user/address/?user=' + id)
      .pipe(catchError(this.handleError));
  }

  getOrderDetailsWRTCustomerID(id) {
    return this.http
      .get(this.baseService.baseUrl + 'cart?customerId=' + id)
      .pipe(catchError(this.handleError));
  }

  getDeliveryTypes(id) {
    return this.http
      .get(this.baseService.baseUrlAdmin + 'deliveryChargeDetail/' + id)
      .pipe(catchError(this.handleError));
  }

  getWalletDetails(id) {
    return this.http
      .get(this.baseService.baseUrl + 'detail/' + id)
      .pipe(catchError(this.handleError));
  }

  emptyCart(id) {
    return this.http
      .get(this.baseService.baseUrl + 'delete-cart/' + id)
      .pipe(catchError(this.handleError));
  }

  updateBillingAddress(data) {
    return this.http
      .put(this.baseService.baseUrl + `update`, data)
      .pipe(catchError(this.handleError));
  }

  findFelieveryForCountry() {
    let delivery_data: any = JSON.parse(localStorage.getItem('country'));
    this.delieverData = delivery_data.find(
      (o) => o.alphaCode == this.countryIso.getCountryCode()
    );
    this.delieverData = this.delieverData.deliveryCharge;
    this.delieveryPrice = parseFloat(this.delieverData[0].deliveryCharge);

    this.minimumOrderAmount = parseFloat(
      this.delieverData[0].minimumOrderAmount
    );

    this.del = this.delieverData[0].id;
    this.del = this.del.toString();
    this.delieveryPriceForUser.push(this.delieverData[0].deliveryCharge);
  }

  delieveryPriceForUser: any = [];

  getDelieveryData = () =>
    new Promise((resolve, reject) => {
      this.getDeliveryTypes(this.countryIso.getCountryId()).subscribe(
        (response: any) => {
          this.alldeliveryData = response.data.Detail;
          this.delieverData =
            response.data.Detail && response.data.Detail.length > 1
              ? response.data.Detail.filter((f) => f.isDefault)
              : response.data.Detail;
          //orderTotal
          this.delieveryPrice = parseFloat(this.delieverData[0].deliveryCharge);
          this.delieveryType = parseFloat(this.delieverData[0].id);
          this.del = this.delieverData[0].id;
          this.del = this.del.toString();
          this.delieveryPriceForUser.push(this.delieverData[0].deliveryCharge);
          this.minimumOrderAmount = parseFloat(
            this.delieverData[0].minimumOrderAmount
          );

          this.isDefaultDeliverySelected = this.delieverData[0]
            .isDefault as Boolean;
          resolve(200);
        },
        (error) => {
          this.router.navigate([`/${this.countryIso.getCountryCode()}/login`]);
          reject(error);
        }
      );
    });

  getUserAddress() {
    // var json:any = JSON.parse(localStorage.UserData);
    // let id = json.body.data.customerId
    this.getAllUserAddress(this.customerId).subscribe(
      (response) => {
        this.delieveryAddress = response;
        this.delieveryAddress = this.delieveryAddress.data.result;
        this.checkDefaultAddress();
      },
      (error) => {
        console.log(error);
      }
    );
  }

  // to get saved bank payment details
  getPaymentDetails(custId: any) {
    return this.http
      .get(`${this.baseService.baseUrlRaw}stripe/listCards/${custId}`)
      .pipe(catchError(this.handleError));
  }

  // to delete bank payment details
  deletePaymentDetails = (obj: any) => {
    return this.http
      .post(`${this.baseService.baseUrlRaw}stripe/deleteCard/`, obj)
      .pipe(catchError(this.handleError));

    // stripe/deleteCard
  };

  checkDefaultAddress() {
    let data = this.delieveryAddress.filter(
      (o) => o.isDefault == 'Yes' || o.isDefault == 'Yes'
    );
    if (data.length > 0) {
      this.userSelectDelieverAddress = data[0].id;
      this.userSelectDelieverAddress =
        this.userSelectDelieverAddress.toString();
      this.orderData.orderDetails.customerId = data[0].customerId;
      this.orderData.orderDetails.customerName = data[0].name;
      this.orderData.orderDetails.shippingClinicName = data[0].clinicName;
      this.orderData.orderDetails.shippingBuildingName = data[0].buildingName;
      this.orderData.orderDetails.shippingBlockNo = data[0].blockNo;
      this.orderData.orderDetails.shippingFloorNo = data[0].floorNo;
      this.orderData.orderDetails.shippingUnitNo = data[0].unitNo;
      this.orderData.orderDetails.shippingStreetName = data[0].streetName;
      this.orderData.orderDetails.shippingCountry = data[0].country;
      this.orderData.orderDetails.shippingCountryId = data[0].id;
      this.orderData.orderDetails.shippingPostcode = parseInt(data[0].zip);
      this.orderData.orderDetails.orderDate = new Date();
    } else if (data.length == 0) {
      this.userSelectDelieverAddress = this.delieveryAddress[0].id || null;
      this.userSelectDelieverAddress =
        this.userSelectDelieverAddress.toString();
      this.orderData.orderDetails.customerId =
        this.delieveryAddress[0].customerId;
      this.orderData.orderDetails.customerName = this.delieveryAddress[0].name;
      this.orderData.orderDetails.shippingClinicName =
        this.delieveryAddress[0].clinicName;
      this.orderData.orderDetails.shippingBuildingName =
        this.delieveryAddress[0].buildingName;
      this.orderData.orderDetails.shippingBlockNo =
        this.delieveryAddress[0].blockNo;
      this.orderData.orderDetails.shippingFloorNo =
        this.delieveryAddress[0].floorNo;
      this.orderData.orderDetails.shippingUnitNo =
        this.delieveryAddress[0].unitNo;
      this.orderData.orderDetails.shippingStreetName =
        this.delieveryAddress[0].streetName;
      this.orderData.orderDetails.shippingCountry =
        this.delieveryAddress[0].country;
      this.orderData.orderDetails.shippingCountryId =
        this.delieveryAddress[0].id;
      this.orderData.orderDetails.shippingPostcode = parseInt(
        this.delieveryAddress[0].zip
      );
      this.orderData.orderDetails.shippingState =
        this.delieveryAddress[0].state;
      this.orderData.orderDetails.orderDate = new Date();
    }
  }

  deleteUserDelieverAddress(id) {
    return this.http
      .delete(this.baseService.baseUrl + 'address/delete/' + id)
      .pipe(catchError(this.handleError));
  }

  handleError(error: HttpErrorResponse) {
    let errorMessage: any;
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error.message}`
      );
      errorMessage = error.error.message || error.message;
    }
    return throwError(error);
  }

  getIpay88Btn(body) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    headers.append('Accept', 'text/xml');

    return this.http
      .post(this.baseService.baseUrlRaw + 'iPay88', body, {
        headers: headers,
        responseType: 'text'
      }).pipe(catchError(this.handleError));
  }
}
