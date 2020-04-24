module.exports = class GameData {
  playersCards = new Map();
  startCardsNum = 7;
  discardPile = [];
  deck;
  playerTurn = 0;
  cards;

  constructor(playersInGame, cards) {
    this.cards = cards;
    shuffle(cards);
    shuffle(playersInGame);

    for (var player of playersInGame) {
      var currPlayerCards = this.cards.slice(0, this.startCardsNum);
      this.cards = this.cards.slice(this.startCardsNum);
      this.playersCards.set(player.sessionId, currPlayerCards);
    }

    this.discardPile[0] = this.cards.pop();
    this.deck = this.cards;
  }

  isPlaying(playerSessionId) {
    return (
      Array.from(this.playersCards.keys())[this.playerTurn] === playerSessionId
    );
  }

  getNextPlayer(playerSid) {
    let players = this.playersCards.keys();
    let currPlayer = players.next();
    while (currPlayer) {
      if (currPlayer.value === playerSid) {
        let nextPlayer = players.next();
        if (nextPlayer && nextPlayer.value) {
          return nextPlayer.value;
        } else {
          return this.playersCards.keys().next().value;
        }
      }
      currPlayer = players.next();
    }
  }

  getDeck() {
    return this.deck;
  }

  getDiscardPile() {
    return this.discardPile;
  }

  getPlayerCards(playerSessionId) {
    if (!playerSessionId) {
      return null;
    } else {
      return this.playersCards.get(playerSessionId);
    }
  }

  removeCardOfPlayer(playerSessionId, card) {
    let indexOfCard = this.playersCards.get(playerSessionId).indexOf(card);
    this.playersCards.get(playerSessionId).splice(indexOfCard, 1);
  }

  addCardToPlayer(playerSessionId, card) {
    this.playersCards
      .get(playerSessionId)
      .push({ suit: card.suit, value: card.value });
  }

  getPlayerCardsNum(sid) {
    return this.playersCards.get(sid).length;
  }

  removeCardOfDeck(cardIndex) {
    let card = this.deck[cardIndex];
    this.deck.splice(cardIndex, 1);
    return card;
  }
};

function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
