"use strict";

// deps

	const 	http = require("http"),
			https = require("https");

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
		else if (!server.name) {
			return Promise.reject("There is no server name");
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

	listen(requestListener) {

		if (!requestListener) {
			return Promise.reject("There is no requestListener");
		}
		else {

			let that = this;
			return new Promise(function(resolve) {

				let serversStarted = 0;
				that.webservers.forEach(function(server, i) {

					if (!server.ssl) {

						that.webservers[i].server = http.createServer(requestListener).listen(server.port, function() {

							++serversStarted;

							if (serversStarted >= that.webservers.length) {
								resolve();
							}

						});

					}
					else {

						that.webservers[i].server = https.createServer({
							key: server.privatekey,
							cert: server.certificate
						}, server.requestListener).listen(server.port, function() {

							++serversStarted;

							if (serversStarted >= that.webservers.length) {
								resolve();
							}

						});

					}

				});

			});
			
		}

	}

	close() {

		if (0 >= this.webservers.length) {
			return Promise.resolve();
		}
		else {

			let that = this;
			return new Promise(function(resolve) {

				let serversStoped = 0;
				that.webservers.forEach(function(server) {

					server.server.close(function() {

						++serversStoped;

						if (serversStoped >= that.webservers.length) {
							resolve();
						}

					});

				});

			});
			
		}

	}

	release() {

		let that = this;
		return this.close().then(function() {

			that.webservers = [];
			return Promise.resolve();

		});

	}

};
