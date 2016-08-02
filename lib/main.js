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
			return Promise.reject("There is no \"port\" option");
		}
		else if (!options.name) {
			return Promise.reject("There is no \"name\" option");
		}
		else {

			options.ssl = ("boolean" === typeof options.ssl) ? options.ssl : false;

			if (options.ssl) {

				if (!options.key) {
					return Promise.reject("There is no \"key\" option");
				}
				else if (!options.cert) {
					return Promise.reject("There is no \"cert\" option");
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
		else if ("function" !== typeof requestListener) {
			return Promise.reject("requestListener is not a function");
		}
		else {

			return new Promise((resolve) => {

				let serversStarted = 0;
				this.servers.forEach((server, i) => {

					if (!server.options.ssl) {

						this.servers[i].server = http.createServer(requestListener).listen(server.options, () => {

							++serversStarted;

							if (serversStarted >= this.servers.length) {
								resolve();
							}

						});

					}
					else {

						this.servers[i].server = https.createServer(server.options, requestListener).listen(server.options, () => {

							++serversStarted;

							if (serversStarted >= this.servers.length) {
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

			return new Promise((resolve) => {

				let serversStoped = 0;
				this.servers.forEach((server, i) => {

					server.server.close(() => {

						this.servers[i].server = null;

						++serversStoped;

						if (serversStoped >= this.servers.length) {
							resolve();
						}

					});

				});

			});
			
		}

	}

	release() {

		return this.close().then(() => {

			this.servers = [];
			return Promise.resolve();

		});

	}

};
