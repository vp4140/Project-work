import { Component, OnInit } from '@angular/core';
import { CheckoutService } from "src/app/core/services/checkout.service";
import Swal from 'sweetalert2'
import { CountryIsoService } from '../../../core/services/country-iso.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-mobile-updates',
  templateUrl: './mobile-updates.component.html',
  styleUrls: ['./mobile-updates.component.scss']
})
export class MobileUpdatesComponent implements OnInit {
  panleExpanded = false;
  constructor(
    public service: CheckoutService,
    public countryIso: CountryIsoService,
    private toast: ToastrService
  ) {
  }

  ngOnInit(): void {
    
    /* to do remove below four lines */
    //this.readAccess = true;
    // this.service.userVerifiedDisplay = false
    // this.service.numberVerified = true;
    // this.service.activeStep2 = true;

  }

  readAccess: boolean = false;
  authCode: any;
  countryRegion: any
  verifyNumber() {
    let data = {
      to: this.countryRegion + this.service.userMobileNumber
    }

    this.service.varifyMobileNumber(data)
      .subscribe((response) => {
        console.log(response)
        this.readAccess = true;
      }, (error) => {
        console.log(error)
      })

  }

  resp: any;
  submitCode() {
    let data = {
      to: this.countryRegion + this.service.userMobileNumber,
      code: this.authCode
    }
    console.log(data)
    this.service.varifyMobileNumber(data)
      .subscribe((response) => {
        console.log(response)
        this.resp = response;

        if (this.resp.success == true && this.resp.message == "Token verified.") {
          if (this.resp.data.detail[1].status == "pending") {
            Swal.fire("Please enter a valid code")
          } else {
            Promise.all([this.giveAccessToUser(), this.saveVerificationInDB()])
          }
        }
      }, (error) => {
        Swal.fire("Please enter correct auth code")
        console.log(error)
      })

  }
  giveAccessToUser() {
    //  this.readAccess = true;
    this.service.userVerifiedDisplay = false
    this.service.numberVerified = true;
    this.service.activeStep2 = true;
    //Swal.fire("Number Verified successfully")
  }
  saveVerificationInDB() {
    let data = {
      "shippingMobileNo": this.countryRegion + this.service.userMobileNumber,
      "shippingMobileVerify": 1
    }
    this.service.verifynumberOfCustomerSaveInDb(this.countryIso.getLoggedInCustomerId(), data).subscribe((response) => {
      console.log(response);
      this.countryIso.setShippingMobileNo(this.countryRegion + this.service.userMobileNumber)
      this.toast.show(this.countryIso.setMobileVerfiedValueInStorage())
    }, (error) => {
      console.log(error)
      Swal.fire('Some issue occured,Please reach out to your admin')
    })
  }
  handleEvent(value) {
    console.log("value", value)

    if (this.resp == "approved") {
      this.service.userVerifiedDisplay = false
      // Swal.fire("Number Verified successfully !!")
    }
    if (this.resp == "pending") {
      this.service.userVerifiedDisplay = true
      this.readAccess = true;
      Swal.fire("Please try again later")
    }

    if (value.action == 'done') {
      if (this.resp == "approved") {
        this.service.userVerifiedDisplay = false
        //  Swal.fire("Number Verified successfully")
      }
      if (this.resp == "pending") {
        this.service.userVerifiedDisplay = true
        this.readAccess = true;
        Swal.fire("Please try again")
      }
      if (this.resp != "pending" || this.resp != "approved") {
        this.service.userVerifiedDisplay = true
        this.readAccess = false;
        Swal.fire("Session Time Out, Please try again")
      }

    }

  }

  changeLogin() {
    this.service.userVerifiedDisplay = true;
    this.readAccess = false;
    this.authCode = "";
    this.countryRegion = "";
    this.service.userMobileNumber = ""
  }

//newly added
  changeMobNo(){
    this.service.userVerifiedDisplay = true;
    this.readAccess = false;
    this.authCode = "";
    this.countryRegion = "";
    this.service.userMobileNumber = ""
  }
}
