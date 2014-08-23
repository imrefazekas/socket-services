var should = require("chai").should();

var Server = require('./Server');

describe("connect-rest", function () {
	var server;
	before(function(done){
		server = new Server();

		server.serve( done );
	});

	describe("socket", function () {
		it('Services are', function(done){
			done( );
		});
	});

	after(function(done){
		server.close( function(){ console.log('Node stopped'); done(); } );
	});
});
