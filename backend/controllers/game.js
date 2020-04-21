const Game = require("../model/game");

exports.getGameData = (req, res, next) => {
  const gameId = req.params.id;
  const playerName = req.params.playerName;

  game = Game.gamesDict.get(gameId);
  console.log(game);
  if (!game) {
    res.status(200).json();
  } else {
    res.status(200).json(game.getGameData(req.body.sessionId));
  }
};
