import { Component, OnInit } from '@angular/core';
import { CheckoutService } from 'src/app/core/services/checkout.service';
import { CountryIsoService } from '../../../core/services/country-iso.service';
@Component({
  selector: 'app-common-address',
  templateUrl: './common-address.component.html',
  styleUrls: ['./common-address.component.scss']
})
export class CommonAddressComponent implements OnInit {
  panleExpanded: boolean = false;
  constructor(public service: CheckoutService, private countryIso: CountryIsoService) { }

  ngOnInit(): void {
    this.panleExpanded = true;
    if (!this.service.userVerifiedDisplay) {
      this.service.activeStep2 = true;
    }
    console.log("ss", this.service.userBillingAddress.buildingName)
  }

  saveAddress() {
    console.log("ss", this.service.userBillingAddress)
    let errorInterval: any;
    errorInterval = setInterval(() => {
      if (this.service.userBillingAddress.name == "" || this.service.userBillingAddress.clinicName == "" 
      || this.service.userBillingAddress.state == "" 
        || this.service.userBillingAddress.zip == "") {
        this.showNullError = true;
        return
      } else {
        this.showNullError = false;
        clearInterval(errorInterval);
      }
    }, 500)

    setTimeout(() => {
      if (!this.showNullError) {
        this.saveBillingAddress()
        this.panleExpanded = false;
        this.service.activeStep3 = true;
      }
    }, 1000)



  }
  showNullError: boolean;
  saveBillingAddress() {
    let data = { ...this.service.userBillingAddress }
    data.pincode = data.zip
    delete data.zip
    delete data.name
    delete data.countryName
    data.houseNo = data.blockNo
    delete data.blockNo;
    data.customerId = this.countryIso.getLoggedInCustomerId()
    this.service.updateBillingAddress(data)
      .subscribe((response) => {
        // console.log(response)
      }, (error) => {
        console.log(error)
      })
  }
}
