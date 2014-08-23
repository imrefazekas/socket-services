var SocketServices = require('../lib/SocketServices');

var socketServices = SocketServices.serve();

socketServices.publish( 'Tester', 'everything', function( data1, data2, callback ){
	console.log( data1, data2 );
	callback( null, 'Done.' );
} );
