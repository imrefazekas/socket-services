var should = require("chai").should();

var SocketServices = require('../lib/SocketServices');

describe("connect-rest", function () {
	var socketServices;
	before(function(done){
		socketServices = new SocketServices();

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
			done( );
		});
	});

	after(function(done){
		socketServices.close( function(){ console.log('Node stopped'); done(); } );
	});
});
