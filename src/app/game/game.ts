export class MainScene extends Phaser.Scene {
  static players: number;
  static cardsLocations = new Map();
  static controls;
  static playersCards: any[];
  static openingCard;
  static isPlaying;

  constructor() {
    super({ key: "main" });
  }

  preload() {
    this.load.setBaseURL("http://labs.phaser.io");
    this.load.image("background", "assets/skies/gradient1.png");
    this.load.atlas(
      "cards",
      "assets/atlas/cards.png",
      "assets/atlas/cards.json"
    );
  }

  create() {
    let background = this.add.image(400, 300, "background");
    background.setScale(3);
    var frames = this.textures.get("cards").getFrameNames();
    frames.splice(0, 1);
    this.renderHand(MainScene.playersCards);
    this.renderDeck(frames);
    this.input.on("dragend", this.onCardDragEnd);
    this.input.on("drag", this.onCardDrag);
    var cursors = this.input.keyboard.createCursorKeys();
    var controlConfig = {
      camera: this.cameras.main,
      left: cursors.left,
      right: cursors.right,
      up: cursors.up,
      down: cursors.down,
      acceleration: 0.04,
      drag: 0.0005,
      maxSpeed: 0.7,
    };
    MainScene.controls = new Phaser.Cameras.Controls.SmoothedKeyControl(
      controlConfig
    );
    this.cameras.main.setBounds(0, 0, 2048, 1200);
  }

  update(time, delta) {
    MainScene.controls.update(delta);
  }

  onCardDrag(pointer, gameObject, dragX, dragY) {
    if (MainScene.isPlaying) {
      gameObject.x = dragX;
      gameObject.y = dragY;
    }
  }

  onCardDragEnd(pointer, gameObject: Phaser.GameObjects.Image) {
    // gameObject.x = MainScene.cardsLocations.get(gameObject.frame.name).x;
    // gameObject.y = MainScene.cardsLocations.get(gameObject.frame.name).y;
  }

  renderDeck(cards) {
    this.renderCard(
      (this.game.config.width as number) / 8 - 70,
      (this.game.config.height as number) / 3,
      "back",
      0.8
    );
    this.renderCard(
      (this.game.config.width as number) / 8 + 70,
      (this.game.config.height as number) / 3,
      MainScene.openingCard.frame,
      0.8
    );
  }

  renderCard(x, y, frameName, scale) {
    let image = this.add.image(x, y, "cards", frameName);
    image.setScale(scale);
  }

  renderHand(playersCards: any[]) {
    if (playersCards) {
      let image: Phaser.GameObjects.Image;
      let numberOfCards = playersCards.length;
      let i = 0;
      for (let card of playersCards) {
        image = this.add.image(
          (this.game.config.width as number) / 2 +
            (i + 1 - numberOfCards / 2) * 60,
          550,
          // 550 + Math.abs(numberOfCards / 2 - i) * 15,
          "cards",
          card.frame
        );
        image.setScale(0.9);
        // image.setRotation(Math.PI + (3.5 * -1 + i / numberOfCards));
        image.setInteractive();
        this.input.setDraggable(image);
        ++i;
      }
    }
  }
}
