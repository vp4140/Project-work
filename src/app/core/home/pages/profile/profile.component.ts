import { Component, OnInit } from '@angular/core';
import { ChangePasswordComponent } from 'src/app/shared/components/change-password/change-password.component';
import { MatDialog } from '@angular/material/dialog';
import { SavedPaymentDetailsComponent } from 'src/app/shared/components/saved-payment-details/saved-payment-details.component';
import { UserService } from 'src/app/core/services/user.service';
import { HttpResponse } from '@angular/common/http';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AddAddressComponent } from 'src/app/shared/components/add-address/add-address.component';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/core/services/auth.service';
import { CountryIsoService } from '../../../services/country-iso.service';
import { Title } from '@angular/platform-browser';
import { event } from 'jquery';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { promise } from 'protractor';
declare var $: any;
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  practises: string[];
  postal: any;
  public toggleButton: boolean = true;
  profileDetails: any;
  personalDetailForm: FormGroup;
  isSubmitted: boolean = false;
  personalDetailFormDetails: any;
  profileBillingDetails: any;
  addressDetail: any;
  default: boolean = true;
  defaultAddressDetail: any;
  public loading = false;
  private _unsubscribe = new Subject<boolean>();
  countryMaxLenMap = new Map();
  countryMapIsAlpha = new Map();
  countryMinLenMap = new Map();
  codes: any = [];
  countries: any = [];
  selected_countryCode: any;
  selected_country: any;
  countryValue: any;
  selected_speciality: any;
  min_pincode_length: number;
  pincode_length: number;
  dataLoaded: boolean = true;
  specialities: any = [];
  pincode: { countryname: string; pincode: number; mobile: number; }[];
  errorMessage: string;
  errorMessages: string;
  ButtonDisbaled: boolean = true;
  loadedCountryId: number;
  postalcode: any;
  arrayData: any;
  isAlpha: boolean;
  constructor(
    private dialog: MatDialog,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private authService: AuthService,
    private titleService:Title,
    private conuntryIso : CountryIsoService
  ) {
    var json: any = JSON.parse(localStorage.UserData);
    this.loadedCountryId = json.body.data.countryId;
    this.custId = json.body.data.customerId;
    this.ngOnInit();
    
  }

  ngOnInit(): void {
    this.pincode = [
      {
        'countryname': 'usa',
        'pincode': 5,
        'mobile': +41
      },
      {
        "countryname": "malaysia"
        , "pincode": 5,
        "mobile": +41
      }
    ]
   
    this.getSpecialities();
    this.getProfileAddressDetails();
    this.authService.getCountry().subscribe(
      (response: HttpResponse<any>) => {
        if (response.body.data != null) {
          console.log(response.body.data)
          this.countries = response.body.data;
          this.countries.map(i => {
            i.label = i.country;
            i.value = i.id;
          })
          response.body.data.forEach(element => {
            this.codes.push({
              label: element.phoneCode,
              value: element.phoneCode
            });
          });       
        }
      },
      (error) => {
        this.loading = false

      }
    )
    this.selected_country = [];
    this.selected_countryCode = "";
    this.selected_speciality = "";
    this.initForm();
    this.getCountriesList();
    this.titleService.setTitle(this.conuntryIso.MessageTitile.profile);
  }
  getSpecialities() {

    this.authService.getSpeciality().subscribe(
      (response: HttpResponse<any>) => {
        if (response.body.data.result != null) {
          response.body.data.result.forEach(element => {
            this.specialities.push({
              label: element.specialityName,
              value: element.specialityName
            });
          });
        }
        return this.specialities;
      },
      (error) => {

      }
    )
  }
  enable() {
    this.ButtonDisbaled = false
    this.toggleButton = false
  }
  get profileControls() {
    return this.personalDetailForm.controls;
  }

  initForm() {
    this.personalDetailForm = new FormGroup({
      "email": new FormControl('', [
        Validators.required,
        Validators.pattern('^[A-Z0-9a-z._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,3}$')]),
      "country": new FormControl(),
      "name": new FormControl('', Validators.required),
      "lname": new FormControl('', Validators.required),
      "clinicName": new FormControl('', Validators.required),
      "mobile": new FormControl('', [
        Validators.required,
        Validators.pattern('^[0-9\+\-]{5,15}$')]),
      "speciality": new FormControl('', [
        Validators.required]),
      "practiceType": new FormControl('', Validators.required),
      "blockNo": new FormControl(),
      "floorNo": new FormControl(),
      "code": new FormControl('', Validators.required),
      "unitNo": new FormControl(),
      "streetName": new FormControl(),
      "building": new FormControl('', Validators.required),
      "state": new FormControl('', Validators.required),
      "postal": new FormControl('',
        [Validators.required,Validators.pattern('^[0-9]*$')])
    });
    this.onProfileInfo()

    this.practises = ['Medical', 'Dental', 'Other'];

  }


  getCountriesList(){
    this.conuntryIso.getCountriesList().pipe(takeUntil(this._unsubscribe)).subscribe(
      (success: any) => {
        this.arrayData =  this.arrayOfObjects(success.data);
        console.log("Array Data,", this.arrayData);
        this.getCountryDetail(this.loadedCountryId);
      },
      error => {
    
      }
    )
   
  }
  onChangecountry(event){
    let country_new_id = event.value;
    this.loadedCountryId = country_new_id;
    this.getCountryDetail(this.loadedCountryId)
  }

  getCountryDetail(event) {
    console.log(event)
    var changedCountry =  event;
    this.loadedCountryId = parseInt(changedCountry);
    this.arrayData.forEach((element) => {
      this.countryMapIsAlpha.set(element.id, element.isAlpha)
      this.countryMaxLenMap.set(element.id, element.max_length)
      this.countryMinLenMap.set(element.id, element.min_length)
     
    });
    this.isAlpha = this.countryMapIsAlpha.get(this.loadedCountryId)
    if (this.isAlpha == false){
      this.pincode_length = this.countryMaxLenMap.get(this.loadedCountryId);
      this.min_pincode_length =this.countryMinLenMap.get(this.loadedCountryId);
      console.log("false Alpha", this.pincode_length, this.min_pincode_length);
      this.personalDetailForm.controls["postal"].setValidators(
        [Validators.required, Validators.pattern('^[0-9]*$'), 
        Validators.maxLength(this.countryMaxLenMap.get(this.loadedCountryId)), 
        Validators.minLength(this.countryMinLenMap.get(this.loadedCountryId))]
      );
    }
    else{
      
      this.pincode_length = this.countryMaxLenMap.get(this.loadedCountryId);
      this.min_pincode_length =this.countryMinLenMap.get(this.loadedCountryId);
      console.log("true Alpha", this.pincode_length, this.min_pincode_length);
      this.personalDetailForm.controls["postal"].setValidators(
        [Validators.required, Validators.pattern('^[a-zA-Z0-9]*$'), 
        Validators.maxLength(this.countryMaxLenMap.get(this.loadedCountryId)), 
        Validators.minLength(this.countryMinLenMap.get(this.loadedCountryId))]
      );
    }
    this.personalDetailForm.controls.postal.updateValueAndValidity();
  }

  arrayOfObjects(arr: any[]) {
    const newArray = [];
    if (arr != []) {
      arr.forEach(element => {
        newArray.push({
          isAlpha: element.countries.isAlpha,
          id: element.id,
          max_length: element.countries.pncodeLength,
          min_length: element.countries.minpncodeLength
        });
      });
    }
    return newArray;
  }

  onProfileInfo() {
    this.userService.getProfilePersonalInfo().subscribe(
      (response: HttpResponse<any>) => {

        this.profileDetails = response.body.data
        this.personalDetailForm.patchValue({
          "email": this.profileDetails.Email,
          "name": this.profileDetails.firstName,
          "lname": this.profileDetails.lastName,
          "clinicName": this.profileDetails.clinicName,
          // "code": parseInt(this.profileDetails.countryCode),
          "mobile": this.profileDetails.mobileNumber,
          //"speciality" : this.profileDetails.speciality,
          "practiceType": this.profileDetails.practiceType,
          "blockNo": this.profileDetails.houseNo,
          "floorNo": this.profileDetails.floorNo,
          "unitNo": this.profileDetails.unitNo,
          "streetName": this.profileDetails.streetName,
          "building": this.profileDetails.buildingName,
          "state": this.profileDetails.state,
          "postal": this.profileDetails.pincode,
        })

        if (this.profileDetails.country != null) {
          this.selected_country = this.profileDetails.country.id
        }
        this.selected_countryCode = parseInt(this.profileDetails.countryCode)
        this.selected_speciality = this.profileDetails.speciality

      },
      (error) => {
        this.loading = false

      }
    )
  }

  getProfileAddressDetails() {

    this.loading = true;
    this.userService.getProfileAddressDetails(this.custId).subscribe(
      (response: HttpResponse<any>) => {
        console.log("response....", response)
        this.loading = false;
        this.addressDetail = response.body.data.result
      },
      (error) => {
        console.log("address issue", error)
        this.loading = false
      }
    )
  }
  setDefault(id) {
    document.getElementById('default').classList.add('blue')
    this.default = false;
    this.defaultAddressDetail = this.addressDetail.filter(item => item.id === id)
    this.userService.onUpdateAddDefault(this.defaultAddressDetail, id).subscribe(
      (success) => {
        this.getProfileAddressDetails();
      },
      (error) => {
        this.loading = false
      }
    )
  }
  custId: any;

  findInvalidControls() {
    const invalid = [];
    const controls = this.personalDetailForm.controls;
    for (const name in controls) {
        if (controls[name].invalid) {
            invalid.push(name);
        }
    }
    console.log(invalid);
}


  onSubmit() {

    console.log('check form valid?',this.personalDetailForm.invalid)
    this.loading = true
    this.isSubmitted = true;
    if (this.personalDetailForm.invalid) {
      this.loading = false;
      this.findInvalidControls()
      return
    }

    this.custId = this.conuntryIso.getLoggedInCustomerId()
    console.log("customer id",this.custId)
    this.personalDetailFormDetails = {
      "Email": this.personalDetailForm.get('email').value,
      "firstName": this.personalDetailForm.get('name').value,
      "lastName": this.personalDetailForm.get('lname').value,
      "clinicName": this.personalDetailForm.get('clinicName').value,
      "houseNo": this.personalDetailForm.get('blockNo').value,
      "floorNo": this.personalDetailForm.get('floorNo').value,
      "unitNo": this.personalDetailForm.get('unitNo').value,
      "streetName": this.personalDetailForm.get('streetName').value,
      "buildingName": this.personalDetailForm.get('building').value,
      "state": this.personalDetailForm.get('state').value,
      "practiceType": this.personalDetailForm.get('practiceType').value,
      "pincode": this.personalDetailForm.get('postal').value,
      "mobileNumber": this.personalDetailForm.get('mobile').value,
      "customerId": parseInt(this.custId),
      "countryId": this.conuntryIso.getCountryId(),//this.personalDetailForm.get('country').value,
      "countryCode": this.personalDetailForm.get('code').value,
      "speciality": this.personalDetailForm.get('speciality').value,
    }
    this.userService.postProfilePersonalInfo(this.personalDetailFormDetails).subscribe(
      (success) => {

        this.loading = false;
        this.toastr.success("Profile Details Updated")
        this.toggleButton = true

      },
      (error) => {
        this.loading = false;
        this.toastr.error(error.message)
      }
    )
  }

  removeAddress(id: number) {
    this.loading = true
    this.userService.onDeleteAddress(id).subscribe(

      (response) => {
        this.getProfileAddressDetails();

        let msg: any = response.body;
        msg = msg.data
        this.toastr.success(msg)
      },
      (error) => {
        this.loading = false;
        this.toastr.error(error.message)
      }
    )
  }
  openDialog() {
    const dialogRef = this.dialog.open(ChangePasswordComponent, {
      width: '666px'
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }
  openDialog2() {
    const dialogRef = this.dialog.open(SavedPaymentDetailsComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }


  openDialog3() {
    const dialogRef = this.dialog.open(AddAddressComponent, {
    });
    dialogRef.afterClosed().subscribe(result => {
      this.getProfileAddressDetails();
    });
  }
  openDialog4(id: number) {
    console.log("id ??", id)
    const dialogRef = this.dialog.open(AddAddressComponent, {
      data: { id: id }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log("result ?", result)
      this.getProfileAddressDetails();
    }, (error) => {
      console.log("errror in fetching address", error)
    });
  }
  onChange(event) {
    console.log('event :' + event);
    console.log(event.value);
    console.log(this.pincode);
    for (var i = 0; i <= this.pincode.length; i++) {
      if (event.value != this.pincode[i].mobile) {
        console.log(event.value);
        console.log(this.pincode[i].mobile);
        this.errorMessage = "Country code is not correct";
        this.ButtonDisbaled = true;
        console.log(this.errorMessage);
      }
      else {
        this.errorMessage = '';
        this.ButtonDisbaled = false;
      }
    }
  }
  onKeyUp(event: HTMLInputElement) {
    // console.log(event);
    // // var myLength = $("#mytextbox").val();
    // // console.log(myLength);
    // console.log(this.postal);//postal code
    // console.log(this.postal.length);
    // console.log("pin code...", this.pincode)
    // for (var i = 0; i <= this.pincode.length; i++) {
    //   if (this.postal.length == this.pincode[i].pincode) {
    //     this.errorMessages = '';
    //     this.ButtonDisbaled = false;
    //   }
    //   else {

    //     console.log(this.postal.length);
    //     console.log(this.pincode[i].pincode);
    //     this.errorMessages = "Pincode is not correct";
    //     this.ButtonDisbaled = true;
    //     console.log(this.errorMessages);
    //   }
    // }

  }
}
