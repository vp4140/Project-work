import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { IPayPalConfig, ICreateOrderRequest } from 'ngx-paypal';
import { CheckoutService } from '../../../services/checkout.service';
@Component({
  selector: 'app-paypal',
  templateUrl: './paypal.component.html',
  styleUrls: ['./paypal.component.scss']
})
export class PaypalComponent implements OnInit {

  constructor(public checkoutService: CheckoutService) { }

  ngOnInit(): void {
    // this.initConfig()
  }

  public payPalConfig?: IPayPalConfig;
  showSuccess: boolean = false
  initConfig = () => new Promise((resolve, reject) => {
    // alert("service?") 
    this.payPalConfig = {
      currency: 'MYR',
      clientId: 'AXucAHKWaWjHxwbKdorkRdDKdjgsd832zOVSZKiLG1PbObLio03NsxxXPJvqR04FoMQk7m4stXZdxlfX',

      createOrderOnClient: (data) => <ICreateOrderRequest>{

        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'MYR',
            value: `${this.checkoutService.orderData.walletPayment.methodOfPayment.card}`,
            breakdown: {
              item_total: {
                currency_code: 'MYR',
                value: `${this.checkoutService.orderData.walletPayment.methodOfPayment.card}`
              }
            }
          },
          items: [{
            name: 'Enterprise Subscription',
            quantity: `${this.checkoutService.orderData.productData.length}`,
            category: 'DIGITAL_GOODS',
            unit_amount: {
              currency_code: 'MYR',
              value: `${this.checkoutService.orderData.walletPayment.methodOfPayment.card}`,
            },
          }]
        }]
      },
      advanced:

      {
        extraQueryParams: [{ name: "disable-funding", value: "credit,card" }],
        commit: 'true'
      },

      style: {
        label: 'paypal',
        layout: 'vertical'
      },
      onApprove: (data, actions) => {
        actions.order.get().then(details => {
          console.log('onApprove - you can get full order details inside onApprove: ', details);

        });
      },
      onClientAuthorization: (data) => {
        resolve(data)
        this.showSuccess = true;
      },
      onCancel: (data, actions) => {
        console.log('OnCancel', data, actions);
      },
      onError: err => {
        console.log('OnError', err);
        reject(err)
      },
      onClick: (data, actions) => {
        console.log('onClick', data, actions);
      },
    };
  })


}
