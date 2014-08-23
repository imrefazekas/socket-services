var	io = require('socket.io'),
	http = require('http'),
	winston = require('winston'),
	Inflicter = require('harcon');


var toString = Object.prototype.toString;
var isString = function (obj) {
	return "[object String]" === toString.call(obj);
};
var isCommunication =function( obj ){
	return obj && isString(obj.sender) && isString(obj.recipient) && Array.isArray(obj.parameters);
};

function SocketServices( options ){
	var self = this;

	if( !options.server ){
		var port = options.port || 8080;
		var ip_address = options.ipAddress || '0.0.0.0';

		options.server = http.createServer( );
		options.server.listen( port, ip_address, function() {
			self.logger.info('Running on http://'+ip_address + ':' + port);
		});
	}
	this.server = options.server;

	if( !options.logger ){
		var log = options.log || { };
		var transports = [
			options.log ? new (winston.transports.File)( { filename: log.file || 'socket-services.log', level: log.level || 'debug', maxsize: log.maxsize || 1024000, maxFiles: log.maxFiles || 10, handleExceptions: true } ) : new (winston.transports.Console)( { level: 'debug' } )
		];
		options.logger = new (winston.Logger)( { transports: transports } );
	}
	this.logger = options.logger;

	io = io.listen( options.server );

	this.messageValidator = options.messageValidator || isCommunication;

	io.of( options.channel || '/api' ).on('connection', function(socket){
		self.logger.debug('a user connected');
		socket.on('disconnect', function(){
			self.logger.debug('user disconnected');
		});

		socket.on('rester', function (data) {
			self.logger.debug('Incoming message', data );
			if( self.messageValidator( data ) ){
				self.logger.debug('Decent message it seems...', data );

				var params = [ data.recipient ].concat( data.parameters ).concat( function(err, res){
					self.logger.debug('Service executed', err, res );
					socket.emit( data.callbackID || 'response', { err: err, response: res }	);
				} );

				console.log( params );


				var messageID = self.inflicter.ignite.apply( self.inflicter, params );
			}
		});
	});

	this.inflicter = new Inflicter( { logger: self.logger } );
}

var socketServices = SocketServices.prototype;

socketServices.publish = function( name, eventName, fn ){
	if( isString( name ) )
		this.inflicter.addict( name, eventName, fn );
	else
		this.inflicter.addicts( name );
};

socketServices.close = function( callback ){
	var self = this;
	if( this.server ){
		this.server.close( function(){
			self.logger.info('Server stopped');
	  		if( callback )
				callback();
		 } );
	}
};

exports.serve = function( options ) {
	return new SocketServices( options || {} );
};
