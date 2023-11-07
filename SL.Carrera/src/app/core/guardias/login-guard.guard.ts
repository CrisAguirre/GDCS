import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, CanActivateChild } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../servicios/authentication.service';
import { CommonService } from '../servicios/common.service';
import { configMsg } from '@app/compartido/helpers/enums';
import { AlertService, TYPES } from '../servicios/alert.service';
import { CustomTranslateService } from '../servicios/custom-translate.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate, CanActivateChild {

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private cs: CommonService,
    private as: AlertService,
    private ct: CustomTranslateService) {

  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const currentUser = this.authenticationService.currentUserValue;
    if (currentUser) {
      return true;
    }
    // if (!this.authenticationService.isTokenExpired()) {
    //   return true;
    // }
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  //validar si el usuario tiene permiso a la vista
  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    const path = childRoute.routeConfig.path;
    const paths = state.url.split('/');

    if (this.cs.getVar(configMsg.VISTAS) && this.cs.getVar(configMsg.VISTAS_ROL_USUARIO)) {
      if (path && this.cs.hasPermissionUserArray(paths) == null) {
        this.as.message(this.ct.ACCESS_DENIED, TYPES.WARNING);
        return false;
      }
    }
    return true;
  }

}
