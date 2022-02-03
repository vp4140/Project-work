import { Component, OnInit } from '@angular/core';
import { CheckoutComponent } from 'src/app/core/content-pages/pages/checkout/checkout.component';
import { CheckoutService } from 'src/app/core/services/checkout.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2'
@Component({
  selector: 'app-billing-address',
  templateUrl: './billing-address.component.html',
  styleUrls: ['./billing-address.component.scss']
})
export class BillingAddressComponent implements OnInit {

  constructor(public service: CheckoutService, private toast: ToastrService) { }

  ngOnInit(): void {
  }

  saveAddress() {
    console.log("save address", this.service.newAddress)
    if (!this.service.newAddress.name || typeof this.service.newAddress.name == undefined || this.service.newAddress.name == "") {
      this.toast.error("Please Enter Name")
    } else if (!this.service.newAddress.clinicName || typeof this.service.newAddress.clinicName == undefined || this.service.newAddress.clinicName == "") {
      this.toast.error("Please Enter Clinic Name")
    } 
    else if (!this.service.newAddress.state || typeof this.service.newAddress.state == undefined || this.service.newAddress.state == "") {
      this.toast.error("Please Enter State")
    } 
    // else if (!this.service.newAddress.blockNo || typeof this.service.newAddress.blockNo == undefined || this.service.newAddress.blockNo == "") {
    //   this.toast.error("Please Enter Block Number")
    // } else if (!this.service.newAddress.floorNo || typeof this.service.newAddress.floorNo == undefined || this.service.newAddress.floorNo == "") {
    //   this.toast.error("Please Enter Floor Number")
    // }
    // else if (!this.service.newAddress.unitNo || typeof this.service.newAddress.unitNo == undefined || this.service.newAddress.unitNo == "") {
    //   this.toast.error("Please Enter Unit Number")
    // }
    // else if (!this.service.newAddress.buildingName || typeof this.service.newAddress.buildingName == undefined || this.service.newAddress.buildingName == "") {
    //   this.toast.error("Please Enter Building Name")
    // }
    // else if (!this.service.newAddress.streetName || typeof this.service.newAddress.streetName == undefined || this.service.newAddress.streetName == "") {
    //   this.toast.error("Please Enter Street Name")
    // }
    else if (!this.service.newAddress.country || typeof this.service.newAddress.country == undefined || this.service.newAddress.country == "") {
      this.toast.error("Please Choose Country")
    }
    else if (!this.service.newAddress.zip || typeof this.service.newAddress.zip == undefined || this.service.newAddress.zip == "") {
      this.toast.error("Please Enter Zip")
    } else {
      this.insertOrUpdateAddress()
      
    }

  }

  closePopup(){
    this.service.dialogDisplay = false;
  }
  insertOrUpdateAddress(){
    
    if (this.service.editCount == 0){
      console.log("enter in if ??? == 0")
      this.service.newAddress.customerId = this.service.customerId;
      this.service.saveNewDelieverAddress(this.service.newAddress).subscribe((response) => {
        console.log(response);
        this.service.dialogDisplay = false;
        this.service.newAddress = {}
        this.service.getUserAddress();
      }, (error) => {
        console.log(error);
      })
    } else if (this.service.editCount == 1){
      console.log("enter in else ?? ==11")
      this.service.newAddress.customerId = this.service.customerId;
      this.service.updateExistingDelieveryAddress(this.service.id,this.service.newAddress).subscribe((response) => {
        console.log(response);
        this.service.dialogDisplay = false;
        this.service.newAddress = {}
        this.service.getUserAddress();
      }, (error) => {
        console.log(error);
      })

    }
  

  }
}
