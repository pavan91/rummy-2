import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { SocketioService } from "../socketio.service";

@Injectable({ providedIn: "root" })
export class GameService {
  private API_URL = environment.apiURL;

  constructor(
    private http: HttpClient,
    private socketService: SocketioService
  ) {}

  getGameData(gameId) {
    return this.http.post<{
      isPlaying: boolean;
      openingCards: any[];
      playerCards: any[];
      otherPlayersCardsNum: number[];
    }>(this.API_URL + "/game/" + gameId, {
      sessionId: this.socketService.getSocket().id,
      playerName: localStorage.getItem("playerName"),
    });
  }
}
