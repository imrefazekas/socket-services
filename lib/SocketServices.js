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
	options = options || {};

	var self = this;

	this.logger = options.logger;
	if( !this.logger ){
		var log = options.log || { };
		var transports = [
			options.log ? new (winston.transports.File)( { filename: log.file || 'socket-services.log', level: log.level || 'debug', maxsize: log.maxsize || 1024000, maxFiles: log.maxFiles || 10, handleExceptions: true } ) : new (winston.transports.Console)( { level: 'debug' } )
		];
		this.logger = new (winston.Logger)( { transports: transports } );
	}

	self.server = options.server;
	self.port = options.port || 8080;
	self.ipAddress = options.ipAddress || '0.0.0.0';

	this.messageValidator = options.messageValidator || isCommunication;

	this.channel = options.channel || 'api';
	this.event = options.event || 'rester';

	self.logger.info('Will accepting communication on channel \'' + self.channel + '\' emitting to event \'' + self.event + '\'' );

	this.inflicter = new Inflicter( { logger: self.logger, idLength: options.idLength || 16 } );

	self.logger.info( 'Event system activated.' );
}

var socketServices = SocketServices.prototype;

socketServices.connect = function( callback ){
	var self = this;

	if( !self.server ){
		var port = self.port;
		var ip_address = self.ipAddress;

		self.server = http.createServer( );
		self.server.listen( port, ip_address, function() {
			self.logger.info('Running on http://'+ip_address + ':' + port);
		});
	}

	io = io.listen( self.server );

	io.of( '/' + self.channel ).on('connection', function(socket){
		self.logger.debug('a user connected');
		socket.on('disconnect', function(){
			self.logger.debug('user disconnected');
		});

		socket.on( self.event, function (data) {
			self.logger.debug('Incoming message', data );
			if( self.messageValidator( data ) ){
				self.logger.debug('Decent message it seems...', data );

				var params = [ data.recipient ].concat( data.parameters ).concat( function(err, res){
					self.logger.debug('Service executed', err, res );
					socket.emit( data.callbackID || 'response', { err: err ? err.message : null, response: res }	);
				} );

				console.log( params );


				var messageID = self.inflicter.ignite.apply( self.inflicter, params );
			}
		});
	});

	if( callback )
		callback();
};

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

module.exports = SocketServices;
