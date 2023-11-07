import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { User } from "src/app/compartido/modelos/user";
import { Constants } from "src/app/compartido/helpers/constants";
import * as jwt_decode from "jwt-decode";
import { BnNgIdleService } from 'bn-ng-idle';
import { CommonService } from './common.service';
import { configMsg } from '@app/compartido/helpers/enums';

@Injectable({
  providedIn: "root"
})
export class AuthenticationService {
  private currentUserSubject: BehaviorSubject<User>;
  public currentUser: Observable<User>;

  constructor(
    private bnIdle: BnNgIdleService,
    private cs: CommonService) {

    this.currentUserSubject = new BehaviorSubject<User>(
      JSON.parse(localStorage.getItem(Constants.KEY_USER_SESSION))
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  login(user: any) {
    localStorage.setItem(Constants.KEY_USER_SESSION, JSON.stringify(user));
    this.currentUserSubject.next(user);
    return user;
  }

  logout() {
    localStorage.removeItem(Constants.KEY_USER_SESSION);
    //localStorage.removeItem(Constants.TOKEN);
    this.currentUserSubject.next(null);

    //unsuscribe inactivity
    this.bnIdle.stopTimer();

    //set null variables temporales
    // this.cs.setVar(configMsg.USER, null);
    // this.cs.setVar(configMsg.VISTAS, null);
    // this.cs.setVar(configMsg.VISTAS_ROL_USUARIO, null);

    //refrescar la pagina
    window.location.reload();
  }

  getUser(): User {
    return JSON.parse(localStorage.getItem(Constants.KEY_USER_SESSION));
  }

  getIdUser(): string {
    return this.getUser().id;
  }

  updateUser(user: any) {
    localStorage.setItem(Constants.KEY_USER_SESSION, JSON.stringify(user));
  }

  // getToken(): string {
  //   return localStorage.getItem(Constants.TOKEN);
  // }

  // setToken(token: string): void {
  //   localStorage.setItem(Constants.TOKEN, token);
  // }

  /*getTokenExpirationDate(token: string): Date {
    const decoded = jwt_decode(token);
    if (decoded.exp === undefined) {
      return null;
    }
    const date = new Date(0);
    date.setUTCSeconds(decoded.exp);
    return date;
  }

  isTokenExpired(token?: string): boolean {
    if (!token) {
      token = this.getToken();
    }
    if (!token) {
      return true;
    }

    const date = this.getTokenExpirationDate(token);
    if (date === undefined) {
      return false;
    }
    return !(date.valueOf() > new Date().valueOf());
  }*/
}
