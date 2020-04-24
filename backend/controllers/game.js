const user = require("../model/user");
const Game = require("../model/game");
const lobbyController = require("./lobby");
const socketEvents = require("../socket-events");

exports.setSocket = (io) => {
  io.on("connection", (socket) => {
    var userSid;

    socket.on("register", (sid) => {
      currentUser = user.connectedUsers.get(sid);
      if (currentUser && currentUser.socket && !currentUser.isConnected) {
        currentUser.isConnected = true;
        user.connectedUsers.set(sid, { socket: socket, isConnected: true });
        userSid = sid;
      } else {
        userSid = socket.id;
        user.login(socket);
      }
      socket.emit("sid", userSid);
    });
    socket.on("disconnect", () => {
      if (user.connectedUsers.has(userSid)) {
        user.connectedUsers.get(userSid).isConnected = false;
        setTimeout(() => {
          if (
            user.connectedUsers.has(userSid) &&
            !user.connectedUsers.get(userSid).isConnected
          ) {
            user.logout(userSid);
          }
        }, 15000);
      }
    });

    socket.on("new-game", (gameName, playersAmount, creatorPlayerName) => {
      lobbyController.createNewGame(
        gameName,
        playersAmount,
        creatorPlayerName,
        userSid
      );
    });

    socket.on("join-a-game", (gameName, playerName) => {
      lobbyController.joinPlayer(gameName, playerName, userSid);
    });

    socket.on("action", (action) => {
      performAction(action);
    });
  });
};

performAction = (actionData) => {
  let nextPlayer;
  let game = Game.gamesDict.get(actionData.gameId);
  let playersInGame = game.getPlayers();
  if (!actionData.action) {
    game.drawFromDiscardPile(actionData.sid);
  } else {
    let indexInDeck = actionData.action.indexInDeck;
    if (actionData.action.meltName) {
    } else if (indexInDeck) {
      game.drawFromDeck(Number.parseInt(indexInDeck), actionData.sid);
    } else {
      game.throwCard(actionData.sid, actionData.action.cards[0]);
      nextPlayer = game.getNextPlayer(actionData.sid);
      console.log(nextPlayer);
    }
  }

  playersInGame.forEach((player, sid) => {
    if (sid !== actionData.sid) {
      let dataToSend = {
        action: actionData.action,
        playerName: playersInGame.get(actionData.sid).playerName,
      };
      if (nextPlayer && sid === nextPlayer) {
        console.log(nextPlayer + "is Playing");
        dataToSend.isPlaying = true;
      }
      socketEvents.informOfAction(sid, dataToSend);
    }
  });
};

exports.getGameData = (req, res, next) => {
  const gameId = req.params.id;
  game = Game.gamesDict.get(gameId);
  if (!game) {
    res.status(200).json();
  } else {
    res.status(200).json(game.getPlayerGameData(req.body.sessionId));
  }
};
