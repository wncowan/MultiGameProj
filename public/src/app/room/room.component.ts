import { Component, OnInit } from '@angular/core';
import { HttpService } from '../http.service';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit {
  //State of the "game"
  state: any;
  
  messageText: String;
  messageArray:Array<{user:String, message:String}> = [] //will contain the join event information
  User: String;
  Room: String;
  board: any;
  winner: any;
  constructor(
    private _http: HttpService,
    private _router: Router,
    private _route: ActivatedRoute
  ) {
    if(!this._http.user){
      this._router.navigate(['main']);
    }
    // leaves an open connection to notify when a user joins
    this._http.newUserJoined().subscribe(data=> this.messageArray.push(data))
    // leaves an open connection to notify when a user leaves
    this._http.userLeftRoom().subscribe(data => this.messageArray.push(data));
    // leaves an open connection to listen for any new messages
    this._http.newMessageRecieved().subscribe(data => this.messageArray.push(data));
    //set up listener for game state.
    this._http.getState().subscribe(state => { 
      console.log(state);
      this.state = state;
    });
    this._http.TTTstate().subscribe(state => {
      console.log("Received an emit of TTT State.")
      this.board = state;
      console.log(state)
      if(state['Winner'] == 'Tie'){
        this.winner = state['Winner'];
      }
      else {
        if(state['Winner']){
          this.winner = state['Winner'];
        }
      }
    });

  }

  ngOnInit() {
    this.User = this._http.user;
    this._route.params.subscribe((params: Params) => this.Room = params['RoomName']);

  }
  leave(){
    this._http.leaveRoom({user:this.User, room: this.Room});
    this._router.navigate(['main']);
  }
  sendMessage(){
    this._http.sendMessage({user:this.User, room: this.Room, message: this.messageText});
    console.log(this.messageText);
    this.messageText = "";
  }

  move(tile){
    // this.board[tile]="X"
    this._http.sendAction({GameTitle: "TTT", Tile: tile, room: this.Room});
  }

  buttonClick(event){
    console.log(event.target);
    this._http.sendAction({GameTitle: "Button", user: this.User, room: this.Room, action:event.target.id})
  }
  resetBoard(){
    this._http.reset(this.Room);
    this._http.sendMessage({user: 'SYSTEM', room: this.Room, message: "Game has been reset"});
  }

}
