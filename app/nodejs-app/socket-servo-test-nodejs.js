#!/usr/bin/env node

// reference at: http://nodejs.org/api/net.html
var net = require('net');
var socketClient = new net.Socket();
socketClient.setKeepAlive(true);
socketClient.connect('80', '192.168.1.199', function() {
    console.log('Socket conectado ao Arduino!');
    for (var i = 0; i <= 180; i += 10) {
        var str = i + "";
        if (str.length == 1) {
            str = "00" + str;
        } else if (str.length == 2) {
            str = "0" + str;
        }
	   socketClient.write(str);
    }
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
    console.log('Recebido do arduino ' + data);
});


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