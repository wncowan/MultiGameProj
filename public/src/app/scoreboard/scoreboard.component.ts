import { Component, OnInit, Pipe, PipeTransform } from '@angular/core';
import { HttpService } from '../http.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-scoreboard',
  templateUrl: './scoreboard.component.html',
  styleUrls: ['./scoreboard.component.css']
})
export class ScoreboardComponent implements OnInit {
  User: String;
  UserList = [];
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
    this.Pullusers()
  }
  Pullusers(){
    let observable = this._http.getUsers();
    observable.subscribe(data => {
      console.log('users', data);
      for(var i = 0; i < data['data'].length; i++){
        data['data'][i]['KD'] = Math.floor((data['data'][i]['wins'] / data['data'][i]['played']) * 100)
      }
      this.UserList = data['data'];
      this.UserList.sort(function(a,b){
        if(a['wins'] < b['wins']){
          return 1
        }
      });
    });
  }
  sortbyPercent(){
      this.UserList.sort(function(a,b){
        if (!b['played']) {
          return -1;
        } else if (!a['played']) {
          return 1;
        } else if(a['KD'] < b['KD']){
          return 1;
        }
      });
      console.log(this.UserList)

  }
}
