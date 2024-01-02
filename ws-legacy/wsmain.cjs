// depreciated; Websocket handled by Rust

// Import the 'ws' library
const WebSocket = require('ws');

// Create a WebSocket server instance, listening on port 3000
const server = new WebSocket.Server({ port: 8081 });

// Event listener for when a client connects to the server
server.on('connection', (socket) => {
  console.log('A client connected');

  // Event listener for messages from the client
  socket.on('message', (message) => {
    console.log(`Received message: ${message}`);

    // Broadcast the message to all connected clients
    server.clients.forEach((client) => {
      if (client !== socket && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  // Event listener for when a client disconnects
  socket.on('close', () => {
    console.log('A client disconnected');
  });
});

console.log('WebSocket server is listening on port 8081');
