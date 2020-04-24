const server = require("./server");
const io = require("socket.io")(server);
const user = require("./model/user");

exports.informOfNewGame = (playerSessionId, gameName) => {
  if (user.connectedUsers.has(playerSessionId)) {
    user.connectedUsers
      .get(playerSessionId)
      .socket.emit("start-game", gameName);
  }
};

exports.informOfAction = (playerSessionId, action) => {
  if (user.connectedUsers.has(playerSessionId)) {
    user.connectedUsers.get(playerSessionId).socket.emit("action", action);
  }
};
