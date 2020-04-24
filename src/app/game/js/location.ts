export class Location {
  public static myHand: { x: number; y: number };
  private static playersHands;
  public static grabToAreas: { x: number; y: number }[] = [];
  private static discardPile: { x: number; y: number };
  public static lastLoc: { x: number; y: number };

  static setDiscardPile(discardPile) {
    Location.discardPile = discardPile;
  }
  static getDiscardPile() {
    return Location.discardPile;
  }

  static getHandsLocations(gameWidth) {
    if (Location.playersHands) return Location.playersHands;
    Location.playersHands = {
      2: [{ x: gameWidth / 2, y: 100 }],
      3: [
        { x: gameWidth / 3, y: 100 },
        { x: (gameWidth * 2) / 3, y: 100 },
      ],
      4: [
        { x: 100, y: 100 },
        { x: 100, y: 100 },
        { x: 100, y: 100 },
      ],
      5: [
        { x: 100, y: 100 },
        { x: 100, y: 100 },
        { x: 100, y: 100 },
        { x: 100, y: 100 },
      ],
      6: [
        { x: 100, y: 100 },
        { x: 100, y: 100 },
        { x: 100, y: 100 },
        { x: 100, y: 100 },
        { x: 100, y: 100 },
      ],
    };

    return Location.playersHands;
  }

  static isCompletedDrag(dragObjectX, dragObjectY, destX, destY) {
    let disLastToCurr = Phaser.Math.Distance.Between(
      Location.lastLoc.x,
      Location.lastLoc.y,
      dragObjectX,
      dragObjectY
    );
    let disCurrToNew = Phaser.Math.Distance.Between(
      dragObjectX,
      dragObjectY,
      destX,
      destY
    );

    return disCurrToNew < disLastToCurr;
  }
}
