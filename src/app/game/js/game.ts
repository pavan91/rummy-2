import { GameService } from "../game.service";
import { Location } from "./location";
import * as render from "./render";

export class MainScene extends Phaser.Scene {
  playerHand: Map<string, Phaser.GameObjects.Image> = new Map();
  static topDiscardPileImage: Phaser.GameObjects.Image;
  deckImages: Phaser.GameObjects.Image[] = [];
  static cardsDeck: string[];
  static playerCards: any[];
  static openingCard: any[] = [];
  static isPlaying: boolean;
  tempDepth: number;
  static context: MainScene;
  meltButton: Phaser.GameObjects.Container;
  constructor() {
    super({ key: "main" });
    MainScene.context = this;
  }

  preload() {
    render.setContext(this);
    this.load.setBaseURL("http://labs.phaser.io");
    this.load.image("background", "assets/skies/gradient1.png");
    this.load.atlas(
      "cards",
      "assets/atlas/cards.png",
      "assets/atlas/cards.json"
    );
    Location.myHand = {
      x: (this.game.config.width as number) / 2,
      y: 600,
    };
    Location.grabToAreas.push(Location.myHand);
    Location.setDiscardPile({
      x: (this.game.config.width as number) / 8 + 70,
      y: ((this.game.config.height as number) * 2) / 3,
    });
  }

  create() {
    let background = this.add.image(400, 300, "background");
    background.setScale(3);
    var rect = this.add.rectangle(0, 0, 150, 50, 0xffffff);
    var text = this.add
      .text(0, 0, "בחירת קלפים לירידה", {
        fontFamily: "Arial",
        color: "#000000",
        align: "center",
      })
      .setFontSize(18);
    text.setOrigin(0.5);
    this.meltButton = this.add.container(1250, 600, [rect, text]);
    this.meltButton.setSize(rect.width, rect.height);
    this.meltButton.setInteractive();
    this.game.canvas.style.cursor = "pointer";
    this.meltButton.on("pointerover", () => {
      rect.setStrokeStyle(3);
      MainScene.context.input.setDefaultCursor("pointer");
    });
    this.meltButton.on("pointerout", () => {
      rect.setStrokeStyle();
      MainScene.context.input.setDefaultCursor("default");
    });
    this.meltButton.on("pointerdown", (pointer, gameObject) => {});
    this.meltButton.visible = false;
    MainScene.context.input.setDefaultCursor("default");

    render.renderHand(
      MainScene.playerCards,
      Location.myHand,
      60,
      0.9,
      this.playerHand
    );
    render.renderOtherPlayersHands();
    let deck = render.renderDeck(
      MainScene.openingCard[0].frame,
      MainScene.isPlaying
    );
    this.deckImages = deck.deckImages;
    MainScene.topDiscardPileImage = deck.topDiscardPileImage;
    this.input.on("drag", this.onCardDrag, this);
    this.input.on("dragend", this.onDrawCard, this);
    this.input.on("dragstart", this.onStartDrawCard, this);
    GameService.othersActionSub.subscribe((data) => {
      if (!data.action) {
        render.otherPlayerDrawCard(
          MainScene.topDiscardPileImage,
          data.playerName,
          "back"
        );
        MainScene.topDiscardPileImage = null;
      } else if (data.action.meltName) {
      } else if (data.action.indexInDeck) {
        let newCard = render.renderDeckCard(false);
        render.otherPlayerDrawCard(newCard, data.playerName);
      } else {
        let cardFrame = data.action.cards[0];
        let card = render.otherPlayerThrowCard(
          data.playerName,
          cardFrame.suit + cardFrame.value
        );
        this.input.setDraggable(card);
        MainScene.topDiscardPileImage = card;

        if (data.isPlaying) {
          Location.grabToAreas = [Location.myHand];
          MainScene.context.input.off("dragend");
          MainScene.context.input.off("drag");
          MainScene.context.input.on(
            "dragend",
            MainScene.context.onDrawCard,
            MainScene.context
          );
          MainScene.context.input.on(
            "drag",
            MainScene.context.onCardDrag,
            MainScene.context
          );
          MainScene.context.input.setDraggable(MainScene.topDiscardPileImage);
          MainScene.context.input.setDraggable(MainScene.context.deckImages[1]);
        }
      }
    });
  }

  onStartDrawCard(pointer, gameObject: Phaser.GameObjects.Image) {
    this.tempDepth = gameObject.depth;
    gameObject.depth = 1000;
    Location.lastLoc = { x: gameObject.x, y: gameObject.y };
  }

  async onDrawCard(pointer, gameObject: Phaser.GameObjects.Image) {
    for (let grabArea of Location.grabToAreas) {
      if (
        !Location.isCompletedDrag(
          gameObject.x,
          gameObject.y,
          grabArea.x,
          grabArea.y
        )
      ) {
        gameObject.setPosition(Location.lastLoc.x, Location.lastLoc.y);
        gameObject.depth = this.tempDepth;
      } else {
        Location.grabToAreas = [Location.getDiscardPile()];
        this.input.on("drag", this.onCardDrag, this);
        this.input.off("dragend");
        this.input.on("dragend", this.onThrowCard, this);
        await this.drawCard(gameObject, { x: grabArea.x, y: grabArea.y });
        this.meltButton.visible = true;
        break;
      }
    }
  }

  getCardSuitAndValue(cardFrame: string) {
    let suits = ["hearts", "diamonds", "clubs", "spades"];
    for (let suit of suits) {
      if (cardFrame.includes(suit)) {
        return { suit: suit, value: cardFrame.split(suit)[1] };
      }
    }
  }

  async drawCard(
    card: Phaser.GameObjects.Image,
    newLoc: { x: number; y: number }
  ) {
    if (card.frame.name !== "back") {
      this.input.setDraggable(this.deckImages[1], false);
      GameService.myActionSub.next();
      MainScene.topDiscardPileImage = null;
    } else {
      this.input.setDraggable(MainScene.topDiscardPileImage, false);
      let selectedCardIndex = Math.floor(
        Math.random() * MainScene.cardsDeck.length
      );
      card.setFrame(MainScene.cardsDeck[selectedCardIndex]);
      MainScene.cardsDeck.splice(selectedCardIndex, 1);
      this.deckImages.shift();
      let newCardInDeck = render.renderDeckCard(false);
      this.deckImages.push(newCardInDeck);
      GameService.myActionSub.next({
        cards: [this.getCardSuitAndValue(card.frame.name)],
        indexInDeck: selectedCardIndex,
      });
    }
    this.playerHand.set(card.frame.name, card);
    render.reRenderHand(this.playerHand, Location.myHand, 60, 0.9, true);
  }

  async onThrowCard(pointer, gameObject: Phaser.GameObjects.Image) {
    for (let grabArea of Location.grabToAreas) {
      if (
        Location.isCompletedDrag(
          gameObject.x,
          gameObject.y,
          grabArea.x,
          grabArea.y
        )
      ) {
        await this.throwCard(gameObject, { x: grabArea.x, y: grabArea.y });
        this.meltButton.visible = false;
        break;
      } else {
        gameObject.setPosition(Location.lastLoc.x, Location.lastLoc.y);
        gameObject.depth = this.tempDepth;
      }
    }
  }

  async throwCard(
    card: Phaser.GameObjects.Image,
    newLoc: { x: number; y: number }
  ) {
    GameService.myActionSub.next({
      cards: [this.getCardSuitAndValue(card.frame.name)],
    });
    this.playerHand.delete(card.frame.name);
    if (!MainScene.topDiscardPileImage) card.depth = 0;
    else card.depth = MainScene.topDiscardPileImage.depth + 1;
    MainScene.topDiscardPileImage = card;
    card.setPosition(newLoc.x, newLoc.y);
    card.setScale(0.8);
    this.input.setDraggable(card, false);
    this.input.setDraggable(this.deckImages[0], false);
    render.reRenderHand(this.playerHand, Location.myHand, 60, 0.9, false);
  }

  onCardDrag(pointer, gameObject: Phaser.GameObjects.Image, dragX, dragY) {
    gameObject.x = dragX;
    gameObject.y = dragY;
  }
}
