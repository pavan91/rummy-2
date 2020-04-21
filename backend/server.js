const app = require("./app");
const debug = require("debug")("Rummy");
const http = require("http");
const lobbyController = require("./controllers/lobby");

// const socketEvents = require("./socket-events");

const normalizePort = (val) => {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
};

const onError = (error) => {
  if (error.syscall !== "listen") {
    throw error;
  }
  const bind = typeof port === "string" ? "pipe " + port : "port " + port;
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const onListening = () => {
  const addr = server.address();
  const bind = typeof port === "string" ? "pipe " + port : "port " + port;
  debug("Listening on " + bind);
};

const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

const server = http.createServer(app);
const io = require("socket.io")(server);
const user = require("./model/user");

io.on("connection", (socket) => {
  user.login(socket);
  socket.on("disconnect", () => {
    user.logout(socket.id);
  });

  socket.on("new-game", (gameName, playersAmount, creatorPlayerName) => {
    lobbyController.createNewGame(
      gameName,
      playersAmount,
      creatorPlayerName,
      socket.id
    );
  });

  socket.on("join-a-game", (gameName, playerName) => {
    lobbyController.joinPlayer(gameName, playerName, socket.id);
  });
});

server.on("error", onError);
server.on("listening", onListening);
server.listen(port);
