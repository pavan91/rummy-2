const socketEvents = require("../socket-events");
const randtoken = require("rand-token");
const GameData = require("./gameData");

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

  getIsReady() {
    return this.isReady;
  }

  getGameData(playerSessionId) {
    if (!this.gameData) {
      return null;
    } else {
      return {
        isPlaying: this.gameData.isPlaying(playerSessionId),
        openingCards: this.gameData.getOpeningCards(),
        playerCards: this.gameData.getPlayerCard(playerSessionId),
        otherPlayersCardsNum: this.gameData.getOtherPlayersCardsNum(),
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
    this.gameData = new GameData([...playersToPass]);
    var playersInGame = this.joinedPlayers.keys();
    var currPlayer = playersInGame.next();

    while (currPlayer.value) {
      socketEvents.informOfNewGame(currPlayer.value, this.gameId);
      currPlayer = playersInGame.next();
    }
  }

  mapToArray(playersMap, playersArray) {
    var keys = playersMap.keys();
    var sessionId = keys.next();
    while (sessionId.value) {
      playersArray.push({
        sessionId: sessionId.value,
        name: playersMap.get(sessionId.value).playerName,
      });
      sessionId = keys.next();
    }
  }
};
