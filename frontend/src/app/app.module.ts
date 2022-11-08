import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { WalletConnectComponent } from './wallet-connect/wallet-connect.component';
import { GameBoardComponent } from './game-board/game-board.component';
import { GameBoardChallengeComponent } from './game-board-challenge/game-board-challenge.component';

@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
    WalletConnectComponent,
    GameBoardComponent,
    GameBoardChallengeComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
