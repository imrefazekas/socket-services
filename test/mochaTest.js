var should = require("chai").should();

// Requires SocketServices. Note: in your code require('SocketServices') will be appropriate
var SocketServices = require('../lib/SocketServices');

var SocketClient = require('socket-services-client');

describe("socket-services-client", function () {
	var socketServices;
	var client;
	before(function(done){
		// Initializes the Sockets services using an option object. Not passing a server (connect >=3.0) instances, it will create one
		socketServices = new SocketServices( { port: 8080, ipAddress: '0.0.0.0', channel: 'api', event: 'rester', idLength: 16 } );

		// Creates a client to test with
		client = new SocketClient( {
			host: 'http://localhost:8080', name: 'TestClient', channel: 'api', event:'rester', idLength: 16
		} );

		// Starts the server
		socketServices.connect( function(){
			// Publishes a component 'Tester' listening to messages 'everything'
			socketServices.publish( 'Tester', 'everything', function( data1, data2, callback ){
				console.log( data1, data2 );
				callback( null, 'Done.' );
			} );

			done();
		});
	});

	describe("socket", function () {
		it('Services are', function(done){
			client.connect( function(){
				// The client sends a message 'everything' with 2 parameters and has a callback with the expected answer
				client.send( 'everything', 'How are you?', 'Everything is fine?', function(err, res){
					console.log( 'Responded: ', err, res );
					done( );
				});
			} );
		});
	});

	after(function(done){
		client.disconnect();
		// Terminates the server when not needed anymore
		socketServices.close( function(){ console.log('Node stopped'); done(); } );
	});
});
