var socket = require('socket.io-client')('http://localhost:8080/api');
socket.on('connect', function(){
	socket.on('event', function(data){
		console.log( 'event happened', data );
	});
	socket.on('disconnect', function(){
		console.log( 'disconnected' );
	});
	socket.on('reconnect', function(){
		console.log( 'reconnected' );
	});

	socket.on('bokor', function () {
		console.log( arguments );
	});
	socket.emit( 'rester', { sender: 'Client', callbackID: 'bokor', recipient: 'everything', parameters: ['How are you?', 'Everything is fine?'] } );

});
