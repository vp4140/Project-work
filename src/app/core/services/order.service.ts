import { Component, Injectable, OnInit } from '@angular/core';
import { ProductsService } from 'src/app/core/services/products.service';
import { CheckoutService } from 'src/app/core/services/checkout.service';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';
import * as braintree from 'braintree-web';
import { Router } from '@angular/router';
import { IPayPalConfig, ICreateOrderRequest, IMoney } from 'ngx-paypal';
import { CountryIsoService } from './country-iso.service';
import { UserService } from './user.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  paypalDisplay: boolean = true;
  allProductTotal: any;
  allOrderData: any;
  custID: any;
  custName: any;
  panleExpanded: boolean = false;
  paypalDataForTransactionTable: any;
  constructor(
    private service: ProductsService,
    public checkoutService: CheckoutService,
    private toast: ToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private countryISO: CountryIsoService,
    private userService: UserService
  ) {
    // this.checkoutService.getDelieveryData()
    // let sub = this.route
    //   .queryParams
    //   .subscribe(params => {
    //     // Defaults to 0 if no query param provided.
    //     this.custID = +params['customerid'] || 0;
    //     console.log(this.custID, "page it is")

    //   });
    if (!localStorage.getItem('UserData')) {
      console.log('no user found');
      //  this.toast.show("No User found")
    } else {
      this.checkoutService.billingAddress = JSON.parse(
        localStorage.getItem('UserData')
      );
      this.checkoutService.billingAddress =
        this.checkoutService.billingAddress.body.data;
      console.log(this.checkoutService.billingAddress, 'customer details');
      this.counttryRegion = this.checkoutService.billingAddress.countryRegionId;
      this.custID = this.countryISO.getLoggedInCustomerId();
      this.checkoutService.customerId = this.custID;
      this.custName = this.checkoutService.billingAddress.firstName;
      this.getOrderDataForCustomer();
      // this.getUserAddress()
      // this.allOrderData = JSON.parse(localStorage.getItem('order-data'))
      // Promise.all([this.checkoutService.getUserAddress(),
      // // this.calculateTotalAmount(),
      // this.getOrderDataForCustomer(), this.getBillingAddressOfUser(),
      // this.getAllSavedCardsOfCustomer(),
      // this.getAllCountry(), this.getVerifiedData(), this.getTaxDetail(), this.fetchBalance()

      // ])
      //this.checkWalletBalance()
    }
  }

  getBillingAddressOfUser() {
    this.userService.getProfilePersonalInfo().subscribe(
      (response) => {
        let mesg: any = response;
        mesg = mesg.data;
        console.log('shivank ... billing address', mesg);
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
          console.log('paylater balance', this.paylaterBalance);
        },
        (error) => {
          console.log(error);
          if (error.status == 401) {
            this.router.navigate([
              `/${this.countryISO.getCountryCode()}/login`,
            ]);
          }
        }
      );
  }
  getTaxDetail() {
    let data = JSON.parse(localStorage.getItem('country'));
    console.log('data tax is', data);

    data.some((elem) => {
      if (elem.id == this.counttryRegion) {
        this.checkoutService.taxData = elem.tax[0];
      }
    });
    console.log('region', this.counttryRegion);
    console.log('taxx data', this.checkoutService.taxData);
  }
  getVerifiedData() {
    if (this.countryISO.getCustomerNumberVerifiedOrNot() == 0) {
      // this.toast.show("Please verify your number")
      this.checkoutService.userVerifiedDisplay = true;
    } else if (this.countryISO.getCustomerNumberVerifiedOrNot() == 1) {
      this.checkoutService.userMobileNumber =
        this.countryISO.getCustomerNumber();
      this.checkoutService.userVerifiedDisplay = false;
      //this.toast.success("Number is already verified")
    }
  }
  counttryRegion: any;
  addBillingData(data) {
    console.log('dataaaa is', data);
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

    this.checkoutService.userBillingAddress.mobileNumber = data.mobileNumber;
    this.checkoutService.userBillingAddress.countryName =
      data.customerRegionName;
  }
  getAllSavedCardsOfCustomer() {
    this.checkoutService
      .getAllSavedCards(this.countryISO.getLoggedInCustomerId())
      .subscribe(
        (response) => {
          this.checkoutService.allCards = response;
          this.checkoutService.allCards = this.checkoutService.allCards.data;
          console.log(this.checkoutService.allCards, 'saved credit cards');
        },
        (error) => {
          console.log(error);
          // this.toast.error(error.message)
          if (error.status == 401) {
            this.router.navigate([
              `/${this.countryISO.getCountryCode()}/login`,
            ]);
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
  //     console.log("delievery types",this.checkoutService.del)
  //   },(error)=>{
  //     console.log(error)
  //   })
  // }
  // checkWalletBalance() {

  //   this.checkoutService.getWalletDetails(this.countryISO.getLoggedInCustomerId())
  //     .subscribe((response) => {
  //       this.checkoutService.walletBalance = response;
  //       this.checkoutService.payLaterBalance = response;
  //       this.checkoutService.walletBalance = parseFloat(this.checkoutService.walletBalance.data.wallet)
  //       this.checkoutService.payLaterBalance = parseFloat(this.checkoutService.payLaterBalance.data.payLaterL32)
  //       console.log(this.checkoutService.payLaterBalance, "ba;;;;;;;;;;;;;;;;;;;")
  //       console.log(this.checkoutService.orderTotal, "ba;;;;;;;;;;;;;;;;;;;")

  //       if (this.checkoutService.payLaterBalance >= this.checkoutService.orderTotal) {
  //         console.log("enter;;;;;;;;;;;;;;;;;;;;;;")
  //         this.checkoutService.payLaterIconDisplay = true
  //       } else {
  //         this.checkoutService.payLaterIconDisplay = false
  //       }

  //       if ( this.checkoutService.walletBalance <= this.checkoutService.orderTotal ){
  //         this.checkoutService.addMoneyDisplay = true
  //         this.checkoutService.carddisplay = true
  //       } else {
  //       this.checkoutService.carddisplay = false;
  //       }
  //       console.log("pay later balance from service...", this.checkoutService.payLaterBalance)
  //       console.log(this.checkoutService.walletBalance)
  //     }, (error) => {
  //       console.log(error)
  //       if (error.status == 401) {
  //         this.router.navigate([`/${this.countryISO.getCountryCode()}/login`])
  //       }
  //     })
  // }
  // calculateTotalAmount() {
  //   console.log('!!!!!',this.checkoutService.delieveryPriceForUser)
  //   let arr = []
  //   this.allOrderData.forEach((elem) => {
  //     arr.push(elem.total)
  //   })
  //   let orderTotal = arr.reduce(function (a, b) {
  //     return a + b
  //   });
  //   this.checkoutService.orderTotalWithoutTax = orderTotal
  //   this.checkoutService.orderTotal = orderTotal

  //   let taxAmount = (this.checkoutService.orderTotal * parseFloat(this.checkoutService.taxData.taxRate)) / 100
  //   console.log('pppppppppppp',this.checkoutService.delieveryPriceForUser[0] )
  //   this.checkoutService.orderTotal = this.checkoutService.orderTotal + taxAmount //parseFloat(this.checkoutService.delieveryPriceForUser[0]).toFixed()//- parseFloat(this.checkoutService.promoDiscount);
  //   if (this.checkoutService.promoDiscount) {
  //     this.toast.info("Promo applied successfully!")
  //     console.log("....", orderTotal)
  //     console.log(this.checkoutService.orderTotal, 'order total..')
  //     this.checkoutService.orderTotal = orderTotal - parseFloat(this.checkoutService.promoDiscount)
  //     let taxAmount = this.checkoutService.orderTotal * parseFloat(this.checkoutService.taxData.taxRate) / 100
  //     this.checkoutService.orderTotal = this.checkoutService.orderTotal + taxAmount
  //   }
  //   console.log(this.checkoutService.orderTotal)
  // }

  // getUserAddress(){
  //   this.checkoutService.getAllUserAddress(this.checkoutService.billingAddress.customerId)
  //   .subscribe((response)=>{
  //     this.checkoutService.delieveryAddress = response
  //     this.checkoutService.delieveryAddress = this.checkoutService.delieveryAddress.data.result
  //     console.log(this.checkoutService.delieveryAddress)
  //   },(error)=>{
  //     console.log(error)
  //   })
  // }

  segregateProducts() {
    let data: any = [];

    this.checkoutService.orderProductByCustomer.forEach((elem) => {
      data.push({
        quantity: elem.quantity,
        price: parseInt(elem.product.MRP),
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
    console.log(
      'product data is with name',
      this.checkoutService.orderData.productData
    );
  }
  listOfProductIds: any = [];
  getOrderDataForCustomer() {
    console.log(
      'customer id is',
      this.checkoutService.billingAddress.customerId
    );
    this.checkoutService
      .getOrderDetailsWRTCustomerID(this.countryISO.getLoggedInCustomerId())
      .subscribe(
        (response) => {
          this.checkoutService.orderProductByCustomer = response;
          this.checkoutService.orderProductByCustomer =
            this.checkoutService.orderProductByCustomer.data;
          //localStorage.setItem('order-data', JSON.stringify(this.checkoutService.orderProductByCustomer))

          console.log('ssss', this.checkoutService.orderProductByCustomer);
          this.checkoutService.orderProductByCustomer.forEach((elem) => {
            this.listOfProductIds.push(elem.product.id);
          });
          console.log('ids are', this.listOfProductIds);

          //this.calculateTotalAmount()
          //Promise.all([this.calculateTotalAmount()]);
          this.segregateProducts();
        },
        (error) => {
          console.log(error);
          if (error.status == 401) {
            this.router.navigate([
              `/${this.countryISO.getCountryCode()}/login`,
            ]);
          }
        }
      );
  }
  responseMesg: any;
  payType: any;
  checkRoute() {
    let showMessage = 'Thank you for placing the order';
    this.router.navigate([`/${this.countryISO.getCountryCode()}/thank-you`], {
      state: { message: showMessage },
    });
  }

  customerID: any;
  placeOrder() {
    this.checkoutService.orderData.walletPayment.listOfProductIds =
      JSON.stringify(this.listOfProductIds);
    this.checkoutService.orderData.walletPayment.productTotal = parseFloat(
      this.checkoutService.orderTotal
    ).toFixed(2);
    this.checkoutService.orderData.walletPayment.productTotal = parseFloat(
      this.checkoutService.orderTotalWithoutTax
    ).toFixed(2);
    this.checkoutService.orderData.walletPayment.totalAmountWithTax =
      parseFloat(this.checkoutService.orderTotal).toFixed(2);

    if (this.checkoutService['taxData'] && this.checkoutService['taxData']['taxRate']) {
      this.checkoutService.orderData.walletPayment.tax = parseFloat(
        this.checkoutService['taxData']['taxRate']
      );
    } else {
      this.checkoutService.orderData.walletPayment.tax = 0;
    }

    if (this.checkoutService['taxData'] && this.checkoutService['taxData']['taxId']) {
      this.checkoutService.orderData.walletPayment.taxCode = parseFloat(
        this.checkoutService['taxData']['taxId']);
    } else {
      this.checkoutService.orderData.walletPayment.taxCode = 0;
    }

    this.checkoutService.orderData.walletPayment.taxamount =
      this.checkoutService.TAXAMOUNT;
    this.checkoutService.orderData.orderDetails.customerName = this.custName;
    this.checkoutService.orderData.orderDetails.paymenttype =
      this.checkoutService.paymenttype;
    this.checkoutService.orderData.walletPayment.delieveryType =
      this.checkoutService.delieveryType;
    this.checkoutService.orderData.walletPayment.delieveryCharge =
      this.checkoutService.delieveryPrice;

    if (
      this.checkoutService.walletBalance >= this.checkoutService.orderTotal &&
      this.checkoutService.userWalletPayOption == 'wallet'
    ) {
      this.checkoutService.throughWallet = parseFloat(
        this.checkoutService.orderTotal
      ).toFixed(2);
      this.checkoutService.cardPayment = 0;
      //  alert('yo')
      this.checkoutService.carddisplay = false;
      this.checkoutService.selectPaymentCard = false //newly added
      this.checkoutService.selectedCreditCard = false //newly added
      this.checkoutService.saveCardForUser = false //newly added
    }
    this.checkoutService.orderData.walletPayment.methodOfPayment = {
      card: this.checkoutService.cardPayment,
      wallet: this.checkoutService.throughWallet,
      cod: this.checkoutService.cod,
    };

    this.checkoutService.orderData.walletPayment.discount =
      this.checkoutService.promoDiscount || 0;
    // this.checkoutService.orderData.orderDetails.orderStatus = "In Stock"
    this.checkoutService.orderData.orderDetails.orderStatus = 'Pending';
    this.checkoutService.orderData.orderDetails.billingClinicName =
      this.checkoutService.userBillingAddress.clinicName;
    this.checkoutService.orderData.orderDetails.billingBuildingName =
      this.checkoutService.userBillingAddress.buildingName;
    // this.service.orderData.orderDetails.billingBlockNo = data.houseNo
    this.checkoutService.orderData.orderDetails.deliveryInstruction =
      this.checkoutService.orderStatusComments;
    this.checkoutService.orderData.orderDetails.billingBlockNo =
      this.checkoutService.userBillingAddress.blockNo;
    this.checkoutService.orderData.orderDetails.billingFloorNo =
      this.checkoutService.userBillingAddress.floorNo;
    this.checkoutService.orderData.orderDetails.billingUnitNo =
      this.checkoutService.userBillingAddress.unitNo;
    this.checkoutService.orderData.orderDetails.billingStreetName =
      this.checkoutService.userBillingAddress.streetName;
    this.checkoutService.orderData.orderDetails.billingCountryName =
      this.checkoutService.userBillingAddress.countryName;
    this.checkoutService.orderData.orderDetails.billingCountryIid =
      this.checkoutService.userBillingAddress.country;
    this.checkoutService.orderData.orderDetails.customerName =
      this.checkoutService.userBillingAddress.name;
    this.checkoutService.orderData.orderDetails.Email =
      this.checkoutService.userBillingAddress.Email;
    this.checkoutService.orderData.orderDetails.mobileNumber =
      this.checkoutService.userMobileNumber; //this.checkoutService.userBillingAddress.mobileNumber
    this.checkoutService.orderData.orderDetails.billingPostcode =
      this.checkoutService.userBillingAddress.zip;
    this.checkoutService.orderData.orderDetails.customerId =
      this.countryISO.getLoggedInCustomerId();
    this.checkoutService.orderData.orderDetails.countryid =
      this.checkoutService.userBillingAddress.country;
    this.checkoutService.orderData.orderDetails.country =
      this.checkoutService.userBillingAddress.countryName;
    this.checkoutService.orderData.orderDetails.billingState =
      this.checkoutService.userBillingAddress.state;

    if (this.checkoutService.userPayOption === 'paypal' &&
      this.checkoutService.orderData.walletPayment.methodOfPayment &&
      Number(this.checkoutService.orderData.walletPayment.methodOfPayment.wallet) <= 0) {
      this.checkoutService.orderData.walletPayment.methodOfPayment.paypal =
        this.checkoutService.orderData.walletPayment.methodOfPayment.card;
      this.payType = 'Paypal';
      this.paypalDisplay = true;
      this.checkoutService.orderData.walletPayment.methodOfPayment.card = 0;
      this.orderInDb();
    } else if (this.checkoutService.userPayOption == 'paypal' &&
      this.checkoutService.userWalletPayOption == 'wallet' &&
      this.checkoutService.walletBalance > 0 &&
      this.checkoutService.useWallet) {
      this.checkoutService.orderData.walletPayment.methodOfPayment.paypal =
        this.checkoutService.orderData.walletPayment.methodOfPayment.card;
      this.payType = 'Wallet,Paypal';
      this.paypalDisplay = true;
      this.checkoutService.orderData.walletPayment.methodOfPayment.card = 0;
      this.orderInDb();
    } else if (this.checkoutService.userPayOption == 'paylater') {
      this.payType = 'PAY32-BNPL';
      this.checkoutService.orderData.orderDetails.dueDate =
        this.checkoutService.dueDate;
      this.checkoutService.orderData.walletPayment.methodOfPayment.paypal =
        this.checkoutService.orderData.walletPayment.totalAmountWithTax;
      this.orderInDb();
    } else if (
      this.checkoutService.userWalletPayOption == 'wallet' && this.checkoutService.userPayOption !== 'ipay88' &&
      this.checkoutService.userPayOption !== 'paypal' &&
      this.checkoutService.walletBalance >= this.checkoutService.orderTotal
    ) {
      this.payType = 'Wallet';
      this.orderInDb();
    } else if (this.checkoutService.userPayOption == 'cod') {
      this.payType = 'cod';
      this.checkoutService.orderData.walletPayment.methodOfPayment.cod =
        this.checkoutService.orderTotal;
      this.orderInDb();
    } else if (
      this.checkoutService.userCardPayOption == 'card' &&
      this.checkoutService.userWalletPayOption == 'wallet' &&
      this.checkoutService.walletBalance > 0 &&
      this.checkoutService.useWallet == true
    ) {
      // alert("there partial payment")
      this.checkoutService.orderData.walletPayment.methodOfPayment.wallet =
        this.checkoutService.orderTotal -
        this.checkoutService.orderData.walletPayment.methodOfPayment.card;
      this.checkoutService.throughWallet =
        this.checkoutService.orderData.walletPayment.methodOfPayment.wallet;
      this.payType = 'Wallet,Stripe';

      this.checkoutService.orderData.cardDetails = {
        cardholderName: this.checkoutService.card.name,
        customerId: this.countryISO.getLoggedInCustomerId(),
        amount:
          +this.checkoutService.cardPayment || +this.checkoutService.orderTotal,
        cardNumber: this.checkoutService.card.cardNumber,
        expirationMonth: this.checkoutService.card.expirationMonth,
        expirationYear: this.checkoutService.card.expirationYear,
        saveCardForUser: this.checkoutService.saveCardForUser || false,
        cvv: this.checkoutService.card.cvv,
        cardId: this.checkoutService.card.cardId,
      };

      this.orderInDb();
    } else if (this.checkoutService.userCardPayOption == 'card') {
      this.checkoutService.orderData.cardDetails = {
        cardholderName: this.checkoutService.card.name,
        customerId: this.countryISO.getLoggedInCustomerId(),
        amount:
          +this.checkoutService.cardPayment || +this.checkoutService.orderTotal,
        cardNumber: this.checkoutService.card.cardNumber,
        expirationMonth: this.checkoutService.card.expirationMonth,
        expirationYear: this.checkoutService.card.expirationYear,
        saveCardForUser: this.checkoutService.saveCardForUser || false,
        cvv: this.checkoutService.card.cvv,
        cardId: this.checkoutService.card.cardId,
      };
      this.payType = 'Stripe';
      this.orderInDb();
    } else if (this.checkoutService.userPayOption == 'ipay88' && this.checkoutService.userWalletPayOption !== 'wallet') {
      this.payType = 'iPay88';
      this.checkoutService.orderData.ipay88Details = {
        customerId: this.countryISO.getLoggedInCustomerId(),
        refNo: window.localStorage.getItem('refNo') || null,
        amount:
          +this.checkoutService.cardPayment || +this.checkoutService.orderTotal
      };

      const payMethod = JSON.parse(localStorage.getItem('payMethod'));
      const methodPayment = this.checkoutService.orderData.walletPayment.methodOfPayment;
      methodPayment.cod = 0;
      methodPayment[payMethod] = this.checkoutService.cardPayment;
      methodPayment.card = 0;

      this.orderInDb();
    } else if (
      this.checkoutService.userPayOption == 'ipay88' &&
      this.checkoutService.userWalletPayOption == 'wallet' &&
      this.checkoutService.walletBalance > 0 &&
      this.checkoutService.useWallet == true
    ) {
      this.payType = 'Wallet,iPay88';
      this.checkoutService.orderData.ipay88Details = {
        customerId: this.countryISO.getLoggedInCustomerId(),
        refNo: window.localStorage.getItem('refNo') || null,
        amount:
          +this.checkoutService.cardPayment || +this.checkoutService.orderTotal
      };

      const payMethod = JSON.parse(localStorage.getItem('payMethod'));
      const methodPayment = this.checkoutService.orderData.walletPayment.methodOfPayment;
      methodPayment.cod = 0;
      methodPayment[payMethod] = this.checkoutService.cardPayment;
      methodPayment.card = 0;

      this.orderInDb();
    }

    /* to do correct twilo logic once service get activated */
    // if (this.checkoutService.numberVerified != true) {
    //   this.toast.error("Please verify your number.")
    //   return;
    // }
    
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
    this.checkoutService
      .walletAdjustment(this.countryISO.getLoggedInCustomerId(), data)
      .subscribe(
        (response) => {
          let message: any = response;
          message = message.message;
          console.log('deducted from pay later', response);
        },
        (error) => {
          console.log(error);
          if (error.status == 401) {
            this.router.navigate([
              `/${this.countryISO.getCountryCode()}/login`,
            ]);
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
          console.log('response.', response);
          let mesg: any = response;
          mesg = mesg.response.message;
          // this.toast.success(mesg)
        },
        (error) => {
          console.log('error in deducting stock,try again later', error);
        }
      );
  }
  /* this function will enter details in transaction table */
  enterTransactionDetailsInApi() {
    console.log('order id ...', this.orderId);
    let data = {
      customerId: this.countryISO.getLoggedInCustomerId(),
      transactionId: this.paypalDataForTransactionTable.id,
      orderId: this.orderId,
      amount: parseFloat(this.checkoutService.orderTotal).toFixed(2),
      paypal: this.paypalDataForTransactionTable.payer,
      paymentType: 'sale',
      paymentFrom: 'paypal',
    };
    console.log('order id total ...', data);
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
    this.checkoutService.orderData.walletPayment.methodOfPayment.wallet =
      parseFloat(
        this.checkoutService.orderData.walletPayment.methodOfPayment.wallet
      ).toFixed(2);
    for (const item of this.checkoutService.orderProductByCustomer) {
      console.log('product data', this.checkoutService.orderProductByCustomer);
      if (item.quantity > item.stock) {
        this.toast.show(`${item.product.productName} Is out of stock`);
        return;
      }
    }
    let discount_id: any;
    if (localStorage.getItem('dis_id')) {
      discount_id = localStorage.getItem('dis_id');
    } else {
      discount_id = 0;
    }
    this.checkoutService
      .placeCustomerOrder(
        this.checkoutService.orderData,
        this.payType,
        discount_id
      )
      .subscribe(
        (response:any) => {
          this.responseMesg = response;
          if(response.response.status===201){
            localStorage.removeItem('order-data')
          }
          this.orderId = response;
          this.orderId = this.orderId.response.result.orderId;
          this.responseMesg = this.responseMesg.response.result.orderId;

          if (this.checkoutService.userPayOption === 'ipay88' && response && response['response']['status'] === 201) {
            localStorage.removeItem('transaction');
          }

          // if (this.checkoutService.userPayOption == "cod") {
          //   //alert("enter in cod section")
          //   Promise.all([this.promiseArr])
          // // }
          // if (this.checkoutService.userCardPayOption == "card" && this.checkoutService.userWalletPayOption == "wallet" && this.checkoutService.walletBalance > 0 && this.checkoutService.useWallet == true) {
          //   //alert("enter in card wallet section")
          //   Promise.all([this.promiseArr])
          //   Promise.all([this.deductPaymentFromCard(), this.deductWalletAmount()])

          // }
          // else if (this.checkoutService.userCardPayOption == "card") {
          //   //alert("enter in card")
          //   Promise.all([this.promiseArr])
          //   this.deductPaymentFromCard()
          // }
          // else if (this.checkoutService.userWalletPayOption == "wallet") {
          //  // alert("enter in wallet block")
          //   Promise.all([this.promiseArr])
          //   this.deductWalletAmount()
          // }

          // if (localStorage.getItem('dis_id')){
          //   /* entry in discount table*/
          //   this.couponUsed()
          // }
          let showMessage = 'Thank you for placing the order';
          
          this.router.navigate(
            [`/${this.countryISO.getCountryCode()}/thank-you`],
            { state: { message: showMessage } }
          );
        },
        (error) => {
          if (error.status == 401) {
            this.router.navigate([
              `/${this.countryISO.getCountryCode()}/login`,
            ]);
          } else {
            let showMessage =
              error.error.response.message || 'Please try again';
            this.router.navigate(
              [`/${this.countryISO.getCountryCode()}/error-occured`],
              { state: { message: showMessage } }
            );
          }
        }
      );
  }

  couponUsed() {
    let data: any = {
      orderId: this.orderId,
      promotionOffersId: localStorage.getItem('dis_id'),
    };
    this.checkoutService.couponUsedByCustomer(data).subscribe(
      (response) => {
        console.log('response for coupon', response);
      },
      (error) => {
        console.log(error);
      }
    );
  }

  /* to do check if wallet payment is selected or not */

  deductWalletAmount() {
    let data = {
      amountCredit: '0',
      amountDebit: +this.checkoutService.throughWallet,
      message: `Deduction for Order Number ${this.orderId}`,
      type: 'Wallet',
      txnSource: 'Order',
      txnSourceId: this.orderId,
    };
    this.checkoutService
      .deductWallet(this.countryISO.getLoggedInCustomerId(), data)
      .subscribe(
        (response) => {
          console.log(response);
          if (this.checkoutService.paymenttype == 'prepaid') {
            // this.toast.success("Amount deducted from wallet successfully!!")
          }
        },
        (error) => {
          console.log(error);
          this.checkoutService.rollbackOrderForCustomer(this.orderId);
          if (error.status == 401) {
            this.router.navigate([
              `/${this.countryISO.getCountryCode()}/login`,
            ]);
          }
        }
      );
  }
  orderId;
  deductPaymentFromCard() {
    console.log('data', this.orderId);
    let data = {
      cardholderName: this.checkoutService.card.name,
      customerId: this.countryISO.getLoggedInCustomerId(),
      amount:
        +this.checkoutService.cardPayment || +this.checkoutService.orderTotal,
      orderId: this.orderId,
      cardNumber: this.checkoutService.card.cardNumber,
      expirationMonth: this.checkoutService.card.expirationMonth,
      expirationYear: this.checkoutService.card.expirationYear,
      saveCardForUser: this.checkoutService.saveCardForUser || false,
      //"paymentMethodToken": this.checkoutService.creditToken,
      cvv: this.checkoutService.card.cvv,
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
        console.log(error);
        /* to do */
        //delete from order
        this.checkoutService.rollbackOrderForCustomer(this.orderId);
        if (error.status == 401) {
          this.router.navigate([`/${this.countryISO.getCountryCode()}/login`]);
        }
      }
    );
  }

  emptyCustomerCart() {
    this.checkoutService
      .emptyCart(this.countryISO.getLoggedInCustomerId())
      .subscribe(
        (response) => {
          console.log('remove products from carts', response);
          console.log('Removed all the products from the cart successfully!!');
        },
        (error) => {
          console.log(error);
          if (error.status == 401) {
            this.router.navigate([
              `/${this.countryISO.getCountryCode()}/login`,
            ]);
          }
        }
      );
  }
  ngOnInit(): void {
    this.checkoutService.card = {};
  }

}
