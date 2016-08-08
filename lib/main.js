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

			return new Promise((resolve, reject) => {

				let error = "";
				for(let i = 0; i < this.servers.length; ++i) {

					if (this.servers[i].options.name === options.name) {
						error = "There is already a server named \"" + options.name + "\"";
					}
					else if (this.servers[i].options.port === options.port) {
						error = "There is already a server with port \"" + options.port + "\"";
					}

					if (error) {
						break;
					}

				}

				if (!error) {

					options.ssl = ("boolean" === typeof options.ssl) ? options.ssl : false;

					if (options.ssl) {

						if (!options.key) {
							error = "There is no \"key\" option for server \"" + options.name + "\"";
						}
						else if (!options.cert) {
							error = "There is no \"cert\" option for server \"" + options.name + "\"";
						}
						
					}

				}

				if (error) {
					reject(error);
				}
				else {

					this.servers.push({
						options: options,
						server: null
					});

					resolve();
					
				}

			});

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

			return new Promise((resolve) => {

				this.servers.forEach((current) => {

					if (current.server) {
						current.server.setTimeout(timeout);
					}

				});

				resolve();

			});

		}

	}

	listen(requestListener) {

		if (this.listening()) {
			return Promise.resolve();
		}
		else {

			if (!requestListener) {
				return Promise.reject("There is no requestListener");
			}
				else if ("function" !== typeof requestListener) {
					return Promise.reject("requestListener is not a function");
				}
			else {

				return new Promise((resolve) => {

					let serversStarted = 0;
					this.servers.forEach((current, i) => {

						this.servers[i].server = (current.options.ssl) ? https.createServer(current.options, requestListener) : http.createServer(requestListener);
						this.servers[i].server = httpshutdown(this.servers[i].server).listen(current.options, () => {

							++serversStarted;

							if (serversStarted >= this.servers.length) {
								resolve();
							}

						});

					});

				});
				
			}
		
		}

	}

	listening() {

		let listening = false;

			for (let i = 0; i < this.servers.length && !listening; ++i) {

				if (this.servers[i] && this.servers[i].server && this.servers[i].server.listening) {
					listening = true;
				}

			}

		return listening;

	}

	close() {

		if (0 >= this.servers.length) {
			return Promise.resolve();
		}
		else {

			return new Promise((resolve) => {

				let serversStoped = 0;
				this.servers.forEach((current, i) => {

					if (!current.server) {

						++serversStoped;
						if (serversStoped >= this.servers.length) {
							resolve();
						}

					}
					else {

						for (let event in current.server._events) {
							current.server.removeAllListeners(event);
						}

						current.server.shutdown(() => {

							this.servers[i].server = null;

							++serversStoped;
							if (serversStoped >= this.servers.length) {
								resolve();
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
