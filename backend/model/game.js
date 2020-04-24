const socketEvents = require("../socket-events");
const randtoken = require("rand-token");
const GameData = require("./gameData");
var cards = require("./cards.json");

module.exports = class Game {
  static gamesDict = new Map();
  static nameToIdDict = new Map();
  joinedPlayers = new Map();
  isReady = false;
  gameData;

  constructor(name, playersAmount, creatorPlayerName, sessionId) {
    this.gameId = randtoken.generate(16);
    this.name = name;
    this.playersInGame = playersAmount;
    this.joinedPlayers.set(sessionId, { playerName: creatorPlayerName });
    Game.gamesDict.set(this.gameId, this);
    Game.nameToIdDict.set(this.name, this.gameId);
  }

  getPlayers() {
    return this.joinedPlayers;
  }

  getIsReady() {
    return this.isReady;
  }

  getPlayersCardsNum() {
    let playersCardsNum = [];
    this.joinedPlayers.forEach((player, sid) => {
      playersCardsNum.push({
        name: player.playerName,
        numberOfCards: this.gameData.getPlayerCardsNum(sid),
      });
    });

    return playersCardsNum;
  }

  getPlayerGameData(playerSessionId) {
    if (!this.gameData) {
      return null;
    } else {
      return {
        isPlaying: this.gameData.isPlaying(playerSessionId),
        discardPile: this.gameData.getDiscardPile(),
        playerCards: this.gameData.getPlayerCards(playerSessionId),
        otherPlayersCardsNum: this.getPlayersCardsNum(),
        deck: this.gameData.getDeck(),
      };
    }
  }

  joinPlayer(playerName, sessionId) {
    if (
      this.isReady ||
      this.joinedPlayers.values.length === this.playersInGame
    ) {
      return;
    } else {
      this.joinedPlayers.set(sessionId, { playerName: playerName });
      this.isReady = this.joinedPlayers.size === this.playersInGame;
    }
  }

  start() {
    var playersToPass = [];
    this.mapToArray(this.joinedPlayers, playersToPass);
    this.gameData = new GameData([...playersToPass], [...cards]);
    this.joinedPlayers.forEach((player, playerSid) => {
      socketEvents.informOfNewGame(playerSid, this.gameId);
    });
  }

  getNextPlayer(sid) {
    return this.gameData.getNextPlayer(sid);
  }

  drawFromDeck(cardIndex, playerSid) {
    let card = this.gameData.removeCardOfDeck(cardIndex);
    this.gameData.addCardToPlayer(playerSid, card);
  }

  drawFromDiscardPile(playerSid) {
    let card = this.gameData.getDiscardPile().shift();
    this.gameData.addCardToPlayer(playerSid, card);
  }

  throwCard(playerSid, card) {
    this.gameData.getDiscardPile().unshift(card);
    this.gameData.removeCardOfPlayer(playerSid);
  }

  mapToArray(playersMap, playersArray) {
    playersMap.forEach((player, playerSid) => {
      playersArray.push({
        sessionId: playerSid,
        name: player.playerName,
      });
    });
  }
};
