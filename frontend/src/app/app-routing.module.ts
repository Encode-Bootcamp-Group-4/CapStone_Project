import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { WalletConnectComponent } from './wallet-connect/wallet-connect.component';
import { SnakeGameComponent } from './snake-game/snake-game.component';

const routes: Routes = [
  { path: '', component: WalletConnectComponent },
  { path: 'wallet-connect', component: WalletConnectComponent },
  { path: 'landing-page', component: LandingPageComponent },
  { path: 'snake-game', component: SnakeGameComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
