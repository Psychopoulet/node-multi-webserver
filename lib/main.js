"use strict";

// deps

	const 	http = require("http"),
			httpshutdown = require("http-shutdown"),
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
			else if ("object" !== typeof options) {
				return Promise.reject("options is not an object");
			}
		else if (!options.name) {
			return Promise.reject("There is no \"name\" option");
		}
			else if ("string" !== typeof options.name) {
				return Promise.reject("\"name\" option is not a string");
			}
		else if (!options.port) {
			return Promise.reject("There is no \"port\" option for server \"" + options.name + "\"");
		}
			else if ("number" !== typeof options.port) {
				return Promise.reject("\"port\" option is not a number");
			}
		else {

			options.ssl = ("boolean" === typeof options.ssl) ? options.ssl : false;

			if (options.ssl) {

				if (!options.key) {
					return Promise.reject("There is no \"key\" option for server \"" + options.name + "\"");
				}
				else if (!options.cert) {
					return Promise.reject("There is no \"cert\" option for server \"" + options.name + "\"");
				}
				
			}

			this.servers.push({
				options: options,
				server: null
			});

			return Promise.resolve();

		}

	}

	setTimeout(timeout) {

		if (!timeout) {
			return Promise.reject("There is no timeout");
		}
			else if ("number" !== typeof timeout) {
				return Promise.reject("timeout is not a number");
			}
		else {

			this.servers.forEach((server) => {

				if (server.server) {
					server.server.setTimeout(timeout);
				}

			});

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
						this.servers[i].server = http.createServer(requestListener);
					}
					else {
						this.servers[i].server = https.createServer(server.options, requestListener);
					}

					this.servers[i].server = httpshutdown(this.servers[i].server).listen(server.options, () => {

						++serversStarted;

						if (serversStarted >= this.servers.length) {
							resolve();
						}

					});

				});

			});
			
		}

	}

	close() {

		if (0 >= this.servers.length) {
			return Promise.resolve();
		}
		else {

			return new Promise((resolve, reject) => {

				let serversStoped = 0;
				this.servers.forEach((current, i) => {

					if (!current.server) {

						++serversStoped;

						if (serversStoped >= this.servers.length) {
							resolve();
						}

					}
					else {

						current.server.shutdown((err) => {

							if (err) {
								reject(err);
							}
							else {

								this.servers[i].server = null;

								++serversStoped;

								if (serversStoped >= this.servers.length) {
									resolve();
								}

							}

						});

					}

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
