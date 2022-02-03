import { Component, OnInit } from '@angular/core';
import { ProductsService } from 'src/app/core/services/products.service';
import { CheckoutService } from 'src/app/core/services/checkout.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import * as braintree from 'braintree-web';
import { Router } from '@angular/router';
import { CountryIsoService } from '../../../services/country-iso.service';
import { IPayPalConfig, ICreateOrderRequest, IMoney } from 'ngx-paypal';
import { UserService } from '../../../services/user.service';

import { OrderService } from '../../../services/order.service';
import { BrowserModule, Title } from '@angular/platform-browser';
import { environment } from '../../../../../environments/environment';
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent implements OnInit {
  allProductTotal: any;
  allOrderData: any;
  custID: any;
  custName: any;
  panleExpanded: boolean = false;
  paypalDataForTransactionTable: any;
  responseMesg: any;
  payType: any;

  constructor(
    private service: ProductsService,
    public checkoutService: CheckoutService,
    public orderService: OrderService,
    private title: Title,
    private toast: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    public countryISO: CountryIsoService,
    private userService: UserService
  ) {
    this.checkoutService.orderData.paypalDetails = null;
    this.checkoutService.getDelieveryData().then(
      (data) => {
        if (data == 200) {
          this.triggerAllFunctions();
        }
      },
      (error) => {
        console.log('error in delievery');
      }
    );
  }
  // counter :any = 0
  //   ngDoCheck(){
  //     this.counter = this.counter + 1
  //     if (this.counter == 15){
  //       if (this.checkoutService.TAXAMOUNT == undefined || this.checkoutService.TAXAMOUNT == null || this.checkoutService.TAXAMOUNT == NaN){
  //       this.router.navigate([`/${this.countryISO.getCountryCode()}/add-to-cart`])
  //       }

  //     }

  //   }
  triggerAllFunctions() {
    let sub = this.route.queryParams.subscribe((params) => {
      // Defaults to 0 if no query param provided.
      this.custID = +params['customerid'] || 0;
    });
    if (!localStorage.getItem('UserData')) {
      this.toast.show('No User found');
    } else {
      this.checkoutService.billingAddress = JSON.parse(
        localStorage.getItem('UserData')
      );
      this.checkoutService.billingAddress =
        this.checkoutService.billingAddress.body.data;
      this.counttryRegion = this.checkoutService.billingAddress.countryRegionId;
      this.custID = this.checkoutService.billingAddress.customerId;
      this.checkoutService.customerId = this.custID;
      this.custName = this.checkoutService.billingAddress.firstName;
      // this.getUserAddress()
      // this.allOrderData = JSON.parse(localStorage.getItem('order-data'))
      //this.checkoutService.getDelieveryData()
      // this.checkoutService.findFelieveryForCountry()

      this.getOrderDataForCustomer();
      this.initializecomp();
    }
  }

  initializecomp() {
    Promise.all([
      this.checkoutService.getUserAddress(),
      // this.calculateTotalAmount(),
      // this.getOrderDataForCustomer(),
      this.getBillingAddressOfUser(),
      this.getAllCountry(),
      this.getVerifiedData(),
      this.fetchBalance(),
    ]);
    this.checkWalletBalance();
  }

  getBillingAddressOfUser() {
    this.userService.getBillingProfilePersonalInfo().subscribe(
      (response: any) => {
        this.checkoutService.taxData = {};
        this.checkoutService.taxData['taxCode'] = response?.data?.taxCode;
        this.checkoutService.taxData['taxRate'] = response?.data?.taxRate;
        this.checkoutService.taxData['taxId'] = response?.data?.taxId;
        let mesg: any = response;
        mesg = mesg.data;
        this.calculateTotalAmount();
        this.addBillingData(mesg);
      },
      (error) => {
        console.log('error in fetching billing address', error);
      }
    );
  }
  /* fetch wallet and pay later balance */
  paylaterBalance: any;
  fetchBalance() {
    this.checkoutService
      .fetchWalletPayLaterBalance(this.countryISO.getLoggedInCustomerId())
      .subscribe(
        (response) => {
          this.paylaterBalance = response;
          this.paylaterBalance = this.paylaterBalance.data;
          this.paylaterBalance = this.paylaterBalance.PAY32BNPL.pay32bnpl;
          this.checkoutService.servicePayLaterBalance = this.paylaterBalance;
        },
        (error) => {
          if (error.status == 401) {
            this.router.navigate([
              `/${this.countryISO.getCountryCode()}/login`,
            ]);
          }
        }
      );
  }
  getTaxDetail() {
    //let data = JSON.parse(localStorage.getItem('country'))
    // let data = countrydata.allCountries;
    // data.some((elem) => {
    //   if (elem.id == this.counttryRegion) {
    //     this.checkoutService.taxData = elem.tax[0];
    //   }
    // });
  }
  getVerifiedData() {
    if (this.countryISO.getCustomerNumberVerifiedOrNot() == 0) {
      this.toast.show('Please verify your number');
      this.checkoutService.userVerifiedDisplay = true;
    } else if (this.countryISO.getCustomerNumberVerifiedOrNot() == 1) {
      this.checkoutService.userMobileNumber =
        this.countryISO.getCustomerNumber();
      this.checkoutService.userVerifiedDisplay = false;
      // this.toast.success("Number is already verified")
    }
  }
  counttryRegion: any;
  addBillingData(data) {
    this.checkoutService.userBillingAddress.name =
      data.firstName + ' ' + data.lastName;
    this.checkoutService.userBillingAddress.clinicName = data.clinicName;
    this.checkoutService.userBillingAddress.blockNo = data.houseNo;
    this.checkoutService.userBillingAddress.floorNo = data.floorNo;
    this.checkoutService.userBillingAddress.unitNo = data.unitNo;
    this.checkoutService.userBillingAddress.buildingName = data.buildingName;
    this.checkoutService.userBillingAddress.streetName = data.streetName;
    this.checkoutService.userBillingAddress.country = data.countryId;
    this.checkoutService.userBillingAddress.zip = data.pincode;
    this.checkoutService.userBillingAddress.Email = data.Email;
    this.checkoutService.userBillingAddress.state = data.state;
    this.checkoutService.userBillingAddress.mobileNumber = data.mobileNumber;
    this.checkoutService.userBillingAddress.countryName = data.country.country;
  }
  getAllSavedCardsOfCustomer() {
    this.checkoutService.getAllSavedCards(this.custID).subscribe(
      (response) => {
        this.checkoutService.allCards = response;
        this.checkoutService.allCards = this.checkoutService.allCards.data;
      },
      (error) => {
        this.toast.error(error.message);
        if (error.status == 401) {
          this.router.navigate([`/${this.countryISO.getCountryCode()}/login`]);
        }
      }
    );
  }
  paymentResponse: any;
  chargeAmount = 11.11;
  onPaymentStatus(response): void {
    this.paymentResponse = response;
  }

  getAllCountry() {
    this.checkoutService.getCountry().subscribe(
      (response) => {
        let data: any = response;
        data = data.data;
        this.checkoutService.countryModel = data;
      },
      (error) => {
        if (error.status == 401) {
          this.router.navigate([`/${this.countryISO.getCountryCode()}/login`]);
        }
      }
    );
  }
  // getDelieveryData(){
  //   this.checkoutService.getDeliveryTypes(38)
  //   .subscribe((response)=>{
  //     this.checkoutService.delieverData = response
  //     this.checkoutService.delieverData = this.checkoutService.delieverData.data.Detail
  //     this.checkoutService.del =  this.checkoutService.delieverData[0].id
  //   },(error)=>{
  //     console.log(error)
  //   })
  // }
  checkoutDsiplay: boolean = false;
  checkWalletBalance() {
    this.checkoutService
      .getWalletDetails(this.countryISO.getLoggedInCustomerId())
      .subscribe(
        (response) => {
          this.checkoutService.walletBalance = response;
          this.checkoutService.payLaterBalance = response;
          this.checkoutService.walletBalance = parseFloat(
            this.checkoutService.walletBalance.data.wallet
          );
          this.checkoutService.throughWallet =
            this.checkoutService.walletBalance;
          this.checkoutService.payLaterBalance = parseFloat(
            this.checkoutService.payLaterBalance.data.payLaterL32
          );
          if (
            this.checkoutService.payLaterBalance >=
            this.checkoutService.orderTotal
          ) {
            this.checkoutService.payLaterIconDisplay = true;
          } else {
            this.checkoutService.payLaterIconDisplay = false;
          }

          if (
            this.checkoutService?.orderTotal &&
            this.checkoutService.walletBalance
          ) {
            if (
              parseFloat(this.checkoutService.walletBalance.toFixed(2)) <=
              parseFloat(this.checkoutService.orderTotal.toFixed(2))
            ) {
              //this.checkoutService.addMoneyDisplay = true
              //  alert("haha")
              this.checkoutService.carddisplay = true;
              this.checkoutService.cardPayment =
                parseFloat(this.checkoutService.orderTotal) -
                parseFloat(this.checkoutService.walletBalance);
              this.checkoutService.cardPayment = parseFloat(
                this.checkoutService.cardPayment
              ).toFixed(2);
            } else {
              this.checkoutService.carddisplay = false;
            }
          }

          this.checkoutService.cardPayment =
            parseFloat(this.checkoutService.orderTotal) -
            parseFloat(this.checkoutService.walletBalance);
          this.checkoutDsiplay = true;
        },
        (error) => {
          if (error.status == 401) {
            this.router.navigate([
              `/${this.countryISO.getCountryCode()}/login`,
            ]);
          }
        }
      );
  }
  TAXAMOUNT: any;
  calculateTotalAmount() {
    let arr = [];
    if (
      !this.allOrderData ||
      Object.keys(this.allOrderData).length == 0 ||
      !this.checkoutService.taxData ||
      Object.keys(this.checkoutService.taxData).length === 0
    ) {
      return;
    }
    this.allOrderData.forEach((elem) => {
      arr.push(elem.total);
    });
    let orderTotal = arr.reduce(function (a, b) {
      return a + b;
    });

    //order total
    this.checkoutService.orderTotalWithoutTax = orderTotal;
    this.checkoutService.orderTotal = orderTotal;

    //order total with discount if applied
    if (
      this.checkoutService.promoDiscount ||
      localStorage.getItem('discount_applied')
    ) {
      //  this.toast.info("Promo applied successfully!")
      let discount: any = localStorage.getItem('discount_applied');
      var bytes = CryptoJS.AES.decrypt(discount, `${this.countryISO.getKey()}`);
      var originalText: any = bytes.toString(CryptoJS.enc.Utf8);

      this.checkoutService.promoDiscount = parseFloat(originalText); //localStorage.getItem('discount_applied')
      this.checkoutService.orderTotal =
        orderTotal - parseFloat(this.checkoutService.promoDiscount);
      // let taxAmount: any =
      //   (this.checkoutService.orderTotal *
      //     parseFloat(this.checkoutService.taxData.taxRate)) /
      //   100;
      // this.checkoutService.TAXAMOUNT = parseFloat(taxAmount).toFixed(2);

      // this.checkoutService.orderTotal =
      //   this.checkoutService.orderTotal + taxAmount;
    }

    //order total with delivery charges
    this.checkoutService.delieveryPrice =
      this.checkoutService.orderTotal >=
        this.checkoutService.minimumOrderAmount &&
        this.checkoutService.isDefaultDeliverySelected
        ? 0
        : this.checkoutService.delieveryPrice;

    this.checkoutService.orderTotal =
      this.checkoutService.orderTotal +
      (this.checkoutService.orderTotal >=
        this.checkoutService.minimumOrderAmount &&
        this.checkoutService.isDefaultDeliverySelected
        ? 0
        : this.checkoutService.delieveryPrice);

    //tax amount
    let taxAmount: any =
      (this.checkoutService.orderTotal *
        parseFloat(this.checkoutService.taxData.taxRate)) /
      100;

    this.checkoutService.TAXAMOUNT = parseFloat(taxAmount).toFixed(2);

    //order total with tax amount
    this.checkoutService.orderTotal =
      this.checkoutService.orderTotal + taxAmount;
  }

  ngOnDestroy() {
    localStorage.removeItem('discount_applied');
    localStorage.removeItem('dis_id');
  }

  segregateProducts() {
    let data: any = [];
    this.checkoutService.orderProductByCustomer.forEach((elem) => {
      data.push({
        quantity: elem.quantity,
        price: parseFloat(elem.product.MRP).toFixed(2),
        total: elem.total,
        discount: 0,
        productId: elem.product.id,
        orderProductStatus: 'In Stock',
        productName: elem.product.productName,
        sellerId: elem.product.sellerId,
        sellerName: elem.product.sellerProducts[0].sellerDetail.sellerName,
        sellerfee: elem.product.sellerProducts[0].sellerFee,
        pncode: elem.product.PNCDE,
      });
    });

    this.checkoutService.orderData.productData = data;
  }
  listOfProductIds: any = [];

  getOrderDataForCustomer() {

    this.checkoutService.getOrderDetailsWRTCustomerID(this.custID).subscribe(
      (response) => {
        this.checkoutService.orderProductByCustomer = response;
        this.checkoutService.orderProductByCustomer =
          this.checkoutService.orderProductByCustomer.data;
        this.checkoutService.orderProductByCustomer.forEach((elem) => {
          this.listOfProductIds.push(elem.product.id);
        });
        // for (var item of this.checkoutService.orderProductByCustomer){
        //   this.listOfProductIds.push(item.product.id)
        // }
        this.allOrderData = JSON.parse(localStorage.getItem('order-data'));
        this.calculateTotalAmount();
        this.segregateProducts();
      },
      (error) => {
        if (error.status == 401) {
          this.router.navigate([`/${this.countryISO.getCountryCode()}/login`]);
        }
      }
    );
  }

  checkRoute() {
    let showMessage = 'Thank you for placing the order';
    this.router.navigate([`/${this.countryISO.getCountryCode()}/thank-you`], {
      state: { message: showMessage },
    });
  }

  placeOrder() {
    this.checkoutService.orderData.walletPayment.listOfProductIds =
      JSON.stringify(this.listOfProductIds);
    this.checkoutService.orderData.walletPayment.productTotal =
      this.checkoutService.orderTotal;
    this.checkoutService.orderData.walletPayment.productTotal =
      this.checkoutService.orderTotalWithoutTax;
    this.checkoutService.orderData.walletPayment.totalAmountWithTax =
      this.checkoutService.orderTotal;
    this.checkoutService.orderData.walletPayment.tax = parseFloat(
      this.checkoutService.taxData.taxRate
    );
    this.checkoutService.orderData.orderDetails.customerName = this.custName;
    this.checkoutService.orderData.orderDetails.paymenttype =
      this.checkoutService.paymenttype;
    this.checkoutService.orderData.walletPayment.delieveryType =
      this.checkoutService.delieveryType;
    this.checkoutService.orderData.walletPayment.delieveryCharge =
      this.checkoutService.delieveryPrice;
    this.checkoutService.orderData.walletPayment.methodOfPayment = {
      card: this.checkoutService.cardPayment,
      wallet: this.checkoutService.throughWallet,
      cod: this.checkoutService.cod,
    };

    this.checkoutService.orderData.walletPayment.discount =
      this.checkoutService.promoDiscount || 0;
    this.checkoutService.orderData.orderDetails.billingClinicName =
      this.checkoutService.userBillingAddress.clinicName;
    this.checkoutService.orderData.orderDetails.billingBuildingName =
      this.checkoutService.userBillingAddress.buildingName;
    // this.service.orderData.orderDetails.billingBlockNo = data.houseNo
    this.checkoutService.orderData.orderDetails.billingFloorNo =
      this.checkoutService.userBillingAddress.floorNo;
    this.checkoutService.orderData.orderDetails.billingUnitNo =
      this.checkoutService.userBillingAddress.unitNo;
    this.checkoutService.orderData.orderDetails.billingStreetName =
      this.checkoutService.userBillingAddress.streetName;
    this.checkoutService.orderData.orderDetails.customerName =
      this.checkoutService.userBillingAddress.name;
    this.checkoutService.orderData.orderDetails.Email =
      this.checkoutService.userBillingAddress.Email;
    this.checkoutService.orderData.orderDetails.mobileNumber =
      this.checkoutService.userMobileNumber; //this.checkoutService.userBillingAddress.mobileNumber
    this.checkoutService.orderData.orderDetails.billingPostcode =
      this.checkoutService.userBillingAddress.zip;

    this.checkoutService.orderData.orderDetails.countryid =
      this.checkoutService.userBillingAddress.country;
    this.checkoutService.orderData.orderDetails.country =
      this.checkoutService.userBillingAddress.countryName;
    if (this.checkoutService.userPayOption == 'paypal' && !this.checkoutService.userWalletPayOption && !this.checkoutService.useWallet) {
      this.orderService.paypalDisplay = true;
      this.payType = 'Paypal';
    } else if (this.checkoutService.userPayOption == 'paypal' &&
      this.checkoutService.userWalletPayOption == 'wallet' &&
      this.checkoutService.walletBalance > 0 &&
      this.checkoutService.useWallet == true) {
      this.payType = 'Wallet,Paypal';
    } else if (this.checkoutService.userPayOption == 'paylater') {
      this.checkoutService.orderData.orderDetails.dueDate =
        this.checkoutService.dueDate;
      this.checkoutService.orderData.walletPayment.methodOfPayment.paylater =
        this.checkoutService.orderData.walletPayment.totalAmountWithTax;
      this.payType = 'PAY32-BNPL';
      this.orderInDb();
    } else if (
      this.checkoutService.userWalletPayOption == 'wallet' &&
      this.checkoutService.walletBalance >= this.checkoutService.orderTotal
    ) {
      this.promiseArr.push(this.emptyCustomerCart(), this.deductStockFromDB());
      this.orderInDb();
    } else if (this.checkoutService.userPayOption == 'cod') {
      this.promiseArr.push(this.emptyCustomerCart(), this.deductStockFromDB());
      this.orderInDb();
    } else if (this.checkoutService.userCardPayOption == 'card') {
      this.promiseArr.push(this.emptyCustomerCart(), this.deductStockFromDB());
      this.orderInDb();
    } else if (
      this.checkoutService.userCardPayOption == 'card' &&
      this.checkoutService.userWalletPayOption == 'wallet' &&
      this.checkoutService.walletBalance > 0 &&
      this.checkoutService.useWallet == true
    ) {
      this.promiseArr.push(this.emptyCustomerCart(), this.deductStockFromDB());
      this.orderInDb();
    }
  }

  adjustPayLaterBalance() {
    let data: any = {
      amountCredit: '0',
      amountDebit:
        this.checkoutService.orderData.walletPayment.methodOfPayment.paylater,
      message: 'deducted from pay later balance for customer site',
      type: 'PAY32-BNPL',
      txnSource: 'Admin',
      txnSourceId: '4',
    };
    this.checkoutService.walletAdjustment(this.custID, data).subscribe(
      (response) => {
        let message: any = response;
        message = message.message;
      },
      (error) => {
        if (error.status == 401) {
          this.router.navigate([`/${this.countryISO.getCountryCode()}/login`]);
        }
      }
    );
  }

  deductStockFromDB() {
    /* to do add this sub /sum in query*/
    this.checkoutService.orderData.productData.map((elem) => {
      elem.type = 'sub';
    });
    this.checkoutService
      .deductStock(this.checkoutService.orderData.productData)
      .subscribe(
        (response) => {
          let mesg: any = response;
          mesg = mesg.response.message;
          this.toast.success(mesg);
        },
        (error) => {
          console.log('error in deducting stock,try again later', error);
        }
      );
  }
  /* this function will enter details in transaction table */
  enterTransactionDetailsInApi() {
    let data = {
      customerId: this.custID,
      transactionId: this.paypalDataForTransactionTable.id,
      orderId: this.orderId,
      amount: this.checkoutService.orderTotal,
      paypal: this.paypalDataForTransactionTable.payer,
      paymentType: 'sale',
      paymentFrom: 'paypal',
    };
    this.checkoutService.paymentTransactionDetailsInDB(data).subscribe(
      (response) => {
        console.log('paypal entry in db', response);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  promiseArr: any = [];
  orderInDb() {
    for (const item of this.checkoutService.orderProductByCustomer) {
      if (item.quantity > item.stock) {
        this.toast.show(`${item.product.productName} Is out of stock`);
        return;
      }
    }

    this.checkoutService
      .placeCustomerOrder(this.checkoutService.orderData, this.payType, null)
      .subscribe(
        (response) => {
          this.responseMesg = response;
          this.orderId = response;
          this.orderId = this.orderId.response.result.orderId;
          this.responseMesg = this.responseMesg.response.result.orderId;
          this.toast.success(
            `Congratualtions , Your order has been placed successfuly,Your order number is ${this.responseMesg}`
          );
          // Promise.all([this.emptyCustomerCart(), this.deductPaymentFromCard(), this.deductWalletAmount()])
        },
        (error) => {
          if (error.status == 401) {
            this.router.navigate([
              `/${this.countryISO.getCountryCode()}/login`,
            ]);
          }
        }
      );
    let showMessage = 'Thank you for placing the order';

    this.router.navigate([`/${this.countryISO.getCountryCode()}/thank-you`], {
      state: { message: showMessage },
    });
  }
  /* to do check if wallet payment is selected or not */

  deductWalletAmount() {
    let data = {
      amountCredit: '0',
      amountDebit: this.checkoutService.throughWallet,
      message: `Deduction for Order Number ${this.orderId}`,
      type: 'Wallet',
      txnSource: 'Order',
      txnSourceId: this.orderId,
    };
    this.checkoutService.deductWallet(this.custID, data).subscribe(
      (response) => {
        if (this.checkoutService.paymenttype == 'prepaid') {
          this.toast.success('Amount deducted from wallet successfully!!');
        }
      },
      (error) => {
        this.checkoutService.rollbackOrderForCustomer(this.orderId);
        if (error.status == 401) {
          this.router.navigate([`/${this.countryISO.getCountryCode()}/login`]);
        }
      }
    );
  }
  orderId;
  deductPaymentFromCard() {
    let data = {
      cardholderName: this.checkoutService.card.name,
      customerId: this.custID,
      amount:
        this.checkoutService.cardPayment || this.checkoutService.orderTotal,
      orderId: this.orderId,
      cardNumber: this.checkoutService.card.cardNumber,
      expirationMonth: this.checkoutService.card.expirationMonth,
      expirationYear: this.checkoutService.card.expirationYear,
      saveCardForUser: this.checkoutService.saveCardForUser,
      //"paymentMethodToken": this.checkoutService.creditToken
      cardId: false,
    };
    if (this.checkoutService.saveCardForUser == false) {
      delete data.saveCardForUser;
    }
    this.checkoutService.paymentThroughCard(data).subscribe(
      (response) => {
        console.log(response, 'response is');
      },
      (error) => {
        this.checkoutService.rollbackOrderForCustomer(this.orderId);
        if (error.status == 401) {
          this.router.navigate([`/${this.countryISO.getCountryCode()}/login`]);
        }
      }
    );
  }

  emptyCustomerCart() {
    this.checkoutService.emptyCart(this.custID).subscribe(
      (response) => {
      },
      (error) => {
        if (error.status == 401) {
          this.router.navigate([`/${this.countryISO.getCountryCode()}/login`]);
        }
      }
    );
  }

  ngOnInit(): void {
    //this.orderService.initConfig()
    //alert(`total ${this.checkoutService.orderTotal}`)
    this.initConfig();
    this.title.setTitle(this.countryISO.MessageTitile.checkout);

    this.checkoutService.card = {};
    this.initializecomp();
  }

  token: any;
  hostedFieldsInstance: braintree.HostedFields;
  cardholdersName = 'sahil arora';
  public payPalConfig?: IPayPalConfig;
  showSuccess: boolean = false;
  initConfig = () =>
    new Promise((resolve, reject) => {
      this.payPalConfig = {
        currency: 'MYR',
        // clientId: 'AXucAHKWaWjHxwbKdorkRdDKdjgsd832zOVSZKiLG1PbObLio03NsxxXPJvqR04FoMQk7m4stXZdxlfX',
        clientId: environment.token_id,

        createOrderOnClient: (data) =>
          <ICreateOrderRequest>{
            intent: 'CAPTURE',
            purchase_units: [
              {
                amount: {
                  currency_code: 'MYR',
                  value: `${parseFloat(
                    this.checkoutService.orderData.walletPayment.methodOfPayment.card
                  ).toFixed(2)}`,
                  breakdown: {
                    item_total: {
                      currency_code: 'MYR',
                      value: `${parseFloat(
                        this.checkoutService.orderData.walletPayment.methodOfPayment.card
                      ).toFixed(2)}`,
                    },
                  },
                },
                items: [
                  {
                    name: 'Lumiere32my Order',
                    quantity: '1',
                    category: 'DIGITAL_GOODS',
                    unit_amount: {
                      currency_code: 'MYR',
                      value: `${parseFloat(
                        this.checkoutService.orderData.walletPayment.methodOfPayment.card
                      ).toFixed(2)}`,
                    },
                  },
                ],
              },
            ],
          },
        advanced: {
          extraQueryParams: [{ name: 'disable-funding', value: 'credit,card' }],
          commit: 'true',
        },
        style: {
          label: 'paypal',
          layout: 'vertical',
        },
        onApprove: (data, actions) => {
          console.log(
            'onApprove - transaction was approved, but not authorized',
            data,
            actions
          );
          actions.order.get().then((details) => {
            console.log(
              'onApprove - you can get full order details inside onApprove: ',
              details
            );
          });
        },
        onClientAuthorization: (data) => {
          this.checkoutService.orderData.walletPayment.methodOfPayment.paypal =
            parseFloat(this.checkoutService.orderTotal).toFixed(2);
          this.orderService.paypalDataForTransactionTable = data;
          // this.orderService.promiseArr.push(this.orderService.emptyCustomerCart(), this.orderService.deductStockFromDB())
          this.checkoutService.orderData.paypalDetails = {
            customerId: this.countryISO.getLoggedInCustomerId(),
            transactionId: data.id,
            amount: parseFloat(this.checkoutService.orderData.walletPayment.methodOfPayment.card).toFixed(2),
            paypal: data.payer,
            paymentType: 'sale',
            paymentFrom: 'paypal',
          };
          this.orderService.placeOrder();
          this.paypalDataForTransactionTable = data;
          resolve(data);
          this.showSuccess = true;
        },
        onCancel: (data, actions) => {
          this.router.navigate([`/${this.countryISO.getCountryCode()}/error-occured`] );
        },
        onError: (err) => {
          this.router.navigate(
            [`/${this.countryISO.getCountryCode()}/error-occured`],
            { state: { message: err } }
          );
          reject(err);
        },
        onClick: (data, actions) => {
          console.log('onClick', data, actions);
        },
      };
    });
}
