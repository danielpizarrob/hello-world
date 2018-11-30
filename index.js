/*
 * Primary file for the API
 *
 */

// Dependencies
var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');

// Instantiate the HTTP Server
var httpServer = http.createServer(function(req,res){
	unifiedServer(req,res);
});

// Start the HTTP server
httpServer.listen(config.port,function(){
	console.log("The server is listening in port " +config.port+ " in " +config.envName+ " mode");
});

// Alle the server logic
var unifiedServer = function(req,res){
// Get the URL and parse it
	var parsedUrl = url.parse(req.url,true);

	// Get the path
	var path = parsedUrl.pathname;
	var trimmedPath = path.replace(/^\/+|\/+$/g,'');

	// Get the query string as an object
	var queryStringObject = parsedUrl.query;

	// Get the HTTP Method
	var method = req.method.toLowerCase();

	// Get the headers as an object
	var headers = req.headers;

	// Get the payload, if any
	var decoder = new StringDecoder('utf-8');
	var buffer = '';
	req.on('data',function(data){
		buffer += decoder.write(data);
	});
	req.on('end',function(){
		buffer += decoder.end();

		// Choose the handler this request should go
		var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

		//Construct the data object to send to the handler
		var data = {
			'trimmedPath' : trimmedPath,
			'queryStringObject' : queryStringObject,
			'method' : method,
			'headers' : headers,
			'payload' : buffer
		};

		// Route the request
		chosenHandler(data,function(statusCode,payload){
			//Use the status code called or default 200
			statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

			//Use the payload called back by the handler
			payload = typeof(payload) == 'object' ? payload : {};

			// Convert the payload in a string
			var payloadString = JSON.stringify(payload);

			// Return the response
			res.setHeader('Content-Type','application/json');
			res.writeHead(statusCode);
			res.end(payloadString);

			// Log the request path
			console.log('Returning this response: ',statusCode,payloadString);
		});
	});
};

// Define the handlers
var handlers = {};

// Ping handler
handlers.hello = function(data,callback){
	var payload = {
		'message' : 'Hello my friend',
		'students': [
			{
				'name' : "Daniel", 
				'surname' : 'Pizarro'
			},
			{
				'name' : "John", 
				'surname' : 'Doe'
			}
		]
	};
	callback(200,payload);
};

// Sample handler
handlers.notFound = function(data,callback){
	callback(404);
};

// Define a request router
var router = {
	'hello' : handlers.hello
};