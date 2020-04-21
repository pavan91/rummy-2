import { Component, OnInit } from "@angular/core";
import Phaser from "phaser";
import { MainScene } from "./game";
import { ActivatedRoute, Router } from "@angular/router";
import { GameService } from "./game.service";

@Component({
  selector: "app-game",
  templateUrl: "./game.component.html",
  styleUrls: ["./game.component.css"],
})
export class GameComponent implements OnInit {
  phaserGame: Phaser.Game;
  config: Phaser.Types.Core.GameConfig;
  private gameId;

  constructor(
    private activateRoute: ActivatedRoute,
    private router: Router,
    private gameService: GameService
  ) {}

  ngOnInit() {
    this.activateRoute.queryParamMap.subscribe((params) => {
      if (!params.get("id")) {
        this.router.navigate(["/"]);
      } else {
        this.gameId = params.get("id");
        this.gameService.getGameData(this.gameId).subscribe((response) => {
          if (!response) {
            this.router.navigate(["/"]);
          } else {
            console.log(response);
            if (response.playerCards) {
              MainScene.playersCards = response.playerCards.map((card) => {
                return {
                  suit: card.suit,
                  value: card.value,
                  frame: card.suit + card.value,
                };
              });
            }
            if (response.openingCards) {
              let openingCard = response.openingCards[0];
              MainScene.openingCard = {
                suit: openingCard.suit,
                value: openingCard.value,
                frame: openingCard.suit + openingCard.value,
              };
            }
            if (response.isPlaying) {
              MainScene.isPlaying = response.isPlaying;
            }
            this.configureNewGame();
            this.phaserGame = new Phaser.Game(this.config);
          }
        });
      }
    });
  }

  configureNewGame() {
    const ratio = Math.max(
      window.innerWidth / window.innerHeight,
      window.innerHeight / window.innerWidth
    );
    const DEFAULT_HEIGHT = 720;
    const DEFAULT_WIDTH = ratio * DEFAULT_HEIGHT;
    MainScene.players = 7;
    this.config = {
      type: Phaser.WEBGL,
      parent: "phaser-example",
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
