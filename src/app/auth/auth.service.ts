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

  logIn(email: string, password: string) {
    const authData: AuthData = { email: email, password: password };
    this.$http.post<any>(`${BACKEND_URL}/auth/login`, authData).subscribe(
      (res) => {
        if(res.token) this.afterLogInProcess(res);
      }
    )
  }

  afterLogInProcess({ token, user, expiresIn }): void {
      this.setAuthTimer(expiresIn);
      this.isAuthenticated = true;
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
    this.$http.get<{ success: boolean }>(`${BACKEND_URL}/auth/logout`).subscribe(({ success }) => {
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