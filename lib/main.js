"use strict";

// deps

	const 	path = require('path'),
			http = require('http'),
			https = require('path');

// module

module.exports = class MultiWebservers {

	constructor() {

		this.webservers = [];

	}

	addServer(server) {

		if (!server) {
			return Promise.reject("There is no server data");
		}
		else if (!server.port) {
			return Promise.reject("There is no server port");
		}
		else if (!server.requestListener) {
			return Promise.reject("There is no server requestListener");
		}
		else {

			server.ssl = ("boolean" === typeof server.ssl) ? server.ssl : false;

			if (server.ssl) {

				if (!server.privatekey) {
					return Promise.reject("There is no server privatekey");
				}
				else if (!server.certificate) {
					return Promise.reject("There is no server certificate");
				}
				
			}

			this.webservers.push(server);

			return Promise.resolve();

		}

	}

	run() {

		let that = this;
		return new Promise(function(resolve, reject) {

			let serversRunned = 0;
			that.webservers.forEach(function(server) {

				if (!server.ssl) {

					http.createServer(server.requestListener).listen(server.port, function() {

						++serversRunned;

						if (serversRunned >= that.webservers.length) {
							resolve();
						}

					});

				}
				else {

					https.createServer({
						key: server.privatekey,
						cert: server.certificate
					}, server.requestListener).listen(server.port, function() {

						++serversRunned;

						if (serversRunned >= that.webservers.length) {
							resolve();
						}

					}});

				}

			});

		});

	}

};
