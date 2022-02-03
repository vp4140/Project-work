import { Component, OnInit } from '@angular/core';
import { CheckoutService } from 'src/app/core/services/checkout.service';
import { OrderService } from 'src/app/core/services/order.service';
import { UserService } from 'src/app/core/services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import { CountryIsoService } from '../../../core/services/country-iso.service';

@Component({
  selector: 'app-payment-method',
  templateUrl: './payment-method.component.html',
  styleUrls: ['./payment-method.component.scss'],
})
export class PaymentMethodComponent implements OnInit {
  payoption = 'wallet';
  walletRadio: any = 1;
  userselected: any;
  panleExpanded = false;

  convertHTML;
  previewHTML;
  ipay88: any;
  queryParam = {};
  orderData;
  productDescription = null;
  allOrderData;
  TAXAMOUNT: any;

  constructor(
    public service: CheckoutService,
    public orderservice: OrderService,
    private router: Router,
    private countryIso: CountryIsoService,
    public Userservice: UserService,
    private aRoute: ActivatedRoute
  ) {
    this.aRoute.queryParams.subscribe((params) => {
      this.queryParam['customerId'] = params['customerid'];
      this.queryParam['status'] = params['status'];
      this.queryParam['refNo'] = params['refNo'];
      this.queryParam['payMethod'] = params['payMethod'];

      if (
        this.queryParam['status'] === 'success' &&
        this.queryParam['refNo'] &&
        this.queryParam['payMethod']
      ) {
        // this.service.activeStep4 = false;
        window.localStorage.setItem('refNo', this.queryParam['refNo']);
        this.allOrderData = JSON.parse(localStorage.getItem('order-data'));

        const methodOfPayment = JSON.parse(
          localStorage.getItem('methodOfPayment') || ''
        );

        if (methodOfPayment) {
          const card = methodOfPayment['card'];
          const wallet = methodOfPayment['wallet'];
          const cod = methodOfPayment['cod'];
          const payMethod = this.queryParam['payMethod'];

          this.service.cardPayment = card;
          this.service.throughWallet = wallet;
          this.service.cod = cod;

          localStorage.setItem('payMethod', JSON.stringify(payMethod));
          this.calculateTotalAmount();

          if (wallet && wallet !== 0) {
            this.service.userPayOption = 'ipay88';
            this.service.userWalletPayOption = 'wallet';
            this.service.useWallet = true;
            this.service.walletBalance = wallet;
          } else {
            this.service.userPayOption = 'ipay88';
          }

          // setTimeout(() => {
          this.orderservice.placeOrder();
          // }, 100);
        }
      }
    });
  }

  calculateTotalAmount() {

    let arr = [];
    if (
      !this.allOrderData ||
      Object.keys(this.allOrderData).length == 0 ||
      !this.service.taxData ||
      Object.keys(this.service.taxData).length === 0
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
    this.service.orderTotalWithoutTax = orderTotal;
    this.service.orderTotal = orderTotal;

    //order total with discount if applied
    if (
      this.service.promoDiscount ||
      localStorage.getItem('discount_applied')
    ) {

      let discount: any = localStorage.getItem('discount_applied');
      var bytes = CryptoJS.AES.decrypt(discount, `${this.countryIso.getKey()}`);
      var originalText: any = bytes.toString(CryptoJS.enc.Utf8);

      this.service.promoDiscount = parseFloat(originalText); //localStorage.getItem('discount_applied')
      this.service.orderTotal =
        orderTotal - parseFloat(this.service.promoDiscount);
    }

    //order total with delivery charges
    this.service.delieveryPrice =
      this.service.orderTotal >=
        this.service.minimumOrderAmount &&
        this.service.isDefaultDeliverySelected
        ? 0
        : this.service.delieveryPrice;

    this.service.orderTotal =
      this.service.orderTotal +
      (this.service.orderTotal >=
        this.service.minimumOrderAmount &&
        this.service.isDefaultDeliverySelected
        ? 0
        : this.service.delieveryPrice);

    //tax amount
    let taxAmount: any =
      (this.service.orderTotal *
        parseFloat(this.service.taxData.taxRate)) /
      100;

    this.service.TAXAMOUNT = parseFloat(taxAmount).toFixed(2);

    //order total with tax amount
    this.service.orderTotal =
      this.service.orderTotal + taxAmount;
  }

  ngOnInit(): void {
    this.panleExpanded = true;
    this.userselected = 'wallet';
    this.userChoice('wallet');
    this.service.useWallet = true;

    if (
      this.service.activeStep4 &&
      (!this.queryParam['status'] || this.queryParam['status'] == undefined)
    ) {
      this.walletBalanceCalculate(true);
    }
  }
  //cardPayment:any;
  cardDisplay: boolean = true;
  walletPayButton: boolean = true;

  walletBalanceCalculate(value) {
    this.service.saveCardForUser = false //newly added
    if (this.service.walletBalance < this.service.cardPayAmount) {//newly added
      this.service.selectPaymentCard = false //newly added
      this.service.selectedCreditCard = false //newly added
    }//newly added

    const paymentMethod = this.service.orderData.walletPayment;
    paymentMethod.methodOfPayment = {
      card: this.service['cardPayment'],
      wallet: this.service.throughWallet,
      cod: this.service.cod,
    };

    if (value) {
      this.service.userWalletPayOption = 'wallet';
      this.service.useWallet = true;
      this.service.activeStep5 = true;
      this.service.addMoneyDisplay = true;
      if (this.service.orderTotal >= this.service.walletBalance) {
        this.cardDisplay = true;
        this.service.carddisplay = true;
        this.service.cardPayment =
          parseFloat(this.service.orderTotal) -
          parseFloat(this.service.walletBalance);
        if (this.service['cardPayment'] !== NaN) {
          this.service['cardPayment'] = this.service['cardPayment'].toFixed(2);
          paymentMethod.methodOfPayment.card = this.service['cardPayment'];
        }
        this.service.throughWallet = this.service.walletBalance;
        paymentMethod.methodOfPayment.wallet = this.service.walletBalance;
        this.walletPayButton = false;
      } else if (this.service.orderTotal <= this.service.walletBalance) {
        this.service.throughWallet = parseFloat(
          this.service.orderTotal
        ).toFixed(2);
        paymentMethod.methodOfPayment.wallet = parseFloat(
          this.service.orderTotal
        ).toFixed(2);
        this.service.cardselected = false;
        this.service.selectPaymentCard = null //newly added
        this.service.selectedCreditCard = null //newly added
        this.service.cardPayment = 0;
        paymentMethod.methodOfPayment.card = 0;
        this.walletPayButton = true;
        this.service.carddisplay = false;
      }
    } else {
      this.service.userWalletPayOption = '';
      this.service.carddisplay = true;
      this.service.useWallet = false;
      this.service.activeStep5 = false;
      this.service.throughWallet = 0;
      paymentMethod.methodOfPayment.wallet = 0;
      this.walletPayButton = false;
      this.service.addMoneyDisplay = false;
      // this.service.pay
      this.service.cardPayment = parseFloat(this.service.orderTotal).toFixed(2);
      paymentMethod.methodOfPayment.card = parseFloat(
        this.service.orderTotal
      ).toFixed(2);
      this.cardDisplay = true;
      this.service.cardselected = true;
      if (this.service.userPayOption == 'wallet') {
        this.sectionDisplay = true;
        this.userselected = 'wallet';
      }
    }
    localStorage.setItem(
      'methodOfPayment',
      JSON.stringify(paymentMethod.methodOfPayment)
    );
  }

  contactUs() {
    this.router.navigate([`/${this.countryIso.getCountryCode()}/contact-us`]);
  }
  sectionDisplay: boolean = true;
  paylaterButtonDispaly: boolean = true;
  message: any;
  userPayOption(value) {
    this.payoption = value;
    if (value == 'cod') {
      this.walletRadio = 0;
      this.service.userWalletPayOption = null;
      this.sectionDisplay = false;
      this.orderservice.paypalDisplay = false;
      this.service.cardselected = false;
      this.service.selectPaymentCard = null //newly added
      this.service.selectedCreditCard = null //newly added
      this.service.paymenttype = 'cod';
      this.service.cardPayment = 0;
      this.service.throughWallet = 0;
      this.service.toastMessage =
        'Amount will be collected once the order has been delieverd to you';
    } else if (value == 'wallet') {
      // alert("yaha ?")
      this.walletRadio = 1;
      this.orderservice.paypalDisplay = false;
      this.sectionDisplay = true;
      this.service.paymenttype = 'prepaid';
      this.service.userWalletPayOption = 'wallet';
      this.service.cod = 0;
      this.service.cardselected = true;
      // this.sectionDisplay = true
      const productArr = [];
      const allOrderData = JSON.parse(localStorage.getItem('order-data'));
      if (allOrderData && allOrderData.length > 0) {
        allOrderData.forEach((elem) => {
          productArr.push(elem.total);
        });
      }
      let orderTotal = productArr.reduce(function (a, b) {
        return a + b;
      });
      this.service.orderTotal = orderTotal;

      if (this.service.walletBalance >= this.service.orderTotal) {
        this.service.throughWallet = parseFloat(
          this.service.orderTotal
        ).toFixed(2);
        this.service.cardPayment = 0;
        //  alert('yo')
        this.service.carddisplay = false;
      } else {

        this.service.cardPayment =
          parseFloat(this.service.cardPayment) +
          parseFloat(this.service.delieveryPrice);
        this.service.cardPayment = parseFloat(this.service.cardPayment).toFixed(
          2
        );
        // this.service.carddisplay = true;
        this.walletBalanceCalculate(true);
      }

      // this.service.cardPayment = parseFloat(this.service.orderTotal).toFixed(2)
      if (this.walletPayButton) {
        this.service.cardselected = false;
        this.service.selectPaymentCard = null //newly added
        this.service.selectedCreditCard = null //newly added
      }
      this.service.toastMessage = 'Amount has been deducted successfully';
    } else if (value == 'paylater') {
      //this.walletRadio = 0
      this.orderservice.paypalDisplay = false;
      this.paylaterButtonDispaly = false;
      if (this.service.payLaterBalance >= this.service.orderTotal) {
        this.service.userWalletPayOption = null;
        this.paylaterButtonDispaly = true;
        this.orderservice.paypalDisplay = false;
        this.sectionDisplay = false;
        this.service.cardselected = false;
        this.service.selectPaymentCard = null //newly added
        this.service.selectedCreditCard = null //newly added
        this.service.paymenttype = 'prepaid';
        this.service.paymenttype = 'paylater';
        this.service.cardPayment = 0;
        this.service.throughWallet = 0;
        this.service.dueDate = new Date();
        this.service.dueDate = this.service.dueDate.setDate(
          this.service.dueDate.getDate() + 90
        );
        this.service.dueDate = new Date(this.service.dueDate);
        this.service.toastMessage = 'Amount will be settled later..';
        this.orderservice.paypalDisplay = false;
      } else {
        this.message =
          'Not enough Credit Balance ,Please reach out to us for credit.';
        this.paylaterButtonDispaly = false;
      }
    }
  }
  walletDisplay: boolean = true;
  userChoice(value) {
    if (value != 'wallet') {
      this.sectionDisplay = false;
      this.service.cardselected = false;
      this.service.selectPaymentCard = null //newly added
      this.service.selectedCreditCard = null //newly added
      this.walletPayButton = true;
      this.service.addMoneyDisplay = true;
    }
    this.service.userPayOption = value;
    this.userPayOption(value);
  }
  addMoney() {
    this.router.navigate([`/${this.countryIso.getCountryCode()}/pay32/top-up`]);
  }
  placeOrderFromWallet() {
    this.orderservice.placeOrder();
  }

  placeOrderFromCOD() {
    this.orderservice.placeOrder();
  }

}
