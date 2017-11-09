"use strict";

// deps

	const http = require("http");
	const httpshutdown = require("http-shutdown");
	const https = require("https");

// module

module.exports = class MultiWebservers {

	constructor () {

		this.servers = [];

	}

	addServer (options) {

		return Promise.resolve().then(() => {

			if ("undefined" === typeof options) {
				return Promise.reject(new ReferenceError("There is no options data"));
			}
				else if ("object" !== typeof options) {
					return Promise.reject(new TypeError("options is not an object"));
				}
			else if ("undefined" === typeof options.name) {
				return Promise.reject(new ReferenceError("There is no \"name\" option"));
			}
				else if ("string" !== typeof options.name) {
					return Promise.reject(new TypeError("\"name\" option is not a string"));
				}
			else if ("undefined" === typeof options.port) {
				return Promise.reject(new ReferenceError("There is no \"port\" option for server \"" + options.name + "\""));
			}
				else if ("number" !== typeof options.port) {
					return Promise.reject(new TypeError("\"port\" option is not a number for server \"" + options.name + "\""));
				}
			else {
				return Promise.resolve();
			}

		}).then(() => {

			let error = "";
			for (let i = 0; i < this.servers.length; ++i) {

				if (this.servers[i].options.name === options.name) {
					error = new Error("There is already a server named \"" + options.name + "\"");
				}
				else if (this.servers[i].options.port === options.port) {
					error = new Error("There is already a server with port \"" + options.port + "\"");
				}

				if (error) {
					break;
				}

			}

			if (!error) {

				options.ssl = "boolean" === typeof options.ssl ? options.ssl : false;

				if (options.ssl) {

					if ("undefined" === typeof options.key) {
						error = new ReferenceError("There is no \"key\" option for server \"" + options.name + "\"");
					}
						else if ("string" !== typeof options.key) {
							error = new TypeError("\"key\" option is not a string for server \"" + options.name + "\"");
						}
					else if ("undefined" === typeof options.cert) {
						error = new ReferenceError("There is no \"cert\" option for server \"" + options.name + "\"");
					}
						else if ("string" !== typeof options.cert) {
							error = new TypeError("\"cert\" option is not a string for server \"" + options.name + "\"");
						}

				}

			}

			return error ? Promise.reject(error) : Promise.resolve().then(() => {

				this.servers.push({
					options,
					"server": null
				});

				return Promise.resolve();

			});

		});

	}

	setTimeout (timeout) {

		return Promise.resolve().then(() => {

			if ("undefined" === typeof timeout) {
				return Promise.reject(new ReferenceError("There is no timeout"));
			}
				else if ("number" !== typeof timeout) {
					return Promise.reject(new TypeError("timeout is not an number"));
				}
			else {
				return Promise.resolve();
			}

		}).then(() => {

			return 0 >= this.servers.length ? Promise.resolve() : Promise.resolve().then(() => {

				this.servers.forEach((current) => {

					if (current.server) {
						current.server.setTimeout(timeout);
					}

				});

				return Promise.resolve();

			});

		});

	}

	listen (requestListener) {

		return Promise.resolve().then(() => {

			if ("undefined" === typeof requestListener) {
				return Promise.reject(new ReferenceError("There is no requestListener"));
			}
				else if ("function" !== typeof requestListener) {
					return Promise.reject(new TypeError("requestListener is not a function"));
				}
			else {
				return Promise.resolve();
			}

		}).then(() => {

			return this.listening() ? Promise.resolve() : new Promise((resolve) => {

				let serversStarted = 0;
				this.servers.forEach((current, i) => {

					this.servers[i].server = current.options.ssl ?
						https.createServer(current.options, requestListener) :
						http.createServer(requestListener);

					this.servers[i].server = httpshutdown(this.servers[i].server).listen(current.options, () => {

						++serversStarted;

						if (serversStarted >= this.servers.length) {
							resolve();
						}

					});

				});

			});

		});

	}

	listening () {

		let listening = false;

			for (let i = 0; i < this.servers.length && !listening; ++i) {

				if (this.servers[i] && this.servers[i].server && this.servers[i].server.listening) {
					listening = true;
				}

			}

		return listening;

	}

	close () {

		return Promise.resolve().then(() => {

			return 0 >= this.servers.length ? Promise.resolve() : new Promise((resolve) => {

				let serversStoped = 0;
				this.servers.forEach((current, i) => {

					if (!current.server) {

						++serversStoped;
						if (serversStoped >= this.servers.length) {
							resolve();
						}

					}
					else {

						for (const event in current.server._events) {

							if (Object.prototype.hasOwnProperty.call(current.server._events, event)) {
								current.server.removeAllListeners(event);
							}

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

		});

	}

	release () {

		return Promise.resolve().then(() => {

			return this.close().then(() => {

				this.servers = [];
				return Promise.resolve();

			});

		});

	}

};
