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
            
            connection.sendUTF('From nodejs ' + message.utf8Data);

            if (getButtonFromCommmand(message.utf8Data) == 'T') {
                var e = equalizeCommand(message.utf8Data);
                socketClient.write(e);

                console.log((new Date().getTime()) + ' Received Message: ' + e);

                startMotoresTimeout();
            } else {
                socketClient.write(message.utf8Data);
                console.log((new Date().getTime()) + ' Received Message: ' + message.utf8Data);
            }


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


/**
 *
 */
var timeoutMotores;
function startMotoresTimeout() {
    clearTimeout(timeoutMotores);
    timeoutMotores = setTimeout(function() {
        // parar motores
        socketClient.write('T=085');
        //socketClient.write('S=085');
        oldValue = 85;
        console.log('MOtOR TIMEOUT');
    }, 250);
}

/**
 * Convert the coordinate received from gamepad API in speed and direction
 * to the Servo.
 * This will set the speed of the servo (with 0 being full-speed in one
 * direction, 180 being full speed in the other, and a value near 90
 * being no movement).
 *
 * @see http://arduino.cc/en/Reference/ServoWrite
 *
 * @param val
 *        - a float value bettwen -1 and 1
 *
 * @return float value to be setted to servo.write(angle)
 *
 */
function calculateServoVal(val) {
  return (val * 90) + 90;
}

/**
 * Obtem o valor do cammando.
 *
 * @param command - String comando, exemplo: "T=065"
 *
 * @return String valor, exemplo: "065"
 */
function getValueFromCommand(command) {
    return command.slice(command.indexOf('=')+1);
}

/**
 * Obtem o botao do cammando.
 *
 * @param command - String comando, exemplo: "T=065"
 *
 * @return String botao, exemplo: "T"
 */
function getButtonFromCommmand(command) {
    return command.slice(0, command.indexOf('='));
}

/**
 * Retorna o valor formatado para que o arduino consiga processar corretamente.
 *
 * @param value - valor do botao precionado
 *
 * @return String contendo o valor no formato N.NNN
 */
function getArduinoValue(value) {
    var str = value.toFixed(0).toString();
    // 999
    if (str.length < 3) {
        if (str.length < 2) {
            str = '0' + str;
        }
        return '0' + str;
    }
    return str;
}

/**
 * .
 * @param
 * @return
 */
var oldValue = 0;
var tolerancia = 10;
function equalizeCommand(command) {
    var value = parseInt(calculateServoVal(getValueFromCommand(command)));
    var diff = oldValue - value;
    var button = getButtonFromCommmand(command);
    if (diff < (tolerancia * -1)) {
        oldValue = oldValue + tolerancia;
        return button + '=' + getArduinoValue(oldValue);
    } else if (diff > tolerancia) {
        oldValue = oldValue - tolerancia;
        return button + '=' + getArduinoValue(oldValue);
    }
    return button + '=' + getArduinoValue(value);
}