import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { ContentLayoutComponent } from './content-layout/content-layout.component';
import { MedicalEquipmentComponent } from './pages/Medical/medical-equipment.component';
import { GetEquipmentComponent } from './pages/Product-listing/get-equipment.component';
import { DentalEquipmentComponent } from './pages/Dental/dental-equipment.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { AddToCartComponent } from './pages/add-to-cart/add-to-cart.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { ContactUsComponent } from './pages/contact-us/contact-us.component';
import { AboutUsComponent } from './pages/about-us/about-us.component';
import { ThankyouComponent } from './pages/thankyou/thankyou.component';
import { MywalletComponent } from './pages/mywallet/mywallet.component';
import { AddMoneyComponent } from './pages/add-money/add-money.component';
import { SiteFilterComponent } from './pages/site-filter/site-filter.component';
import { PaypalComponent } from './pages/paypal/paypal.component';
import { CommingSoonComponent } from '../../shared/components/comming-soon/comming-soon.component';
import { TermOfUseComponent } from '../../shared/components/term-of-use/term-of-use.component';
import { PrivacyPolicyComponent } from '../../shared/components/privacy-policy/privacy-policy.component';
import { FailpageComponent } from './pages/failpage/failpage.component';
import { ConcentratorComponent } from './pages/concentrator/concentrator/concentrator.component';
import { OxygenCheckoutComponent } from '../../shared/components/oxygen-checkout/oxygen-checkout.component';
import { CategoriesListingComponent } from './pages/categories-listing/categories-listing.component';
import { TopUpWalletComponent } from './pages/top-up-wallet/top-up-wallet.component';
import { OffersComponent } from './pages/offers/offers.component';
const routes: Routes = [
  {
    path: '',
    component: ContentLayoutComponent,
    children: [
      {
        path: '',
        component: LandingComponent,
      },

      {
        path: 'medical',
        component: MedicalEquipmentComponent,
      },
      {
        path: 'dental',
        redirectTo: '',
      },
      {
        path: 'paypal',
        component: PaypalComponent,
      },
      {
        path: 'c/:name',
        component: SiteFilterComponent,
      },
      {
        path: 'sc/:name/:childName',
        component: SiteFilterComponent,
      },
      {
        path: 'c',
        component: SiteFilterComponent,
      },
      {
        path: 'brand/:name',
        component: SiteFilterComponent,
      },
      {
        path: 'add-to-cart',
        component: AddToCartComponent,
      },
      {
        path: 'checkout-order',
        component: CheckoutComponent,
      },

      {
        path: 'contact-us',
        component: ContactUsComponent,
      },
      {
        path: 'privacy-policy',
        component: PrivacyPolicyComponent,
      },
      {
        path: 'about-us',
        component: AboutUsComponent,
      },
      {
        path: 'thank-you',
        component: ThankyouComponent,
      },
      {
        path: 'error-occured',
        component: FailpageComponent,
      },
      {
        path: 'my-wallet',
        component: MywalletComponent,
      },

      {
        path: 'offers',
        component: OffersComponent,
      },
      {
        path: 'term-of-use',
        component: TermOfUseComponent,
      },
      {
        path: 'add-money',
        component: AddMoneyComponent,
      },
      {
        path: 'pay32/top-up',
        component: TopUpWalletComponent,
      },
      {
        path: 'site-filter',
        component: SiteFilterComponent,
      },
      {
        path: 'search',
        component: CategoriesListingComponent,
      },
      {
        path: 'p/:name',
        component: ProductDetailComponent,
      },
      {
        path: 'dental/product-listing',
        component: SiteFilterComponent,
      },
      {
        path: 'medical/product-listing',
        component: SiteFilterComponent,
      },
      {
        path: 'oxygen',
        component: ConcentratorComponent,
      },
      {
        path: 'oxygen-checkout/:success',
        component: OxygenCheckoutComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContentPagesRoutingModule {}
