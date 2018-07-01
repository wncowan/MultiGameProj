import { Injectable } from '@angular/core';
import * as io from 'socket.io-client';
import { Observable } from 'rxjs/Observable';

import { HttpClient } from '@angular/common/http';

@Injectable()
export class HttpService {
  user: any;
  constructor (private _http: HttpClient) { }
  //sets which route to connect to
  private socket = io('http://localhost:8000')

  checkRoom(){
    this.socket.emit('roomCheck');
  }
  //joinRoom function for initiating the socket call
  joinRoom(data){
    this.socket.emit('join',data);
  }
  //userjoin fucntion for joining user
  newUserJoined(){
    // creating an observable
    let observable = new Observable<{user:String, message: String}>(observer=>{
      // listens for the new user joined event
      this.socket.on('new user joined', (data)=>{
        //will pass the data when a user joins a room
        observer.next(data);
      });
      //pushes user into the userInRoom array


      //if there is an error it will disconnect the user
      return () => {this.socket.disconnect();}
    });
    return observable
  }
  leaveRoom(data){
    this.socket.emit('leave',data)
    return "left success"
  }
  userLeftRoom(){
    // creating an observable
    let observable = new Observable<{user:String, message: String}>(observer=>{
      // listens for the left room event
      this.socket.on('left room', (data)=>{
        //will pass the data when a user joins a room
        observer.next(data);
      });
      //if there is an error it will disconnect the user
      return () => {this.socket.disconnect();}
    });
    return observable
  }
  sendMessage(data){
    this.socket.emit('message',data);
  }

  newMessageRecieved(){
    // creating an observable
    let observable = new Observable<{user:String, message: String}>(observer=>{
      // listens for the new message event
      this.socket.on('new message', (data)=>{
        //will pass the data when a user joins a room
        observer.next(data);
      });
      //if there is an error it will disconnect the user
      return () => {this.socket.disconnect();}
    });
    return observable;
  }

  listOfRooms(){
    let observable = new Observable<{}>(observer => {
      this.socket.on('rooms', (data)=>{
        observer.next(data);
      });
      return () => {this.socket.disconnect();}
    });
    return observable
  }

  register(user){
    return this._http.post('/register', user);
  }

  login(user){
    return this._http.post('/login',user);
  }

  newSession(username){
    this.user = username;
    localStorage.setItem('user', username);
    console.log("localStorage")
    console.log(localStorage)
  }
  getUsers(){
    return this._http.get('/users');
  }

  sendAction(data){
    this.socket.emit('action',data);
  }

  getState(){
    let observable = new Observable<{}>(observer => {
      this.socket.on('new state', (state)=>{
        observer.next(state);
      });
      return () => {this.socket.disconnect();}
    });
    return observable
  }
  TTTstate(){
    let observable = new Observable<{}>(observer => {
      this.socket.on('TTT state', (state)=>{
        console.log("TTT state here.");
        observer.next(state);
      });
      return () => {this.socket.disconnect();}
    });
    return observable
  }
  reset(reset){
    this.socket.emit('reset', reset);
  }
  showPlayer(username){
    return this._http.get(`/player/${username}`);
  
  }
  UserLoggedIn(){
    let observable = new Observable<{}>(observer => {
      this.socket.on('user logged', (data)=>{
        console.log("this data", data);
        observer.next(data);
      })
      return () => {this.socket.disconnect();}
    })
    return observable
  }
  UserInfo(data){
    this.socket.emit('UserInfo', data)
  }
}
