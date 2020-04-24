import { Component, OnInit } from "@angular/core";
import { SocketioService } from "../socketio.service";
import { LobbyService } from "./lobby.service";

@Component({
  selector: "app-lobby",
  templateUrl: "./lobby.component.html",
  styleUrls: ["./lobby.component.css"],
})
export class LobbyComponent implements OnInit {
  isLoading = false;
  constructor(private lobbyService: LobbyService) {}
  playerName;

  ngOnInit() {
    this.playerName = this.lobbyService.playerName;
  }

  savePlayerName(playerName) {
    this.lobbyService.playerName = playerName;
    localStorage.setItem("playerName", playerName);
  }

  onJoinAGame(gameName, playerName) {
    if (gameName && gameName.length >= 3 && playerName && playerName.length) {
      this.savePlayerName(playerName);
      this.isLoading = true;
      this.lobbyService.joinAGame(gameName, playerName);
    }
  }

  onCreateNewGame(
    newGameName: string,
    playerAmount: string,
    playerName: string
  ) {
    if (newGameName && newGameName.length >= 3) {
      this.savePlayerName(playerName);
      this.isLoading = true;
      this.lobbyService.createNewGame(
        newGameName,
        Number.parseInt(playerAmount),
        playerName
      );
    }
  }
}
