var websocketClient = {
	websocket : null,
	WS_ADDRESS : 'ws://192.168.1.198:8181/',
	WS_PROTOCOL : 'echo-protocol',
	init : function() {
		websocketClient.connect();
	},
	connect : function() {
		websocket = new WebSocket(websocketClient.WS_ADDRESS, websocketClient.WS_PROTOCOL); 
		websocket.onopen = function(evt) { 
			console.log('Websocket connected at ' + websocketClient.WS_ADDRESS);
		}; 
		websocket.onclose = function(evt) {
			console.log('Websocket disconnected at ' + websocketClient.WS_ADDRESS);
		}; 
		websocket.onmessage = function(evt) { 
			console.log((new Date().getTime()) + ' Websocket message received ' + evt.data);
		}; 
		websocket.onerror = function(evt) { 
			onError('Websocket error ' + evt.data); 
		}; 
	},
	sendData : function(data) {
		websocket.send(data);
	}
};