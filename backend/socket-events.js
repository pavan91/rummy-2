const server = require("./server");
const io = require("socket.io")(server);
const user = require("./model/user");

exports.informOfNewGame = (playerSessionId, gameName) => {
  user.connectedUsers.get(playerSessionId).emit("start-game", gameName);
};
