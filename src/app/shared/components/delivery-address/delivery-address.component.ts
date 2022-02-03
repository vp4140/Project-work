import { Component, OnInit } from '@angular/core';
import { CheckoutService } from 'src/app/core/services/checkout.service';
import Swal from 'sweetalert2';
import { CountryIsoService } from '../../../core/services/country-iso.service';
import * as CryptoJS from 'crypto-js';
@Component({
  selector: 'app-delivery-address',
  templateUrl: './delivery-address.component.html',
  styleUrls: ['./delivery-address.component.scss'],
})
export class DeliveryAddressComponent implements OnInit {
  display: boolean = false;

  constructor(
    public service: CheckoutService,
    private countryIso: CountryIsoService
  ) {
    this.service.orderStatusComments = null;
    console.log(this.service.alldeliveryData, 'del...');
    console.log(this.service.del, 'del...');
  }
  billingData: any;

  panleExpanded = false;
  delieverData: any;

  ngOnInit(): void {
    this.panleExpanded = true;

    this.billingData = JSON.parse(localStorage.getItem('UserData'));

    this.billingData = this.billingData.body.data;
  }

  editForm(item) {
    console.log(JSON.stringify(item));
    this.service.id = item.id;
    this.service.newAddress.name = item.name;
    this.service.newAddress.clinicName = item.clinicName;
    this.service.newAddress.blockNo = item.blockNo;
    this.service.newAddress.floorNo = item.floorNo;
    this.service.newAddress.unitNo = item.unitNo;
    this.service.newAddress.buildingName = item.buildingName;
    this.service.newAddress.streetName = item.streetName;
    this.service.newAddress.zip = item.zip;
    this.service.newAddress.country = item.country;
    this.service.newAddress.state = item.state;

    this.service.editCount = 1;
    this.service.editButtonDisplay = 'Update Address';
    this.service.dialogDisplay = true;
  }

  counter = 0;
  deliverOptionChosenByUser(value, i) {
    this.service.isDefaultDeliverySelected = value.isDefault as Boolean;
    this.service.delieverData = [value];
    this.delieverData = this.service.delieverData;

    this.service.delieveryPrice = parseFloat(
      this.service.delieverData[0].deliveryCharge
    );
    this.service.delieveryType = parseFloat(this.service.delieverData[0].id);
    this.service.delieveryPriceForUser.push(
      this.delieverData[0].deliveryCharge
    );
    this.service.minimumOrderAmount = parseFloat(
      this.delieverData[0].minimumOrderAmount
    );

    console.log('######################', this.service.delieveryPriceForUser);
    let arr = [];
    const allOrderData = JSON.parse(localStorage.getItem('order-data'));
    if (
      !allOrderData ||
      Object.keys(allOrderData).length == 0 ||
      !this.service.taxData ||
      Object.keys(this.service.taxData).length === 0
    ) {
      return;
    }
    allOrderData.forEach((elem) => {
      arr.push(elem.total);
    });
    let orderTotal = arr.reduce(function (a, b) {
      return a + b;
    });

    //order total
    this.service.orderTotalWithoutTax = orderTotal;
    this.service.orderTotal = orderTotal;

    if (
      this.service.promoDiscount ||
      localStorage.getItem('discount_applied')
    ) {
      //  this.toast.info("Promo applied successfully!")
      let discount: any = localStorage.getItem('discount_applied');
      var bytes = CryptoJS.AES.decrypt(discount, `${this.countryIso.getKey()}`);
      var originalText: any = bytes.toString(CryptoJS.enc.Utf8);

      this.service.promoDiscount = parseFloat(originalText); //localStorage.getItem('discount_applied')
      console.log('discount applied?', this.service.promoDiscount);
      console.log('....', orderTotal);
      console.log(this.service.orderTotal, 'order total..');
      this.service.orderTotal =
        orderTotal - parseFloat(this.service.promoDiscount);
      let taxAmount: any =
        (this.service.orderTotal * parseFloat(this.service.taxData.taxRate)) /
        100;
      // this.service.TAXAMOUNT = parseFloat(taxAmount).toFixed(2);
      // console.log('tax amount after discount', taxAmount);

      // this.service.orderTotal = this.service.orderTotal + taxAmount;
    }

    //order total with delivery charges
    this.service.delieveryPrice =
      this.service.orderTotal >= this.service.minimumOrderAmount &&
      this.service.isDefaultDeliverySelected
        ? 0
        : this.service.delieveryPrice;

    this.service.orderTotal =
      this.service.orderTotal +
      (this.service.orderTotal >= this.service.minimumOrderAmount &&
      this.service.isDefaultDeliverySelected
        ? 0
        : this.service.delieveryPrice);

    //tax amount
    let taxAmount: any =
      (this.service.orderTotal * parseFloat(this.service.taxData.taxRate)) /
      100;

    this.service.TAXAMOUNT = parseFloat(taxAmount).toFixed(2);

    //order total with tax amount
    this.service.orderTotal = this.service.orderTotal + taxAmount;

    console.log(this.service.orderTotal);
  }

  getCustomerDetailsForOrder(data) {
    this.service.orderData.orderDetails.Email = data.Email;
    this.service.orderData.orderDetails.mobileNumber = data.mobileNumber;
    this.service.orderData.orderDetails.billingClinicName = data.clinicName;
    this.service.orderData.orderDetails.billingClinicName = data.clinicName;
    this.service.orderData.orderDetails.billingBuildingName = data.buildingName;
    this.service.orderData.orderDetails.billingBlockNo = data.houseNo;
    this.service.orderData.orderDetails.billingFloorNo = data.floorNo;
    this.service.orderData.orderDetails.billingUnitNo = data.unitNo;
    this.service.orderData.orderDetails.billingStreetName = data.streetName;

    console.log('billing data', this.service.orderData.orderDetails);
    // this.service.orderData.orderDetails.billingCountrylid = data.countryId
  }

  addressByUser(value) {
    console.log(value, 'this is value');

    console.log('dddddd', this.service.userSelectDelieverAddress);
    console.log(this.service.delieveryAddress);
    this.service.delieveryAddress.some((elem) => {
      if (elem.id == value) {
        console.log('elem ?', elem);
        this.service.orderData.orderDetails.customerId = elem.customerId;
        this.service.orderData.orderDetails.customerName = elem.name;
        this.service.orderData.orderDetails.shippingClinicName =
          elem.clinicName;
        this.service.orderData.orderDetails.shippingBuildingName =
          elem.buildingName;
        this.service.orderData.orderDetails.shippingBlockNo = elem.blockNo;
        this.service.orderData.orderDetails.shippingFloorNo = elem.floorNo;
        this.service.orderData.orderDetails.shippingUnitNo = elem.unitNo;
        this.service.orderData.orderDetails.shippingStreetName =
          elem.streetName;
        this.service.orderData.orderDetails.shippingCountry = elem.country;
        this.service.orderData.orderDetails.shippingCountryId = elem.id;
        this.service.orderData.orderDetails.shippingPostcode = parseInt(
          elem.zip
        );
        this.service.orderData.orderDetails.state = elem.state;
        this.service.orderData.orderDetails.orderDate = new Date();
        // this.getCustomerDetailsForOrder(this.billingData)
      }
    });

    console.log(JSON.stringify(this.service.orderData));
  }

  showDialog() {
    this.service.newAddress = {};
    this.service.dialogDisplay = true;
    this.service.editCount = 0;
    this.service.editButtonDisplay = 'Add New Address';
  }

  delete(id) {
    console.log('id is', id);
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this imaginary file!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
    }).then((result) => {
      if (result.value) {
        this.service.deleteUserDelieverAddress(id).subscribe((response) => {
          console.log('Address deleted!');
          Swal.fire(
            'Deleted!',
            'Address has been deleted successfully!',
            'success'
          );
          this.service.getUserAddress();
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire('Cancelled', 'Your Address is safe :)', 'error');
      }
    });
  }

  Save() {
    if (this.service.delieveryAddress.length == 0) {
      Swal.fire('Please Add atleast one shipping address');
      return;
    } else {
      this.panleExpanded = false;
      this.service.activeStep4 = true;
    }
  }
}
