"use strict";

// deps

	const 	http = require("http"),
			https = require("https");

// module

module.exports = class MultiWebservers {

	constructor() {

		this.servers = [];

	}

	addServer(options) {

		if (!options) {
			return Promise.reject("There is no options data");
		}
		else if (!options.port) {
			return Promise.reject("There is no port option");
		}
		else if (!options.name) {
			return Promise.reject("There is no name option");
		}
		else {

			options.ssl = ("boolean" === typeof options.ssl) ? options.ssl : false;

			if (options.ssl) {

				if (!options.privatekey) {
					return Promise.reject("There is no privatekey option");
				}
				else if (!options.certificate) {
					return Promise.reject("There is no certificate option");
				}
				
			}

			this.servers.push({
				options: options,
				server: null
			});

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
				that.servers.forEach(function(server, i) {

					if (!server.options.ssl) {

						that.servers[i].server = http.createServer(requestListener).listen(server.options, function() {

							++serversStarted;

							if (serversStarted >= that.servers.length) {
								resolve();
							}

						});

					}
					else {

						that.servers[i].server = https.createServer({
							key: server.options.privatekey,
							cert: server.options.certificate
						}, requestListener).listen(server.options, function() {

							++serversStarted;

							if (serversStarted >= that.servers.length) {
								resolve();
							}

						});

					}

				});

			});
			
		}

	}

	close() {

		if (0 >= this.servers.length) {
			return Promise.resolve();
		}
		else {

			let that = this;
			return new Promise(function(resolve) {

				let serversStoped = 0;
				that.servers.forEach(function(server) {

					server.server.close(function() {

						++serversStoped;

						if (serversStoped >= that.servers.length) {
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

			that.servers = [];
			return Promise.resolve();

		});

	}

};
