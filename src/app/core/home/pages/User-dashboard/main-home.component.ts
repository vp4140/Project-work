import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/core/services/user.service';
import { Title } from '@angular/platform-browser';
import { CountryIsoService } from '../../../services/country-iso.service';

@Component({
  selector: 'app-main-home',
  templateUrl: './main-home.component.html',
  styleUrls: ['./main-home.component.scss']
})
export class MainHomeComponent implements OnInit {

  constructor(
    public service: UserService,
    private titleService:Title,
    public countryISO: CountryIsoService
  ) {
    this.getDashData()

  }

  dashResponse:any;
  getDashData(){
    let id = JSON.parse(localStorage.getItem('UserData'))
    id = id.body.data.customerId
    console.log("id ..",id)
    //let type = "Wallet"
    this.service.getDashboardDetailsForMain(id) /* to do change this*/
    .subscribe((response)=>{
      this.dashResponse = response
      this.dashResponse = this.dashResponse.data
      console.log(this.dashResponse)
    },(error)=>{
      console.log(error)
    })
  }

  ngOnInit(): void {
   this.UserDashboardDetails();
   this.titleService.setTitle(this.countryISO.MessageTitile.dashboard);

  }

 UserDashboardDetails(){

 }

}
