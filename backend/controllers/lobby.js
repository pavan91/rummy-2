const Game = require("../model/game");
const randtoken = require("rand-token");
const socketEvents = require("../socket-events");
exports.createNewGame = (
  gameName,
  playersAmount,
  creatorPlayerName,
  sessionId
) => {
  new Game(gameName, playersAmount, creatorPlayerName, sessionId);
};

exports.joinPlayer = async (gameName, playerName, sessionId) => {
  if (gameName) {
    var gameId = Game.nameToIdDict.get(gameName);
    if (!gameId) {
    } else {
      var chosenGame = Game.gamesDict.get(gameId);
      if (chosenGame) {
        await chosenGame.joinPlayer(playerName, sessionId);
        if (chosenGame.getIsReady()) {
          var gameId = randtoken.generate(16);
          chosenGame.start(gameId);
        }
      }
    }
  }
};
