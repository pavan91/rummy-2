var cards = require("./cards.json");

module.exports = class GameData {
  playersCards = new Map();
  cardsNumEachPlayer = new Map();
  startCardsNum = 7;
  openingCard = [];
  deck;
  playerTurn = 0;

  constructor(playersInGame) {
    shuffle(cards);
    shuffle(playersInGame);

    for (var player of playersInGame) {
      var currPlayerCards = cards.slice(0, this.startCardsNum);
      cards = cards.slice(this.startCardsNum);
      this.playersCards.set(player.sessionId, currPlayerCards);
      this.cardsNumEachPlayer.set(player.name, this.startCardsNum);
    }

    this.openingCard[0] = cards.pop();
    this.deck = cards;
  }

  isPlaying(playerSessionId) {
    return (
      Array.from(this.playersCards.keys())[this.playerTurn] === playerSessionId
    );
  }

  getDeck() {
    return this.deck;
  }

  getOpeningCards() {
    return this.openingCard;
  }

  getPlayerCard(playerSessionId) {
    if (!playerSessionId) {
      return null;
    } else {
      return this.playersCards.get(playerSessionId);
    }
  }

  getOtherPlayersCardsNum() {
    return [...this.cardsNumEachPlayer];
  }
};

function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
