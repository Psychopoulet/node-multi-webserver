"use strict";

// deps

	const path = require("path");
	const assert = require("assert");
	const http = require("http");
	const https = require("https");

	const express = require("express");
	const fs = require("node-promfs");

	const SimpleSSL = require("simplessl");
	const MultiServers = require(path.join(__dirname, "..", "lib", "main.js"));

// private

	const SSL = new SimpleSSL();
	const CRTPATH = path.join(__dirname, "crt");
		const SERVER_KEY = path.join(CRTPATH, "server.key");
		const SERVER_CSR = path.join(CRTPATH, "server.csr");
		const SERVER_CRT = path.join(CRTPATH, "server.crt");

	const MESSAGE = "Hello World";
	const CONTENT_TYPE = "text/plain";

// tests

(0, process).env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

describe("test wrong using", () => {

	const servers = new MultiServers();

	after(() => {
		return servers.release();
	});

	describe("timeout", () => {

		it("should fail on missing timeout", (done) => {

			servers.setTimeout().then(() => {
				done(new Error("run with missing timeout"));
			}).catch((err) => {

				assert.strictEqual("object", typeof err, "err is not an object");
				assert.strictEqual(true, err instanceof ReferenceError, "err is not an ReferenceError");

				done();

			});

		});

			it("should fail on wrong timeout", (done) => {

				servers.setTimeout("test").then(() => {
					done(new Error("run with wrong timeout"));
				}).catch((err) => {

					assert.strictEqual("object", typeof err, "err is not an object");
					assert.strictEqual(true, err instanceof TypeError, "err is not an TypeError");

					done();

				});

			});

	});

	describe("addServer", () => {

		afterEach(() => {
			return servers.release();
		});

		it("should fail on missing data", (done) => {

			servers.addServer().then(() => {
				done(new Error("run with missing data"));
			}).catch((err) => {

				assert.strictEqual("object", typeof err, "err is not an object");
				assert.strictEqual(true, err instanceof ReferenceError, "err is not an ReferenceError");

				done();

			});

		});

			it("should fail on wrong data", (done) => {

				servers.addServer(false).then(() => {
					done(new Error("run with wrong data"));
				}).catch((err) => {

					assert.strictEqual("object", typeof err, "err is not an object");
					assert.strictEqual(true, err instanceof TypeError, "err is not an TypeError");

					done();

				});

			});

			it("should fail on missing name data", (done) => {

				servers.addServer({}).then(() => {
					done(new Error("run with missing name data"));
				}).catch((err) => {

					assert.strictEqual("object", typeof err, "err is not an object");
					assert.strictEqual(true, err instanceof ReferenceError, "err is not an ReferenceError");

					done();

				});

			});

				it("should fail on wrong name data", (done) => {

					servers.addServer({ "name": 5 }).then(() => {
						done(new Error("run with wrong name data"));
					}).catch((err) => {

						assert.strictEqual("object", typeof err, "err is not an object");
						assert.strictEqual(true, err instanceof TypeError, "err is not an TypeError");

						done();

					});

				});

			it("should fail on missing port data", (done) => {

				servers.addServer({ "name": "test" }).then(() => {
					done(new Error("run with missing port data"));
				}).catch((err) => {

					assert.strictEqual("object", typeof err, "err is not an object");
					assert.strictEqual(true, err instanceof ReferenceError, "err is not an ReferenceError");

					done();

				});

			});

				it("should fail on wrong port data", (done) => {

					servers.addServer({
						"name": "test",
						"port": "cinq"
					}).then(() => {
						done(new Error("run with wrong port data"));
					}).catch((err) => {

						assert.strictEqual("object", typeof err, "err is not an object");
						assert.strictEqual(true, err instanceof TypeError, "err is not an TypeError");

						done();

					});

				});

			it("should fail on missing key data", (done) => {

				servers.addServer({
					"name": "test",
					"port": 1337,
					"ssl": true
				}).then(() => {
					done(new Error("run with missing key data"));
				}).catch((err) => {

					assert.strictEqual("object", typeof err, "err is not an object");
					assert.strictEqual(true, err instanceof ReferenceError, "err is not an ReferenceError");

					done();

				});

			});

				it("should fail on wrong key data", (done) => {

					servers.addServer({
						"name": "test",
						"port": 1337,
						"ssl": true,
						"key": false
					}).then(() => {
						done(new Error("run with wrong key data"));
					}).catch((err) => {

						assert.strictEqual("object", typeof err, "err is not an object");
						assert.strictEqual(true, err instanceof TypeError, "err is not an TypeError");

						done();

					});

				});

			it("should fail on missing cert data", (done) => {

				servers.addServer({
					"name": "test",
					"port": 1337,
					"ssl": true,
					"key": "test"
				}).then(() => {
					done(new Error("run with missing cert data"));
				}).catch((err) => {

					assert.strictEqual("object", typeof err, "err is not an object");
					assert.strictEqual(true, err instanceof ReferenceError, "err is not an ReferenceError");

					done();

				});

			});

				it("should fail on wrong cert data", (done) => {

					servers.addServer({
						"name": "test",
						"port": 1337,
						"ssl": true,
						"key": "test",
						"cert": false
					}).then(() => {
						done(new Error("run with wrong cert data"));
					}).catch((err) => {

						assert.strictEqual("object", typeof err, "err is not an object");
						assert.strictEqual(true, err instanceof TypeError, "err is not an TypeError");

						done();

					});

				});

		it("should fail on already used port", (done) => {

			servers.addServer({
				"name": "test",
				"port": 1337
			}).then(() => {

				return servers.addServer({
					"name": "test2",
					"port": 1337
				});

			}).then(() => {
				done(new Error("run with already used port"));
			}).catch((err) => {

				assert.strictEqual("object", typeof err, "err is not an object");
				assert.strictEqual(true, err instanceof Error, "err is not an Error");

				done();

			});

		});

		it("should fail on already used name", (done) => {

			servers.addServer({
				"name": "test",
				"port": 1338
			}).then(() => {

				return servers.addServer({
					"name": "test",
					"port": 1337
				});

			}).then(() => {
				done(new Error("run with already used name"));
			}).catch((err) => {

				assert.strictEqual("object", typeof err, "err is not an object");
				assert.strictEqual(true, err instanceof Error, "err is not an Error");

				done();

			});

		});

	});

	describe("listen", () => {

		it("should fail on missing requestListener", (done) => {

			servers.listen().then(() => {
				done(new Error("run with missing requestListener"));
			}).catch((err) => {

				assert.strictEqual("object", typeof err, "err is not an object");
				assert.strictEqual(true, err instanceof ReferenceError, "err is not an ReferenceError");

				done();

			});

		});

			it("should fail on wrong requestListener", (done) => {

				servers.listen(false).then(() => {
					done(new Error("run with wrong requestListener"));
				}).catch((err) => {

					assert.strictEqual("object", typeof err, "err is not an object");
					assert.strictEqual(true, err instanceof TypeError, "err is not an TypeError");

					done();

				});

			});

	});

});

describe("create one http server", () => {

	const servers = new MultiServers();

	after(() => {
		return servers.release();
	});

	it("should create http server", () => {

		return servers.addServer({
			"port": 1337,
			"name": "basic http server",
			"ssl": false
		}).then(() => {

			return servers.listen((req, res) => {

				res.writeHead(200, {
					"Content-Type": CONTENT_TYPE
				});

				res.end(MESSAGE);

			});

		}).then(() => {

			return servers.listen((req, res) => {

				res.writeHead(200, {
					"Content-Type": CONTENT_TYPE
				});

				res.end(MESSAGE);

			});

		}).then(() => {

			assert.strictEqual(1, servers.servers.length, "server number is incorrect");
			assert.strictEqual(true, servers.listening(), "server is not listening");

			assert.strictEqual(1337, servers.servers[0].options.port, "first server name is incorrect");
			assert.strictEqual("basic http server", servers.servers[0].options.name, "first server name is incorrect");
			assert.strictEqual(false, servers.servers[0].options.ssl, "first server ssl is incorrect");

			return Promise.resolve();

		});

	});

	it("should request this server with wrong port", (done) => {

		http.request({
			"port": 1338,
			"hostname": "127.0.0.1"
		}, (res) => {

			res.on("error", () => {
				done();
			}).on("end", () => {
				done("Request passed");
			});

		}).on("error", () => {
			done();
		}).end();

	}).timeout(5000);

	it("should request this server with right data", (done) => {

		http.request({
			"port": 1337,
			"hostname": "127.0.0.1"
		}, (res) => {

			res.setEncoding("utf8");

			assert.strictEqual(200, res.statusCode, "request statusCode is incorrect");
			assert.strictEqual(CONTENT_TYPE, res.headers["content-type"], "request content-type is incorrect");

			let str = "";
			res.on("data", (chunk) => {
				str += chunk;
			}).on("error", (err) => {
				done(err);
			}).on("end", () => {

				assert.strictEqual(MESSAGE, str, "request response is incorrect");
				done();

			});

		}).on("error", (err) => {
			done(err);
		}).end();

	}).timeout(5000);

	it("should stop the server", () => {

		return servers.release();

	});

});

describe("create two http servers", () => {

	const servers = new MultiServers();

	after(() => {
		return servers.release();
	});

	it("should create servers", () => {

		return servers.addServer({
			"port": 1337,
			"name": "basic http server",
			"ssl": false
		}).then(() => {

			return servers.addServer({
				"port": 1338,
				"name": "admin server",
				"ssl": false
			});

		}).then(() => {

			return servers.listen((req, res) => {

				res.writeHead(200, {
					"Content-Type": CONTENT_TYPE
				});

				res.end(MESSAGE);

			});

		}).then(() => {

			assert.strictEqual(2, servers.servers.length, "server number is incorrect");
			assert.strictEqual(true, servers.listening(), "servers are not listening");

			assert.strictEqual(1337, servers.servers[0].options.port, "first server name is incorrect");
			assert.strictEqual("basic http server", servers.servers[0].options.name, "first server name is incorrect");
			assert.strictEqual(false, servers.servers[0].options.ssl, "first server ssl is incorrect");

			assert.strictEqual(1338, servers.servers[1].options.port, "second server name is incorrect");
			assert.strictEqual("admin server", servers.servers[1].options.name, "second server name is incorrect");
			assert.strictEqual(false, servers.servers[1].options.ssl, "second server ssl is incorrect");

			return Promise.resolve();

		});

	}).timeout(5000);

	it("should request these servers with wrong port", (done) => {

		http.request({
			"port": 1339,
			"hostname": "127.0.0.1"
		}, (res) => {

			res.on("error", () => {
				done();
			}).on("end", () => {
				done("Request passed");
			});

		}).on("error", () => {
			done();
		}).end();

	}).timeout(5000);

	it("should request first server", (done) => {

		http.request({
			"port": 1337,
			"hostname": "127.0.0.1"
		}, (res) => {

			res.setEncoding("utf8");

			assert.strictEqual(200, res.statusCode, "request statusCode is incorrect");
			assert.strictEqual(CONTENT_TYPE, res.headers["content-type"], "request content-type is incorrect");

			let str = "";
			res.on("data", (chunk) => {
				str += chunk;
			}).on("error", (err) => {
				done(err);
			}).on("end", () => {

				assert.strictEqual(MESSAGE, str, "request response is incorrect");
				done();

			});

		}).on("error", (err) => {
			done(err);
		}).end();

	}).timeout(5000);

	it("should request second server", (done) => {

		http.request({
			"port": 1338,
			"hostname": "127.0.0.1"
		}, (res) => {

			res.setEncoding("utf8");

			assert.strictEqual(200, res.statusCode, "request statusCode is incorrect");
			assert.strictEqual(CONTENT_TYPE, res.headers["content-type"], "request content-type is incorrect");

			let str = "";
			res.on("data", (chunk) => {
				str += chunk;
			}).on("error", (err) => {
				done(err);
			}).on("end", () => {

				assert.strictEqual(MESSAGE, str, "request response is incorrect");
				done();

			});

		}).on("error", (err) => {
			done(err);
		}).end();

	}).timeout(5000);

	it("should stop the server", () => {

		return servers.release();

	});

});

describe("setTimeout", () => {

	const servers = new MultiServers();

	afterEach(() => {
		return servers.release();
	});

	it("should test setTimeout without servers", () => {
		return servers.setTimeout(5000);
	});

	it("should test setTimeout with one server", () => {

		return servers.addServer({
			"port": 1337,
			"name": "basic http server",
			"ssl": false
		}).then(() => {
			return servers.setTimeout(5000);
		});

	});

	it("should test setTimeout with two servers", () => {

		return servers.addServer({
			"port": 1337,
			"name": "basic http server",
			"ssl": false
		}).then(() => {

			return servers.addServer({
				"port": 1338,
				"name": "basic http server 2",
				"ssl": false
			});

		}).then(() => {

			return servers.listen((req, res) => {

				res.writeHead(200, {
					"Content-Type": CONTENT_TYPE
				});

				res.end(MESSAGE);

			});

		}).then(() => {
			return servers.setTimeout(5000);
		});

	});

});

describe("create two http servers with express", () => {

	const servers = new MultiServers();

	const app = express().get("/", (req, res) => {

		res.set("Content-Type", CONTENT_TYPE).send(MESSAGE);

	}).get("/test", (req, res) => {

		res.set("Content-Type", CONTENT_TYPE).send("Hello World 2");

	});

	before(() => {
		return fs.mkdirpProm(CRTPATH);
	});

	after(() => {

		return servers.release().then(() => {
			return fs.rmdirpProm(CRTPATH);
		});

	});

	it("should create servers", () => {

		return servers.addServer({
			"port": 1337,
			"name": "basic http server",
			"ssl": false
		}).then(() => {

			return servers.addServer({
				"port": 1338,
				"name": "basic https server"
			});

		}).then(() => {

			return servers.listen(app);

		}).then(() => {

			assert.strictEqual(2, servers.servers.length, "server number is incorrect");
			assert.strictEqual(true, servers.listening(), "servers are not listening");

			assert.strictEqual(1337, servers.servers[0].options.port, "first server name is incorrect");
			assert.strictEqual("basic http server", servers.servers[0].options.name, "first server name is incorrect");
			assert.strictEqual(false, servers.servers[0].options.ssl, "first server ssl is incorrect");

			assert.strictEqual(1338, servers.servers[1].options.port, "second server name is incorrect");
			assert.strictEqual("basic https server", servers.servers[1].options.name, "second server name is incorrect");
			assert.strictEqual(false, servers.servers[1].options.ssl, "second server ssl is incorrect");

			return Promise.resolve();

		});

	}).timeout(5000);

	it("should request these servers with wrong port", (done) => {

		http.request({
			"port": 1339,
			"hostname": "127.0.0.1"
		}, (res) => {

			res.on("error", () => {
				done();
			}).on("end", () => {
				done("Request passed");
			});

		}).on("error", () => {
			done();
		}).end();

	}).timeout(5000);

	it("should request first server", (done) => {

		http.request({
			"port": 1337,
			"hostname": "127.0.0.1"
		}, (res) => {

			res.setEncoding("utf8");

			assert.strictEqual(200, res.statusCode, "request statusCode is incorrect");

			let str = "";
			res.on("data", (chunk) => {
				str += chunk;
			}).on("error", (err) => {
				done(err);
			}).on("end", () => {

				assert.strictEqual(MESSAGE, str, "request response is incorrect");
				done();

			});

		}).on("error", (err) => {
			done(err);
		}).end();

	}).timeout(5000);

	it("should request second server", (done) => {

		http.request({
			"port": 1338,
			"hostname": "127.0.0.1"
		}, (res) => {

			res.setEncoding("utf8");

			assert.strictEqual(200, res.statusCode, "request statusCode is incorrect");

			let str = "";
			res.on("data", (chunk) => {
				str += chunk;
			}).on("error", (err) => {
				done(err);
			}).on("end", () => {

				assert.strictEqual(MESSAGE, str, "request response is incorrect");
				done();

			});

		}).on("error", (err) => {
			done(err);
		}).end();

	}).timeout(5000);

	it("should request second server with path", (done) => {

		http.request({
			"port": 1338,
			"path": "/test",
			"hostname": "127.0.0.1"
		}, (res) => {

			res.setEncoding("utf8");

			assert.strictEqual(200, res.statusCode, "request statusCode is incorrect");

			let str = "";
			res.on("data", (chunk) => {
				str += chunk;
			}).on("error", (err) => {
				done(err);
			}).on("end", () => {

				assert.strictEqual("Hello World 2", str, "request response is incorrect");
				done();

			});

		}).on("error", (err) => {
			done(err);
		}).end();

	}).timeout(5000);

	it("should stop the server", () => {

		return servers.release();

	});

});

const PATH = (0, process).env.Path || (0, process).env.PATH || {};

if (-1 < PATH.indexOf("openssl")) {

	SimpleSSL.setOpenSSLConfPath(path.join(__dirname, "openssl.cnf"));

	describe("create http server and https server", () => {

		const servers = new MultiServers();

		before(() => {
			return fs.mkdirpProm(CRTPATH);
		});

		after(() => {

			return servers.release().then(() => {
				return fs.rmdirpProm(CRTPATH);
			});

		});

		it("should create servers", () => {

			return servers.addServer({
				"port": 1337,
				"name": "basic http server",
				"ssl": false
			}).then(() => {

				return SSL.createCertificate(SERVER_KEY, SERVER_CSR, SERVER_CRT);

			}).then((data) => {

				return servers.addServer({
					"port": 1338,
					"name": "basic https server",
					"ssl": true,
					"key": data.privateKey,
					"cert": data.certificate
				});

			}).then(() => {

				return servers.listen((req, res) => {

					res.writeHead(200, {
						"Content-Type": CONTENT_TYPE
					});

					res.end(MESSAGE);

				});

			}).then(() => {

				assert.strictEqual(2, servers.servers.length, "server number is incorrect");
				assert.strictEqual(true, servers.listening(), "servers are not listening");

				assert.strictEqual(1337, servers.servers[0].options.port, "first server name is incorrect");
				assert.strictEqual("basic http server", servers.servers[0].options.name, "first server name is incorrect");
				assert.strictEqual(false, servers.servers[0].options.ssl, "first server ssl is incorrect");

				assert.strictEqual(1338, servers.servers[1].options.port, "second server name is incorrect");
				assert.strictEqual("basic https server", servers.servers[1].options.name, "second server name is incorrect");
				assert.strictEqual(true, servers.servers[1].options.ssl, "second server ssl is incorrect");

				return Promise.resolve();

			});

		}).timeout(5000);

		it("should request these servers with wrong port", (done) => {

			http.request({
				"port": 1339,
				"hostname": "127.0.0.1"
			}, (res) => {

				res.on("error", () => {
					done();
				}).on("end", () => {
					done("Request passed");
				});

			}).on("error", () => {
				done();
			}).end();

		}).timeout(5000);

		it("should request first server", (done) => {

			http.request({
				"port": 1337,
				"hostname": "127.0.0.1"
			}, (res) => {

				res.setEncoding("utf8");

				assert.strictEqual(200, res.statusCode, "request statusCode is incorrect");
				assert.strictEqual(CONTENT_TYPE, res.headers["content-type"], "request content-type is incorrect");

				let str = "";
				res.on("data", (chunk) => {
					str += chunk;
				}).on("error", (err) => {
					done(err);
				}).on("end", () => {

					assert.strictEqual(MESSAGE, str, "request response is incorrect");
					done();

				});

			}).on("error", (err) => {
				done(err);
			}).end();

		}).timeout(5000);

		it("should request second server", (done) => {

			https.request({
				"port": 1338,
				"hostname": "127.0.0.1",
				"rejectUnauthorized": false,
				"requestCert": true,
				"agent": false
			}, (res) => {

				res.setEncoding("utf8");

				assert.strictEqual(200, res.statusCode, "request statusCode is incorrect");
				assert.strictEqual(CONTENT_TYPE, res.headers["content-type"], "request content-type is incorrect");

				let str = "";
				res.on("data", (chunk) => {
					str += chunk;
				}).on("error", (err) => {
					done(err);
				}).on("end", () => {

					assert.strictEqual(MESSAGE, str, "request response is incorrect");
					done();

				});

			}).on("error", (err) => {
				done(err);
			}).end();

		}).timeout(5000);

		it("should stop the server", () => {

			return servers.release();

		});

	});

}
