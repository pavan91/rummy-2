import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { SocketioService } from "../socketio.service";
import { Subject } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";

@Injectable({ providedIn: "root" })
export class GameService {
  gameId;
  private API_URL = environment.apiURL;
  private;
  private gameDataSub = new Subject<{
    isPlaying: boolean;
    openingCards: any[];
    playerCards: any[];
    otherPlayersCardsNum: number[];
  }>();
  static myActionSub = new Subject<{
    cards?: { suit: string; value: string }[];
    indexInDeck?: number;
    meltName?: string;
  }>();
  static othersActionSub = new Subject<{
    isPlaying: boolean;
    action: {
      cards: { suit: string; value: string }[];
      indexInDeck: number;
      meltName: string;
    };
    playerName: string;
  }>();
  constructor(
    private http: HttpClient,
    private activateRoute: ActivatedRoute,
    private socketService: SocketioService,
    private router: Router
  ) {
    GameService.myActionSub.subscribe((action) => {
      let sid = this.socketService.getSessionId();
      let dataToSend = { sid: sid, gameId: this.gameId, action: action };
      this.socketService.getSocket().emit("action", dataToSend);
    });
    this.activateRoute.queryParamMap.subscribe((params) => {
      if (!params.get("id")) {
        this.router.navigate(["/"]);
      } else {
        this.gameId = params.get("id");
        this.getGameData();
      }
    });
    this.socketService.getSocket().on("action", (action) => {
      GameService.othersActionSub.next(action);
    });
  }

  getGameDataSub() {
    return this.gameDataSub;
  }

  getGameData() {
    let sid = this.socketService.getSessionId();
    if (!sid) {
      this.socketService.getSidListener().subscribe((sid) => {
        this.http
          .post<{
            isPlaying: boolean;
            openingCards: any[];
            playerCards: any[];
            otherPlayersCardsNum: number[];
          }>(this.API_URL + "/game/" + this.gameId, {
            sessionId: sid,
            playerName: localStorage.getItem("playerName"),
          })
          .subscribe((response) => {
            this.gameDataSub.next(response);
          });
      });
    } else {
      this.http
        .post<{
          isPlaying: boolean;
          openingCards: any[];
          playerCards: any[];
          otherPlayersCardsNum: number[];
          deck: number[];
        }>(this.API_URL + "/game/" + this.gameId, {
          sessionId: sid,
          playerName: localStorage.getItem("playerName"),
        })
        .subscribe((response) => {
          this.gameDataSub.next(response);
        });
    }
  }
}
