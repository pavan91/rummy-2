import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { SocketioService } from "../socketio.service";
import { Router } from "@angular/router";

@Injectable({ providedIn: "root" })
export class LobbyService {
  constructor(private socketService: SocketioService, private router: Router) {
    this.socketService.getSocket().on("start-game", (gameId: string) => {
      this.router.navigate(["/game"], {
        queryParams: { id: gameId },
      });
    });
  }

  createNewGame(gameName: string, playersAmount: number, playerName: string) {
    this.socketService
      .getSocket()
      .emit("new-game", gameName, playersAmount, playerName);
  }
  joinAGame(gameName: string, playerName: string) {
    this.socketService.getSocket().emit("join-a-game", gameName, playerName);
  }
}
