import { Component, OnInit,  Input, Output, EventEmitter  } from '@angular/core';
import { HttpService } from '../http.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  //user for new user, login for login attempt
  user: any;
  login: any;

  //Keep track of errors in registration & login.
  duplicate: Boolean = false;
  registered: Boolean = false;
  wrongLogin: Boolean = false;

  constructor(
    private _http: HttpService,
    private _router: Router
  ) { }

  ngOnInit() {
    //initialize user and login objects
    this.cleanForms();
  }

  cleanForms() {
    this.user = {username: "", password: "", password_confirm: ""};
    this.login = {username: "", password: ""}
  }

  register(form) {
    this._http.register(this.user).subscribe(data => {
      console.log("data");
      console.log(data);
      if(data['succeeded']){
        this.registered = true;
        this.duplicate = false;
        form.reset();
      } else {
        this.registered = false;
        if (data['status']['code'] == 11000) {
          this.duplicate = true;
        }
        form.reset();
      }
    });
  }

  submitLogin(form) {
    this._http.login(this.login).subscribe(data => {
      if(data['succeeded']){
        this._http.UserInfo(this.login['username'])
        this._http.newSession(this.login['username']);
        this._router.navigate(['main']);
      } else {
        this.wrongLogin = true;
        form.reset();
      }
    });
  }

}
