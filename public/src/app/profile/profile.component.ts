import { Component, OnInit } from '@angular/core';
import { HttpService } from '../http.service';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user ={
    username: "",
    wins: Number,
    played: Number
  }
  username;

  constructor( private _http: HttpService,
    private _router: Router,
    private _route: ActivatedRoute) { }

  ngOnInit() {
    this.onShow();
  }

  onShow(){
    this._route.params.subscribe((params: Params) => {
      this.username = params['username']
      console.log(params['username'])
    });
  
    let observable = this._http.showPlayer(this.username);
    console.log(this.username, "HERERERERERE")
    observable.subscribe(data => {
      console.log("show me", data)
      this.user = data['data'];
    });
    console.log(this.user, 'yooooooo');
      
  }
}
