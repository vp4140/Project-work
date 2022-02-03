import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CheckoutService } from 'src/app/core/services/checkout.service';
import { ToastrService } from 'ngx-toastr';
import { OrderService } from 'src/app/core/services/order.service';
import { UserService } from 'src/app/core/services/user.service';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { IPayPalConfig } from 'ngx-paypal';

@Component({
  selector: 'app-card-details',
  templateUrl: './card-details.component.html',
  styleUrls: ['./card-details.component.scss'],
})
export class CardDetailsComponent implements OnInit {
  @ViewChild('cardForm') cardForm: NgForm;
  @Input() paypalDetail: any;
  panleExpanded = false;
  dabitCard: any;
  payPal: any;
  cvvNo: any;
  selectedCard: any = '';
  tempCarddisplay: boolean = true;
  expireYears: any = [];
  savedPaymentsArr: any = [];
  paymentArr: any = [{ card: 'Credit Card / Debit Card', value: '' }];
  isShow: boolean = false;
  selectedCredit: any;
  isCredit: boolean = false;

  convertHTML;
  previewHTML;
  ipay88: any;
  queryParam = {};
  orderData;
  productDescription = null;
  isCvvErr: boolean = false;
  showipay88 = false;
  paythrowPaypal = false;
  public payPalConfig?: IPayPalConfig;

  constructor(
    public service: CheckoutService,
    private sanitizer: DomSanitizer,
    private aRoute: ActivatedRoute,
    public Userservice: UserService,
    private toast: ToastrService,
    public orderservice: OrderService,
    private router: Router,
  ) {
    this.isShow = false;
    this.getAllYears();
    this.getSavedPayments();
    this.card = '';
    this.service.saveCardForUser = false;

    this.aRoute.queryParams.subscribe((params) => {
      this.queryParam['customerId'] = params['customerid'];
    });
  }

  getAllYears() {
    let dt = new Date();
    let currentYear: any = dt.getFullYear();
    console.log('get full year ...', currentYear);
    for (var i = currentYear; i < currentYear + 30; i++) {
      this.expireYears.push(i);
    }
    console.log('expire years push', this.expireYears);
  }
  ngOnInit(): void {
    this.loadIpay88Form();
  }

  loadIpay88Form() {
    // ORDER DETAIL FOR IPAY88 REQUEST PAYLOAD
    this.showNewCard = false;
    this.isCredit = false;
    this.isShow = false;
    const orders = JSON.parse(window.localStorage.getItem('order-data') || '');
    if (orders && orders.length > 0) {
      this.orderData = orders;
      this.orderData.forEach((order) => {
        this.productDescription =
          order['product']['id'] + ',' + this.productDescription;
      });
    }

    if (this.productDescription && this.queryParam['customerId']) {
      this.convertHTML = this.sanitizer;

      const req = {
        customerId: this.queryParam['customerId'],
        amount: +this.service.cardPayment || +this.service.orderTotal,
        productDescription: this.productDescription,
      };

      this.service.getIpay88Btn(req).toPromise().then((response: any) => {
        if (response) {
          this.previewHTML = response;
        }
      });
    }
  }

  SelectIpayOption() {
    this.isCredit = false;
    this.showipay88 = true;
    this.isShow = false;
    this.orderservice.paypalDisplay = false;
  }

  payWithIpay88() {
    (document.getElementById('ipay88Form') as HTMLFormElement).submit();
  }

  cardErrorDisplay: boolean = false;
  cardNumberErrorDisplay: boolean = false;
  checkChar(e, type) {
    switch (type) {
      case 'cvv':
        this.checkCVVValidation(e);
      case 'cardNumber':
        this.checkNumberValidation(e);
    }
  }
  checkNumberValidation(e) {
    console.log('e', e);
    let char = /^[0-9]+$/;
    if (!e.match(char)) {
      this.cardNumberErrorDisplay = true;
    } else {
      this.cardNumberErrorDisplay = false;
    }
  }
  checkCVVValidation(e) {
    console.log('e', e);
    let char = /^[0-9]+$/;
    if (!e.match(char)) {
      this.cardErrorDisplay = true;
    } else {
      this.cardErrorDisplay = false;
    }
  }
  cardData: any;
  cardNumber = '4582859896895675';
  verifyCard(value) {
    if (value.length == 16) {
      let data = {
        cardNumber: value,
      };
      this.service.verifyCard(data).subscribe(
        (response) => {
          this.cardData = response;
          this.cardData = this.cardData.data.isValid;
          console.log(this.cardData);
          this.service.cardVerify = this.cardData;
          console.log(this.service.cardVerify, 'card verify ??');
          if (this.service.cardVerify == true) {
            this.toast.success('Card Number Verified Successfully');
          } else {
            this.service.cardVerify = false;
          }
        },
        (error) => {
          console.log(error.status);
          this.service.cardVerify = false;
          this.toast.error('Enter Valid Card Number');
        }
      );
    }
  }
  CVVNumber: any = null;
  token: any;
  submit() {
    if (!this.service.card.cvv) {
      this.toast.info('Please enter cvv number');
      return;
    } else {
      console.log('paying through card..');
      this.service.userCardPayOption = 'card';
      this.orderservice.placeOrder();
    }

    // this.service.deductPaymentFromCard()
    this.cardForm.resetForm();
  }
  card: any = '';
  card2: any = 'card2';
  cardByUser(value, item) {
    console.log('card enter?');
    console.log(value);
    this.service.userCardPayOption = 'card';
    console.log('service user pay option..', this.service.userCardPayOption);
    this.service.creditToken = item.creditCard.token;
    console.log('item token is', item);
    console.log(this.service.creditToken.length);
    if (value != 'card') {
      this.showNewCard = false;
    }
  }
  showNewCard: boolean = false;
  changeCard(value) {
    this.showipay88 = false;
    this.service.userCardPayOption = value;
    this.service.saveCardForUser = false;
    if (value == 'credit') {
      this.showNewCard = true;
      this.isShow = false;
    } else if (value == 'saved') {
      this.showNewCard = false;
      // this.isShow=true;
    } else {
      this.showNewCard = false;
    }
  }

  // payment through saved cards
  paySavedCard(item: any) {
    if (
      this.cvvNo !== null &&
      this.cvvNo.toString().trim() !== '' &&
      this.cvvNo.length == 3 &&
      !isNaN(this.cvvNo)
    ) {
      this.service.userCardPayOption = 'card';
      this.service.card.cvv = this.cvvNo;
      this.service.card.cardId = item.creditCard?.id;
      this.service.card.name = item.creditCard?.name;
      this.orderservice.placeOrder();
    } else {
      this.isCvvErr = true;
    }
  }

  checkCvvNo(event) {
    this.isCvvErr =
      this.cvvNo !== null &&
        this.cvvNo.toString().trim() !== '' &&
        this.cvvNo.toString().trim().length === 3 &&
        !isNaN(this.cvvNo)
        ? false
        : true;
  }

  cardChecked(value) {
    //saveCardForUser
    console.log(value);
    this.service.saveCardForUser = value;
  }

  placeOrderFromWallet() {
    this.orderservice.placeOrder();
  }

  payWithPaypal() {
    this.paythrowPaypal = true;
    this.isShow = true;
    this.showipay88 = false;
    this.isCredit = false;
  }

  SelectpaypalOption() {
    this.showipay88 = false;
    this.isCredit = false;
    this.isShow = false;
    this.orderservice.paypalDisplay = true;
    this.service.userPayOption = 'paypal';
  }

  getSavedPayments() {
    let custId = localStorage.getItem('UserData')
      ? JSON.parse(localStorage.getItem('UserData'))
      : null;
    if (custId !== null && custId !== undefined) {
      custId = custId.body.data.customerId ? custId.body.data.customerId : null;
      this.service.getPaymentDetails(custId).subscribe((res: any) => {
        if (res.success) {
          this.savedPaymentsArr = res.data.allCards ? res.data.allCards : [];
        }
      });
    }
  }

  onItemChange(item) {
    this.cvvNo = null;
    this.isShow = true;
    this.isCvvErr = false;
    this.isCredit = false;
    this.showipay88 = false;
    this.selectedCredit = null;
    this.orderservice.paypalDisplay = false;
    this.service.saveCardForUser = false;
    this.selectedCard = item ? item.id : null;
    this.service.selectPaymentCard = item ? item.id : null;
  }

  creditCard(item) {
    this.service.selectedCreditCard = item ? item : null;
    this.selectedCard = null;
    this.service.selectPaymentCard = null;
    this.isShow = false;
    this.isCredit = true;
    this.showipay88 = false;
    this.orderservice.paypalDisplay = false;
  }

  placeOrderFrompaypal() {
    this.service.userPayOption = 'paypal';
    this.orderservice.placeOrder();
  }
}
