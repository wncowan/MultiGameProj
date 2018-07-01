import { Component, OnInit, Pipe, PipeTransform} from '@angular/core';
import { HttpService } from '../http.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})

export class MainComponent implements OnInit {
  data: any;
  User: String;
  Room: String;
  OpenRooms = {};
  ListOfUsers = [];
  keys = [];
  
  constructor(
    private _http: HttpService,
    private _router: Router
  ) {
    
  }
  
  ngOnInit() {
    this.User = this._http.user;
    console.log("this.User")
    console.log(this.User)
    //If no one is logged in, redirect back to login.
    if (!this.User){
      this._router.navigate(['login']);
    }
    this.Rooms();
    this._http.checkRoom();
  }
  join(user){
    //calls the joinRoom function and passes in the user and room
    this._http.joinRoom({user:this.User, room: this.User});
    this._router.navigate(['room/' + user])
  }
  joinByClick(RoomSelected){
    this._http.joinRoom({user:this.User, room: RoomSelected});
    this._router.navigate(['room/' + RoomSelected]);
  }
  Rooms(){
    //Update.
    this._http.listOfRooms().subscribe(rooms => {
      this._http.getUsers().subscribe(data => {
        //Reset everything before adding new data.
        this.OpenRooms = {};
        this.ListOfUsers = [];
        this.keys = [];
        for(let i=0; i < data['data'].length; i++){
          this.ListOfUsers.push(data['data'][i].username);
        }
        for(let room in rooms){
          if(this.ListOfUsers.includes(room)){
            this.OpenRooms[room] = rooms[room];
          }
        }
        for(let keys in this.OpenRooms){
          this.keys.push(keys);
        }
      });
    });
  }
}
