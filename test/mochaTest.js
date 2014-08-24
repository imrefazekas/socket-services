var should = require("chai").should();

var SocketServices = require('../lib/SocketServices');

var SocketClient = require('socket-services-client');

describe("socket-services-client", function () {
	var socketServices;
	var client;
	before(function(done){
		socketServices = new SocketServices( { port: 8080, ipAddress: '0.0.0.0', channel: 'api', event: 'rester', idLength: 16 } );
		client = new SocketClient( {
			host: 'http://localhost:8080', name: 'TestClient', channel: 'api', event:'rester', idLength: 16
		} );

		socketServices.connect( function(){
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
				client.send( 'everything', 'How are you?', 'Everything is fine?', function(err, res){
					console.log( 'Responded: ', err, res );
					done( );
				});
			} );
		});
	});

	after(function(done){
		client.disconnect();
		socketServices.close( function(){ console.log('Node stopped'); done(); } );
	});
});
