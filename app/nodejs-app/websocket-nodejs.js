#!/usr/bin/env node
var WebSocketServer = require('websocket').server;
var http = require('http');
// reference at: http://nodejs.org/api/net.html
var net = require('net');


var socketClient = new net.Socket();
socketClient.setKeepAlive(true);
socketClient.connect('80', '192.168.1.199', function() {
    console.log('Socket conectado ao Arduino!');
    //socketClient.write('123456S=0.234');
});
socketClient.on('close', function() {
    console.log('Socket desconectado do Arduino');
});
socketClient.on('error', function() {
    console.log('Um erro de socket foi gerado');
});
socketClient.on('timeout', function() {
    console.log('Socket timeout');
});
socketClient.on('data', function(data) {
    console.log(' Recebido do arduino ' + data);
});


var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(8181, function() {
    console.log((new Date()) + ' Server is listening on port 8181');
});

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date().getTime()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }

    var connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log((new Date().getTime()) + ' Received Message: ' + message.utf8Data);
            connection.sendUTF('From nodejs' + message.utf8Data);
            socketClient.write(message.utf8Data);
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});
