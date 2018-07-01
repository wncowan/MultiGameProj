import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { MainComponent } from './main/main.component';
import { RoomComponent } from './room/room.component';
import { GamesComponent } from './games/games.component';
import { ScoreboardComponent } from './scoreboard/scoreboard.component';
import { ProfileComponent } from './profile/profile.component';

const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'main', component: MainComponent},
  {path: 'games', component: GamesComponent},
  {path: 'scoreboard', component: ScoreboardComponent},
  {path: 'room/:RoomName', component: RoomComponent},
  {path: 'user/:username', component: ProfileComponent},
  {path: '', pathMatch: 'full', redirectTo: '/login'},
  {path: '**', component: LoginComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
