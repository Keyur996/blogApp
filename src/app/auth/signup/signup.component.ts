import { Component, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { AuthService } from "../auth.service";

@Component({
  selector: "app-signup",
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.css"],
})
export class SignupComponent implements OnInit {
  constructor(private $auth: AuthService) {}

  ngOnInit() {}

  onSignUp(form: NgForm) {    
    if (form.invalid) {
    return;
    }
    this.$auth.register(form.controls['email'].value,  form.controls['password'].value);
  }
}
