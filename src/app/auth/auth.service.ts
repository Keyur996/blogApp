import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { AuthData } from "./auth-data.model";
import { cloneDeep } from 'lodash';
import { Router } from "@angular/router";

const BACKEND_URL = `${environment.serverUrl}` 

@Injectable({ providedIn: 'root' })
export class AuthService {
  private isAuthenticated: boolean = false;
  private token: string;
  private user: any;
  private tokenTimer: any;
  private authStatusListener: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(private $http: HttpClient, private $router: Router) {}

  getUser(): any {
    return this.user;
  }

  getAuthStatusListener(): Observable<boolean> {
    return this.authStatusListener.asObservable();
  }

  getToken(): string {
    return this.token;
  }

  getIsAuth(): boolean {
    return this.isAuthenticated;
  }

  register(email: string, password: string) {
    const authData: AuthData = { email: email, password: password };
    this.$http.post<any>(`${BACKEND_URL}/users/signup`, authData).subscribe(
      (res) => {
        if(res.token) this.afterLogInProcess(res);
        this.$router.navigate(["/"]);
      },
      error => {
        this.authStatusListener.next(false);
      }
    );
  }

  logIn(email: string, password: string) {
    const authData: AuthData = { email: email, password: password };
    this.$http.post<any>(`${BACKEND_URL}/users/login`, authData).subscribe(
      (res) => {
        if(res.token) this.afterLogInProcess(res);
      }, error => {
        this.authStatusListener.next(false);
      }
    )
  }

  autoAuth() {
    const authInformation = this.getAuthData();
    if(!authInformation) return;
    const expiresIn = new Date(authInformation.expiration).getTime() - new Date().getTime();
    if(expiresIn > 0) {
      this.token = authInformation.token;
      this.user = authInformation.user;
      this.isAuthenticated = true;
      this.authStatusListener.next(true);
      this.setAuthTimer(expiresIn);
    }
  }

  private getAuthData() {
    const token = localStorage.getItem("token");
    const expiration = localStorage.getItem("expiration");
    const user = JSON.parse(localStorage.getItem("user"));

    if(!token || !expiration || !user) {
      return;
    }

    return {
      token, expiration, user
    }
  }

  private afterLogInProcess({ token, user, expiresIn }): void {
      this.setAuthTimer(expiresIn);
      this.isAuthenticated = true;
      this.token = token;
      this.user = cloneDeep(user);
      this.authStatusListener.next(true);
      const now = new Date();
      const expirationDate = new Date(
        now.getTime() + expiresIn
      );
      this.saveAuthData(token, expirationDate, this.user);
      this.$router.navigate(["/"]);
  }

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logOut();
    }, duration);
  }

  logOut() {
    this.$http.get<{ success: boolean }>(`${BACKEND_URL}/users/logout`).subscribe(({ success }) => {
      if(success) {
        this.token = null;
        this.isAuthenticated = false;
        this.authStatusListener.next(false);
        this.user = null;
        clearTimeout(this.tokenTimer);
        this.clearAuthData();
        this.$router.navigate(["/"]);
      }
    });
  }

  private saveAuthData(token: string, expirationDate: Date, user: any) {
    localStorage.setItem("token", token);
    localStorage.setItem("expiration", expirationDate.toISOString());
    localStorage.setItem("user", JSON.stringify(user));
  }

  private clearAuthData() {
    localStorage.removeItem("token");
    localStorage.removeItem("expiration");
    localStorage.removeItem("userId");
  }
} 