import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { TokenAuthentication } from './token.authentication.service';


@Injectable({
  providedIn: 'root'
}) export class AuthGuardService implements CanActivate {
  constructor(public auth: TokenAuthentication, public router: Router) { }

  canActivate(): boolean {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['auth/login']);
      return false;
    }
    return true;
  }
}