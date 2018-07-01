import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { HttpService } from '../http.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-games',
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.css']
})
export class GamesComponent implements OnInit {

  User: String;

  constructor(
    private _http: HttpService,
    private _router: Router
  ) { }

  ngOnInit() {
    this.User = this._http.user;
    //If no one is logged in, redirect back to login.
    if (!this.User){
      this._router.navigate(['login']);
    }
  }
  join(user){
    //calls the joinRoom function and passes in the user and room
    this._http.joinRoom({user:this.User, room: this.User});
    this._router.navigate(['room/' + user])
  }
}
