import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { AppComponent } from "./app.component";
import { GameComponent } from "./game/game.component";
import { SocketioService } from "./socketio.service";
import { AppRoutingModule } from "./app-routing.module";
import { LobbyComponent } from "./lobby/lobby.component";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";
import { FormsModule } from "@angular/forms";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { HttpClientModule } from "@angular/common/http";

@NgModule({
  declarations: [AppComponent, GameComponent, LobbyComponent],
  imports: [
    MatCardModule,
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    MatButtonModule,
    MatInputModule,
    FormsModule,
    MatProgressSpinnerModule,
  ],
  providers: [SocketioService],
  bootstrap: [AppComponent],
})
export class AppModule {}
