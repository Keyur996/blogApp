import { Component, OnInit } from "@angular/core";
import { AuthService } from "../auth/auth.service";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"],
})
export class HeaderComponent implements OnInit{
  isAuthenticated = false;

  constructor(private $auth: AuthService) {}

  ngOnInit(): void {
    this.$auth.getAuthStatusListener().subscribe((isAuth) => {
      this.isAuthenticated = isAuth;
    });
  }

  onLogOut() {
    this.$auth.logOut();
  }
}
