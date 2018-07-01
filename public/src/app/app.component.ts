import { Component, OnInit } from '@angular/core';
import { HttpService } from './http.service';
import { MainComponent } from './main/main.component';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  user;
  title = 'app';
  constructor(private _http: HttpService){
    this._http.UserLoggedIn().subscribe(data => {
      console.log('it worked', data)
      this.user = data});
  }
  ngOnInit(){
  }
}
