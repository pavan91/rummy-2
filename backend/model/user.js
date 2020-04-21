exports.connectedUsers = new Map();

exports.login = (socket) => {
  this.connectedUsers.set(socket.id, socket);
};

exports.logout = (sessionId) => {
  this.connectedUsers.delete(sessionId);
};
