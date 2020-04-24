exports.connectedUsers = new Map();

exports.login = (socket) => {
  this.connectedUsers.set(socket.id, { socket: socket, isConnected: true });
};

exports.logout = (sessionId) => {
  this.connectedUsers.delete(sessionId);
};
