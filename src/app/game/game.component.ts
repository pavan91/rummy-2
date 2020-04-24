import { Component, OnInit } from "@angular/core";
import Phaser from "phaser";
import { MainScene } from "./js/game";
import * as render from "./js/render";
import { Router } from "@angular/router";
import { GameService } from "./game.service";
import { Subscription } from "rxjs";
import { LobbyService } from "../lobby/lobby.service";

@Component({
  selector: "app-game",
  templateUrl: "./game.component.html",
  styleUrls: ["./game.component.css"],
})
export class GameComponent implements OnInit {
  phaserGame: Phaser.Game;
  config: Phaser.Types.Core.GameConfig;
  isLoading = true;
  gameDataListener: Subscription;

  constructor(
    private router: Router,
    private gameService: GameService,
    private lobbyService: LobbyService
  ) {}

  ngOnInit() {
    this.gameDataListener = this.gameService
      .getGameDataSub()
      .subscribe((gameData) => {
        render.setPlayerName(this.lobbyService.playerName);
        this.gameDataListener.unsubscribe();
        console.log(gameData);
        this.isLoading = false;
        if (!gameData || !gameData.playerCards) {
          this.router.navigate(["/"]);
        } else {
          this.updateUI(gameData);
          this.configureNewGame();
          this.phaserGame = new Phaser.Game(this.config);
        }
      });
  }

  updateUI(gameData) {
    MainScene.playerCards = gameData.playerCards.map((card) => {
      return {
        suit: card.suit,
        value: card.value,
        frame: card.suit + card.value,
      };
    });
    let openingCard = gameData.discardPile[0];
    MainScene.openingCard.push({
      suit: openingCard.suit,
      value: openingCard.value,
      frame: openingCard.suit + openingCard.value,
    });
    MainScene.isPlaying = gameData.isPlaying;
    render.setOtherPlayersCardsNum(gameData.otherPlayersCardsNum);
    MainScene.cardsDeck = gameData.deck.map((card) => {
      return card.suit + card.value;
    });
  }

  configureNewGame() {
    const ratio = Math.max(
      window.innerWidth / window.innerHeight,
      window.innerHeight / window.innerWidth
    );
    const DEFAULT_HEIGHT = 720;
    const DEFAULT_WIDTH = ratio * DEFAULT_HEIGHT;
    this.config = {
      type: Phaser.WEBGL,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
      },
      scene: [MainScene],
    };
  }
}
