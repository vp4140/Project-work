import { Component, OnInit } from '@angular/core';
import { Chart } from 'node_modules/chart.js';
import { UserService } from '../../../services/user.service';
import { Router } from '@angular/router';
import { CountryIsoService } from '../../../services/country-iso.service';
import { BrowserModule, Title } from '@angular/platform-browser';
@Component({
  selector: 'app-mywallet',
  templateUrl: './mywallet.component.html',
  styleUrls: ['./mywallet.component.scss']
})
export class MywalletComponent implements OnInit {

  walletOptions = [
    { name: 'My Wallet' },
    { name: 'Pay Later' }
    // { name: 'Working Capital' },
    // { name: 'Summary' }
  ]
  currentDate: any;
  userFilterDate: any = "07";
  endDate: any
  dateType: any = null
  constructor(public service: UserService,
    private title: Title,
    private router: Router, private countryIso: CountryIsoService) {
    this.currentDate = new Date()
    this.CustomerId = JSON.parse(localStorage.getItem('UserData'))
    console.log("customer???",this.CustomerId)
    if (!this.CustomerId){
      this.router.navigate([`${this.countryIso.getCountryCode()}/login`])
    }
    this.getDate(this.currentDate)
    this.viewTable(this.walletOptions[0].name)

    this.CustomerId = this.CustomerId.body.data.customerId
    this.CustomerId = this.CustomerId
    console.log("id ..", this.CustomerId)
    this.calMonthOrDate(this.userFilterDate)
    // Promise.all([this.getChartData(this.currentDate, this.endDate, this.dateType), this.getUserData(this.typeSelect)])
  }
  getDate(dt) {
    //this.currentDate = dt.getDate() + '-' +  dt.getMonth() + 1 + '-' + dt.getFullYear()
    let month: any = parseInt(dt.getMonth()) + 1
    if (month < 10) {
      month = '0' + month.toString()
      console.log("month", month)
    }
    this.currentDate = dt.getFullYear() + '-' + month + '-' + dt.getDate()
    console.log("this is final current date", this.currentDate)
  }
  calMonthOrDate(filterDate) {
    let dt: any = new Date(Date.now() - parseInt(filterDate) * 24 * 60 * 60 * 1000)
    let month: any = parseInt(dt.getMonth() + 1)
    if (month < 10) {
      month = '0' + month.toString()
      console.log("month", month)
    }
    // this.endDate = dt.getDate() + '-' +  parseInt(dt.getMonth() + 1)  + '-' + dt.getFullYear()
    this.endDate = dt.getFullYear() + '-' + month + '-' + dt.getDate()
    console.log("this is end date", this.endDate)
    console.log("this is start date", this.currentDate)
  }
  ngOnDestroy() {
    this.title.setTitle('Lumiere32')
  }
  controlChartDays(event) {
    this.datesArrayForChart = [];
    this.saveArrayForChart = [];
    this.spentArrayForChart = []
    console.log("user selected", event)
    if (event == 180) {
      this.dateType = 'month'
    }
    if (event == 365) {
      this.dateType = 'month'
    }
    this.userFilterDate = event
    this.calMonthOrDate(this.userFilterDate);
    this.getChartData(this.currentDate, this.endDate, this.dateType)
    //this.showChart()
    //userFilterDate
  }

  chartData: any;
  datesArrayForChart: any = []
  spentArrayForChart: any = []
  saveArrayForChart: any = []
  getChartData(startDate, endDate, dateType) {
    this.chartData = [];
    this.datesArrayForChart = []
    this.spentArrayForChart = []
    this.saveArrayForChart = []

    console.log("chart ,",this.CustomerId)
    this.service.getChartData(this.CustomerId, this.typeSelect, startDate, endDate, dateType)
      .subscribe((response) => {
        console.log("resp..", response)
        this.chartData = response;
        this.chartData = this.chartData.data.wallet

        for (var item in this.chartData) {
          console.log("i", this.chartData[item])
          this.datesArrayForChart.push(this.chartData[item].sdate)
          this.spentArrayForChart.push(this.chartData[item].spent)
          if(this.typeSelect == 'Wallet'){

            this.saveArrayForChart.push(this.chartData[item].savings)
          }

        }
        console.log("chart response", this.chartData)
        console.log("dates for chart are", this.datesArrayForChart)
        console.log("amount for savings", this.spentArrayForChart)
        this.showChart()
      }, (error) => {
        console.log("error in wallet",error)
        this.router.navigate([`${this.countryIso.getCountryCode()}/login`])
      })
  }
  calculateDate(userFilterDate) {
    let curr = new Date
    let week = []

    for (let i = 1; i <= userFilterDate; i++) {
      let first = curr.getDate() - curr.getDay() + i
      let day = new Date(curr.setDate(first)).toISOString().slice(0, 10)
      week.push(day)
    }
    console.log("arr", week)
  }

  showChart() {
    console.log("show", this.datesArrayForChart)
    //this.calculateDate(this.userFilterDate)
    //var dt = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    //console.log(new Date(dt))
    // let curr = new Date
    // let week = []

    // for (let i = 1; i <= 7; i++) {
    //   let first = curr.getDate() - curr.getDay() + i
    //   let day = new Date(curr.setDate(first)).toISOString().slice(0, 10)
    //   week.push(day)
    // }
    // console.log("arr",week)
    var walletLegend =  [{
      label: '#spent',
      backgroundColor: "#1b4791",
      data: this.spentArrayForChart,

    },{
      label: '#savings',
      data: this.saveArrayForChart,
      backgroundColor: "#63c7db",

    }]
    var BNPLLegend =  [{
      label: '#spent',
      backgroundColor: "#1b4791",
      data: this.spentArrayForChart,

    }]
    var myLegends = this.typeSelect == 'Wallet'?walletLegend:BNPLLegend;

    var myChart = new Chart("myChart", {
      type: 'bar',
      data: {
        labels: this.datesArrayForChart,
        datasets: myLegends
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    });

  }
  ngOnInit(): void {
    Promise.all([this.getChartData(this.currentDate, this.endDate, this.dateType), this.getUserData(this.typeSelect)])
    this.title.setTitle(this.countryIso.MessageTitile.pay32);
  }
  /* this section will control
  chart filter by days
  */
  filterByDates: any = [
    { name: "Last 7 Days", value: "07", dateType: null },
    { name: "Last 30 Days", value: "30", dateType: null },
    { name: "Last 6 Months", value: "180", dateType: "month" },
    { name: "Last 12 Months", value: "365", dateType: "month" }
  ]
  userReqFilterForGraph: any = "07";

  dashResponse: any;
  display = false
  typeSelect = 'Wallet'
  CustomerId: any
  getUserData(typeSelect) {
    console.log("customer id is ?",this.CustomerId)
    this.service.getDashboardDetails(this.CustomerId, typeSelect)
      .subscribe((response) => {
        this.dashResponse = response
        this.dashResponse = this.dashResponse.data
        console.log(this.dashResponse)
        this.display = true
      }, (error) => {
        console.log(error)
        this.router.navigate([`${this.countryIso.getCountryCode()}/login`]);
      })
  }
  userOrderFilter: any;
  /* filter tbale logic*/
  filterTable() {
    this.dashResponse = this.dashResponse.walletTxn.results.filter((res) => {
      return res.order.match(this.userOrderFilter);
    })
    console.log("filter result", this.dashResponse)
  }
  selectedvalue: any;
  viewTable(item) {
    console.log("dsds", item)
    this.selectedvalue = item;
    if (item == 'Pay Later') {
      this.typeSelect = 'PAY32-BNPL';
      // this.controlChartDays(30)
      Promise.all([this.getChartData(this.currentDate, this.endDate, this.dateType), this.getUserData(this.typeSelect)])
    } else if (item == 'My Wallet') {
      this.typeSelect = 'Wallet'
      Promise.all([this.getChartData(this.currentDate, this.endDate, this.dateType), this.getUserData(this.typeSelect)])
    }
    else if (item == 'Working Capital') {
      this.typeSelect = 'Working Capital'
      Promise.all([this.getChartData(this.currentDate, this.endDate, this.dateType), this.getUserData(this.typeSelect)])
    }
  }

  navigateToContactUs() {
    this.router.navigate([`/${this.countryIso.getCountryCode()}/contact-us`])
  }
  navigateToAddMoney() {
    // this.router.navigate([`/${this.countryIso.getCountryCode()}/add-money`])
    this.router.navigate([`/${this.countryIso.getCountryCode()}/pay32/top-up`])
  }
}
