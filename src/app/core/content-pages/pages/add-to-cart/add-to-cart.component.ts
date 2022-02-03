import { Component, OnInit, } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { ProductsService } from 'src/app/core/services/products.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { LazyLoadEvent, ConfirmationService } from 'primeng/api';
import { ToastrService } from 'ngx-toastr';
import { UtilityService } from '../../../services/utility.service';
import { CartCountService } from '../../../services/cart-count.service';
import { CheckoutService } from 'src/app/core/services/checkout.service';
import { UserService } from '../../../services/user.service';
import { CountryIsoService } from '../../../services/country-iso.service';
import { BrowserModule, Title } from '@angular/platform-browser';
import * as CryptoJS from 'crypto-js';
@Component({
  selector: 'app-add-to-cart',
  templateUrl: './add-to-cart.component.html',
  styleUrls: ['./add-to-cart.component.scss']
})
export class AddToCartComponent implements OnInit {
  proceedDisplay: boolean = false
  carts: any[];
  CartDetails: any;
  quantity: any;
  counterValue: number = 1;
  checkbox: boolean = false;
  checkboxselect: boolean = false;
  DeleteRow: boolean = false;
  MarkALLRow: boolean = true;
  cartForm: FormGroup;
  private _model: any;
  confirmDropDatabaseDialogVisible: any;
  SelectedIDs: any;
  userInfo: any;
  userid: string;
  customerId: any;
  total: number;
  value: number;
  totalamount: number;
  action: any;
  itemIDs: any[];
  productId: any;
  index: any;
  constructor(private _fb: FormBuilder, private productService: ProductsService,
    public service: UserService,
    public authService: AuthService,
    private title: Title,
    private router: Router,
    private toastr: ToastrService,
    public _utility: UtilityService,
    private confirmationService: ConfirmationService,
    public checkService: CheckoutService,
    public countryISO: CountryIsoService,
    private cartCountService: CartCountService) {
    this.checkService.promoDiscount = 0
  }
  ngOnDestroy() {
    this.title.setTitle('Lumiere32')

  }
  isMasterSel: boolean;
  isSelected: boolean = true;
  categoryList: any;
  checkedCategoryList: any;
  proceedToSectionDisplay: boolean = true
  ngOnInit(): void {

    this.title.setTitle(this.countryISO.MessageTitile.cart)
    this.checkService.activeStep4 = false;
    this.checkService.activeStep5 = false;
    this.checkService.activeStep3 = false;
    this.cartForm = this._fb.group({
      quantities: this._fb.array([])
    })
    this.userid = localStorage.getItem('UserData')
    if (this.userid) {

      this.userInfo = JSON.parse(localStorage.getItem('UserData')).body.data;
    } else {
      this.productCount = 0
      this.proceedToSectionDisplay = false
    }


    this.customerId = JSON.parse(localStorage?.getItem('UserData'))?.body?.data?.customerId;
    console.log(this.userInfo);
    console.log(this.customerId);
    this.getCartDetail();
    this.isMasterSel = false;
    this.carts = [

      {
        id: 1,

        isSelected: true,
        "BookID": "assets/images/medical-product/autoclave.png",

        "productName": "Life Steriware Dental",
        "quantity": "-",
        "Price": `${this.service.curr} 100`,
        "total": `${this.service.curr} 100`,

      },
      {
        id: 2,
        isSelected: true,
        "BookID": "assets/images/medical-product/autoclave.png",
        "productName": "Life Steriware Dental",
        "quantity": "-",
        "Price": `${this.service.curr} 100`,
        "total": `${this.service.curr} 100`,

      },
      {
        id: 3,
        isSelected: true,
        "BookID": "assets/images/medical-product/autoclave.png",
        "productName": "Life Steriware Dental",
        "quantity": "-",
        "Price": `${this.service.curr} 100`,
        "total": `${this.service.curr} 100`,

      }
    ]

    //this.getCheckedItemList();
    if (this.carts.length) {
      this.carts.forEach(element => {
        this.addQuantity();
      });
    }
    else {
      this.addQuantity();
    }
  }

  quantities() {
    return this.cartForm.get("quantities") as FormArray
  }
  newQuantity(): FormGroup {
    return this._fb.group({
      quantity: [],
    })
  }

  addQuantity() {
    this.quantities().push(this.newQuantity());
  }
  addProductToCart(index) {
    console.log(index)
    console.log(this.CartDetails)
    let reqObj = {
      quantity: this.cartForm.value.quantities[index].quantity,
      productId: +this.productId,
      countryId: this.countryISO.getCountryId(),
      customerId: this.userInfo.customerId,
      sellerId: this.CartDetails[index].product.sellerId
    }
    if (this.CartDetails.length) {
      reqObj.productId = this.CartDetails[index].productId
    }
    console.log(reqObj);
    this.productService.addToCart(reqObj).subscribe((response: any) => {
      this.removeOffer()
      this.toastr.success(response.message);
      this.cartCountService.updateCount('success');
      this.getCartDetail();
    },
      error => {
        console.log(error)
        this.toastr.warning(error.error.message)
        if (error.status == 401) {
          this.router.navigate([`/${this.countryISO.getCountryCode()}/login`])
        }
      })
  }
  addQty(index, stock) {
    let valueQty: any = +this.quantities().controls[index].value.quantity;
    if (parseInt(stock) > parseInt(valueQty)) {
      console.log("value of qunatity", valueQty)
      this.quantities().controls[index].get('quantity').setValue(valueQty + 1)
    } else {
      this.toastr.warning("Max quanity reached.")
    }
  }
  ceckName(index) {

    if (parseInt(this.quantities().controls[index].value.quantity) < 0) {
      this.quantities().controls[index].get('quantity').setValue(0);
    }
  }
  removeQty(id, index) {
    console.log(id);
    let valueQty = +this.quantities().controls[index].value.quantity;
    this.quantities().controls[index].get('quantity').setValue(valueQty - 1);
    console.log(this.quantities().controls[index].value.quantity);
    let curQuantity = this.quantities().controls[index].value.quantity;
    if (curQuantity <= 0) {
      var itemIDs = [];
      itemIDs.push(id);
      console.log(itemIDs);
      this.itemIDs = itemIDs;
      console.log(this.itemIDs);
      console.log("testing");

      this.confirmationService.confirm({
        key: 'confirm-drop-database',
        message: 'Are you sure that you want to perform this action?',
        accept: () => {
          this.productService.deleteRow(itemIDs).subscribe((response: any) => {
            console.log(response);
            this.toastr.success("Product deleted from cart");
            this.getCartDetail();
            this.cartCountService.updateCount('success');
          },
            error => {
              if (error.status == 401) {
                this.router.navigate([`/${this.countryISO.getCountryCode()}/login`])
              }
            }
          )
        },
        reject: () => {
          this.action = null;
          this.quantities().controls[index].get('quantity').setValue(1);
        }
      });
    }
  }
  navigateToProduct(item) {
    if (item.parentId !== null) {
      // this.router.navigate([`/${this.countryISO.getCountryCode()}/p/${item.productName.replace(/[^a-zA-Z0-9_-]/g, '')}`], { queryParams: { pid: item.parentId } })
      return `/${this.countryISO.getCountryCode()}/p/${item.productName.replace(/[^a-zA-Z0-9_-]/g, '')}` + `?pid=${item.parentId}`;
    }
    else {
      // this.router.navigate([`/${this.countryISO.getCountryCode()}/p/${item.productName.replace(/[^a-zA-Z0-9_-]/g, '')}`], { queryParams: { pid: item.id } })
      return `/${this.countryISO.getCountryCode()}/p/${item.productName.replace(/[^a-zA-Z0-9_-]/g, '')}` + `?pid=${item.id}`;
    }
  }
  proceedToPayAccess: boolean = true;
  outStockArray: any = []
  checkProductStatus() {
    console.log("cart data...", this.CartDetails)
    let index = 0
    if (this.CartDetails.length == 0) {
      this.toastr.show('No Item in Cart')
      return
    }
    for (var item of this.CartDetails) {
      item.quantityDisplay = true;
      if (item.product.sellerProducts[0].quantity <= 0) {
        this.outStockArray.push(item)
        item.quantityDisplay = false
        this.proceedToPayAccess = false;
        this.toastr.show(item.product.productName + " " + "is out of stock")
      }
      index++
    }
    return this.proceedToPayAccess
  }
  productCount: any;
  getCartDetail() {
    this.productService.getCartDetailID(this.customerId).subscribe((response: any) => {
      console.log(response.data);
      this.checkService.addToCartProductsDetails = response.data
      this.CartDetails = response.data;
      console.log("number of carts", this.CartDetails);
      this.productCount = this.CartDetails.length
      this.checkProductStatus()
      if (this.productCount > 1) {
        this.proceedDisplay = true;
        this.proceedToSectionDisplay = false;
      }
      console.log("number of carts", this.productCount);
      if (this.productCount >= 1) {
        this.proceedToSectionDisplay = true
        this.proceedDisplay = true
      } else {
        this.quoteDisplay = false
        this.proceedToSectionDisplay = false
      }
      this.index = this.CartDetails.length;
      if (this.CartDetails.length) {
        var total = 0;
        this.CartDetails.forEach((element, index) => {
          this.addQuantity();
          console.log(element);
          console.log(index)
          this.productId = element.productId;

          total += element.total;
          this.totalamount = total;
          this.totalamountAfterDiscount = this.totalamount
          console.log(this.totalamount);

          this.quantities().controls[index].get('quantity').setValue(element.quantity);
        });
        this.getCheckedItemList()
      }
    },
      error => {
        console.log(error.error.message)
        if (error.status == 401) {
          this.router.navigate([`/${this.countryISO.getCountryCode()}/login`])
        }
      })
  }

  checkAll() {

    this.checkbox = true;
    this.checkboxselect = false;
    this.DeleteRow = true;
    this.MarkALLRow = false;

    var array = []
    var checkboxes = document.querySelectorAll('input[type=checkbox]:checked')
    console.log(checkboxes);
    console.log("checkboxes");
    // for (var i = 0; i < checkboxes.length; i++) {
    //   array.push(checkboxes[i].value)
    // }
    // console.log(array);
    this.getCheckedItemList();

  }
  checkAllselect() {
    this._model = [];
    this.checkbox = false;
    this.checkboxselect = true;
    this.DeleteRow = true;
    this.MarkALLRow = false;

  }
  /* this will remove cart */
  RemoveDeleteID(id, event) {
    let arr = []
    arr.push(id)
    this.productService.deleteRow(arr).subscribe((response: any) => {
      if (response) {
        this.MarkALLRow = true;
      }
      this.cartCountService.updateCount('success');
      console.log(response);
      this.toastr.success("Row delete sucessfully!");
      this.getCartDetail();
    },
      error => {
        if (error.status == 401) {


        }
      }
    )
  }
  deleteselectedRow() {
    this.DeleteRow = false;
    this.checkbox = false;
    this.checkboxselect = false;

    console.log(this._model);

    this.productService.deleteRow(this._model).subscribe((response: any) => {
      if (response) {
        this.MarkALLRow = true;
      }
      this.cartCountService.updateCount('success');
      console.log(response);
      this.toastr.success("Product deleted from cart");
      this.getCartDetail();
    },
      error => {
        if (error.status == 401) {


        }
      }
    )
  }

  selectID(id, event: any) {
    var SelectedIDs = [];
    console.log(id);
    SelectedIDs.push(id);
    this.SelectedIDs = SelectedIDs;
    console.log(this.SelectedIDs);
    if (this._model instanceof Array) {
      this._model.push(id);
      console.log(this._model);
    } else {
      this._model = [id];
    }
    console.log(this._model);
  }


  checkUncheckAll() {
    for (var i = 0; i < this.CartDetails.length; i++) {
      this.CartDetails[i].isSelected = this.isMasterSel;
    }
    this.getCheckedItemList();
  }

  isAllSelected() {
    this.isMasterSel = this.CartDetails.every(function (item: any) {
      return item.isSelected == true;
    })
    this.getCheckedItemList();
  }

  getCheckedItemList() {
    console.log(this.CartDetails, "cart details")
    this.checkedCategoryList = [];
    for (var i = 0; i < this.CartDetails.length; i++) {
      if (this.CartDetails[i].isSelected)
        this.checkedCategoryList.push(this.CartDetails[i].id);
    }
    console.log(this.checkedCategoryList);
    // this.checkedCategoryList = JSON.stringify(this.checkedCategoryList);
    this._model = this.checkedCategoryList;
    console.log(this._model);
  }


  proceedPayment() {
    console.log("pay access?", this.proceedToPayAccess)
    console.log("lenght ...", this.outStockArray.length)
    if (this.outStockArray.length > 0) {
      return
    }
    this.checkService.checkoutOrder = this.CartDetails;
    console.log("proceeding payment", this.checkService.checkoutOrder)
    if (this.checkService.checkoutOrder?.length == 0) {
      this.toastr.show("Cart can not be empty")
    } else {
      localStorage.setItem('order-data', JSON.stringify(this.checkService.checkoutOrder))
      let billingAddress = JSON.parse(localStorage.getItem('UserData'))
      billingAddress = billingAddress.body.data
      console.log(billingAddress, "customer details")
      this.checkService.shippingMobileNo = billingAddress.shippingMobileNo
      let custID = billingAddress.customerId
      console.log(custID)
      let discount: any = this.checkService.promoDiscount.toString()
      var ciphertext = CryptoJS.AES.encrypt(discount, `${this.countryISO.getKey()}`).toString();
      console.log("cipher", ciphertext)
      localStorage.setItem('discount_applied', ciphertext)
      localStorage.setItem('dis_id', this.checkService.promoDiscountid)
      this.router.navigate([`/${this.countryISO.getCountryCode()}/checkout-order`], { queryParams: { customer: billingAddress.firstName, customerid: custID } });
    }



  }
  code: any;
  totalamountAfterDiscount: any;
  codeDisplay: boolean = true
  applyOffer() {
    console.log("applying offer")
    let custid: any = JSON.parse(localStorage.getItem('UserData'))
    custid = custid.body.data.customerId
    console.log("userdata id", custid)
    console.log("code", this.code)
    console.log("total amount", this.totalamount)
    this.checkService.getPromoOffer(this.code, custid, this.totalamount)
      .subscribe((response) => {

        console.log(response)
        let mesg: any = response;
        if (!mesg.statusCode) {


          console.log('discount coupon', mesg)
          this.checkService.promoDiscount = parseFloat(mesg.data.discount_applied)
          this.checkService.promoDiscountid = mesg.data.id
          mesg = mesg.message
          this.checkService.promoApplied = true;
          console.log("discount", this.checkService.promoDiscount)
          console.log("promo applied", this.checkService.promoApplied)

          this.totalamountAfterDiscount = this.totalamount - this.checkService.promoDiscount
          console.log("total amount with discount", this.totalamountAfterDiscount)
          this.codeDisplay = false

          this.toastr.success(mesg)
        } else {
          //coupon code not valid
          this.toastr.info(mesg.message)
        }
      }, (error) => {
        console.log(error)
        this.toastr.show(error.error.message)
        // if (error.status == 401) {
        //   this.router.navigate([`/${this.countryISO.getCountryCode()}/login`])
        // }
      })
  }

  removeOffer() {
    this.totalamountAfterDiscount = this.totalamountAfterDiscount + this.checkService.promoDiscount
    this.code = null;
    this.checkService.promoDiscount = 0
    this.codeDisplay = true

  }
  quoteDisplay: boolean = true;

  getQuote() {
    this.quoteDisplay = false;
    console.log("quote", this.CartDetails)
    let arr: any = [];
    let sums = 0;
    for (const item in this.CartDetails) {
      sums = sums + this.CartDetails[item].total
      arr.push({
        productId: this.CartDetails[item].productId,
        sellerId: this.CartDetails[item].sellerId,
        productName: this.CartDetails[item].product.productName,
        PNCDE: this.CartDetails[item].product.PNCDE,
        quantity: this.CartDetails[item].quantity,
        price: this.CartDetails[item].product.MRP,
        totalPrice: this.CartDetails[item].total

      }
      )
    }

    console.log("arr", arr)
    console.log("arr", sums)

    let userPersonalData = JSON.parse(localStorage.getItem('UserData'))
    userPersonalData = userPersonalData.body.data
    let data = {
      customerId: this.CartDetails[0].customerId,
      quotationDate: new Date(),
      quotationStatus: "new",
      countryId: this.CartDetails[0].countryId,
      customerName: userPersonalData.firstName,
      customerEmail: userPersonalData.Email,
      customerMobileNumber: userPersonalData.mobileNumber,
      shippingClinicName: userPersonalData.clinicName,
      shippingBuildingName: userPersonalData.shippingBuildingName || null,
      shippingBlockNo: userPersonalData.shippingBlockNo || null,
      shippingFloorNo: userPersonalData.shippingFloorNo || null,
      shippingUnitNo: userPersonalData.shippingUnitNo || null,
      shippingStreetName: userPersonalData.shippingStreetName || null,
      shippingPincode: userPersonalData.shippingPincode || null,
      billingClinicName: userPersonalData.clinicName || null,
      billingBuildingName: userPersonalData.buildingName || null,
      billingBlockNo: userPersonalData.houseNo || null,
      billingFloorNo: userPersonalData.floorNo || null,
      billingUnitNo: userPersonalData.unitNo || null,
      billingStreetName: userPersonalData.streetName || null,
      billingPincode: userPersonalData.pincode || null,
      billingState: userPersonalData.state || null,
      subTotal: sums,
      total: sums,
      quotationProducts: arr
    }
    this.checkService.getQuoteForUser(data)
      .subscribe((response) => {
        console.log(response)
        this.quoteSuccessMesg = response;
        this.quoteSuccessMesg = this.quoteSuccessMesg.message
        this.toastr.success(this.quoteSuccessMesg)
        let showMessage = "Our executive will reach out to you"
        this.router.navigate([`/${this.countryISO.getCountryCode()}/thank-you`], { state: { message: showMessage } })
      }, (error) => {
        console.log(error)
        if (error.status == 401) {
          this.router.navigate([`/${this.countryISO.getCountryCode()}/login`])
        }
      })

  }
  quoteSuccessMesg: any
}
