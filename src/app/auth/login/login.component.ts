import { Component, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { AuthService } from "../auth.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
  constructor(private $auth: AuthService) {}

  ngOnInit() {}

  onLogIn(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.$auth.logIn(form.controls['email'].value,  form.controls['password'].value);
  }
}
