"use strict";

// deps

	const 	path = require("path"),
			assert = require("assert"),
			http = require("http"),
			https = require("https"),

			express = require("express"),
			fs = require("node-promfs"),

			simplessl = require("simplessl"),
			multiservers = require(path.join(__dirname, "..", "lib", "main.js"));

// private

	var servers = new multiservers(),
		SSL = new simplessl(),
		crtpath = path.join(__dirname, "crt"),
			serverkey = path.join(crtpath, "server.key"),
			servercsr = path.join(crtpath, "server.csr"),
			servercrt = path.join(crtpath, "server.crt"),

		message = "Hello World",
		contentType = "text/plain";

// tests

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

describe("test wrong using", () => {

	before(() => { return servers.release(); });
	after(() => { return servers.release(); });

	it("should fail on missing timeout", () => {

		return servers.setTimeout().then(() => {
			return Promise.reject("run with missing timeout");
		}).catch(() => {
			return Promise.resolve();
		});

	});

		it("should fail on wrong timeout", () => {

			return servers.setTimeout("test").then(() => {
				return Promise.reject("run with wrong timeout");
			}).catch(() => {
				return Promise.resolve();
			});

		});

	it("should fail on missing options", () => {

		return servers.addServer().then(() => {
			return Promise.reject("run with missing options");
		}).catch(() => {
			return Promise.resolve();
		});

	});

		it("should fail on wrong options", () => {

			return servers.addServer(false).then(() => {
				return Promise.reject("run with wrong options");
			}).catch(() => {
				return Promise.resolve();
			});

		});

		it("should fail on missing name option", () => {

			return servers.addServer({}).then(() => {
				return Promise.reject("run with missing name option");
			}).catch(() => {
				return Promise.resolve();
			});

		});

			it("should fail on wrong name option", () => {

				return servers.addServer({ name: 5 }).then(() => {
					return Promise.reject("run with wrong name option");
				}).catch(() => {
					return Promise.resolve();
				});

			});

		it("should fail on missing port option", () => {

			return servers.addServer({ name: "test" }).then(() => {
				return Promise.reject("run with missing port option");
			}).catch(() => {
				return Promise.resolve();
			});

		});

			it("should fail on wrong port option", () => {

				return servers.addServer({ name: "test", port: "cinq" }).then(() => {
					return Promise.reject("run with wrong port option");
				}).catch(() => {
					return Promise.resolve();
				});

			});

	it("should fail on missing requestListener", () => {

		return servers.listen().then(() => {
			return Promise.reject("run with missing requestListener");
		}).catch(() => {
			return Promise.resolve();
		});

	});

		it("should fail on wrong requestListener", () => {

			return servers.listen(false).then(() => {
				return Promise.reject("run with wrong requestListener");
			}).catch(() => {
				return Promise.resolve();
			});

		});

});

describe("create one http server", () => {

	before(() => { return servers.release(); });
	after(() => { return servers.release(); });

	it("should create http server", () => {

		return servers.addServer({
			port: 1337,
			name: "basic http server",
			ssl: false
		}).then(() => {

			return servers.listen((req, res) => {

				res.writeHead(200, {"Content-Type": contentType});
				res.end(message);

			});

		}).then(() => {

			assert.strictEqual(1, servers.servers.length, "server number is incorrect");

			assert.strictEqual(1337, servers.servers[0].options.port, "first server name is incorrect");
			assert.strictEqual("basic http server", servers.servers[0].options.name, "first server name is incorrect");
			assert.strictEqual(false, servers.servers[0].options.ssl, "first server ssl is incorrect");

			return Promise.resolve();

		});

	});

	it("should request this server with wrong port", (done) => {

		http.request({
			port: 1338,
			hostname: "127.0.0.1"
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
			port: 1337,
			hostname: "127.0.0.1"
		}, (res) => {

			res.setEncoding("utf8");

			assert.strictEqual(200, res.statusCode, "request statusCode is incorrect");
			assert.strictEqual(contentType, res.headers["content-type"], "request content-type is incorrect");

			let str = "";
			res.on("data", (chunk) => {
				str += chunk;
			}).on("error", (err) => {
				done(err);
			}).on("end", () => {

				assert.strictEqual(message, str, "request response is incorrect");
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

	before(() => { return servers.release(); });
	after(() => { return servers.release(); });

	it("should create servers", () => {

		return servers.addServer({
			port: 1337,
			name: "basic http server",
			ssl: false
		}).then(() => {

			return servers.addServer({
				port: 1338,
				name: "admin server",
				ssl: false
			});

		}).then(() => {

			return servers.listen((req, res) => {

				res.writeHead(200, {"Content-Type": contentType});
				res.end(message);

			});

		}).then(() => {

			assert.strictEqual(2, servers.servers.length, "server number is incorrect");

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
			port: 1339,
			hostname: "127.0.0.1"
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
			port: 1337,
			hostname: "127.0.0.1"
		}, (res) => {

			res.setEncoding("utf8");

			assert.strictEqual(200, res.statusCode, "request statusCode is incorrect");
			assert.strictEqual(contentType, res.headers["content-type"], "request content-type is incorrect");

			let str = "";
			res.on("data", (chunk) => {
				str += chunk;
			}).on("error", (err) => {
				done(err);
			}).on("end", () => {

				assert.strictEqual(message, str, "request response is incorrect");
				done();

			});

		}).on("error", (err) => {
			done(err);
		}).end();

	}).timeout(5000);

	it("should request second server", (done) => {

		http.request({
			port: 1338,
			hostname: "127.0.0.1"
		}, (res) => {

			res.setEncoding("utf8");

			assert.strictEqual(200, res.statusCode, "request statusCode is incorrect");
			assert.strictEqual(contentType, res.headers["content-type"], "request content-type is incorrect");

			let str = "";
			res.on("data", (chunk) => {
				str += chunk;
			}).on("error", (err) => {
				done(err);
			}).on("end", () => {

				assert.strictEqual(message, str, "request response is incorrect");
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

describe("create two http servers with one in ssl", () => {

	before(() => {
		return servers.release().then(() => { return fs.rmdirpProm(crtpath); });
	});

	after(() => {
		return servers.release().then(() => { return fs.rmdirpProm(crtpath); });
	});

	it("should create servers", () => {

		return servers.addServer({
			port: 1337,
			name: "basic http server",
			ssl: false
		}).then(() => {

			return SSL.createCertificate(serverkey, servercsr, servercrt);

		}).then((data) => {

			return servers.addServer({
				port: 1338,
				name: "basic https server",
				ssl: true,
				key: data.privateKey,
				cert: data.certificate
			});

		}).then(() => {

			return servers.listen((req, res) => {

				res.writeHead(200, {"Content-Type": contentType});
				res.end(message);

			});

		}).then(() => {

			assert.strictEqual(2, servers.servers.length, "server number is incorrect");

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
			port: 1339,
			hostname: "127.0.0.1"
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
			port: 1337,
			hostname: "127.0.0.1"
		}, (res) => {

			res.setEncoding("utf8");

			assert.strictEqual(200, res.statusCode, "request statusCode is incorrect");
			assert.strictEqual(contentType, res.headers["content-type"], "request content-type is incorrect");

			let str = "";
			res.on("data", (chunk) => {
				str += chunk;
			}).on("error", (err) => {
				done(err);
			}).on("end", () => {

				assert.strictEqual(message, str, "request response is incorrect");
				done();

			});

		}).on("error", (err) => {
			done(err);
		}).end();

	}).timeout(5000);

	it("should request second server", (done) => {

		https.request({
			port: 1338,
			hostname: "127.0.0.1",
			rejectUnauthorized: false,
			requestCert: true,
			agent: false
		}, (res) => {

			res.setEncoding("utf8");

			assert.strictEqual(200, res.statusCode, "request statusCode is incorrect");
			assert.strictEqual(contentType, res.headers["content-type"], "request content-type is incorrect");

			let str = "";
			res.on("data", (chunk) => {
				str += chunk;
			}).on("error", (err) => {
				done(err);
			}).on("end", () => {

				assert.strictEqual(message, str, "request response is incorrect");
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

describe("create two http servers with one in ssl with express", () => {

	let app = express().get("/", (req, res) => {

		res.set("Content-Type", contentType).send(message);

	}).get("/test", (req, res) => {

		res.set("Content-Type", contentType).send("Hello World 2");

	});

	before(() => {
		return servers.release().then(() => { return fs.rmdirpProm(crtpath); });
	});

	after(() => {
		return servers.release().then(() => { return fs.rmdirpProm(crtpath); });
	});

	it("should create servers", () => {

		return servers.addServer({
			port: 1337,
			name: "basic http server",
			ssl: false
		}).then(() => {

			return SSL.createCertificate(serverkey, servercsr, servercrt);

		}).then((data) => {

			return servers.addServer({
				port: 1338,
				name: "basic https server",
				ssl: true,
				key: data.privateKey,
				cert: data.certificate
			});

		}).then(() => {

			return servers.listen(app);

		}).then(() => {

			assert.strictEqual(2, servers.servers.length, "server number is incorrect");

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
			port: 1339,
			hostname: "127.0.0.1"
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
			port: 1337,
			hostname: "127.0.0.1"
		}, (res) => {

			res.setEncoding("utf8");

			assert.strictEqual(200, res.statusCode, "request statusCode is incorrect");

			let str = "";
			res.on("data", (chunk) => {
				str += chunk;
			}).on("error", (err) => {
				done(err);
			}).on("end", () => {

				assert.strictEqual(message, str, "request response is incorrect");
				done();

			});

		}).on("error", (err) => {
			done(err);
		}).end();

	}).timeout(5000);

	it("should request second server", (done) => {

		https.request({
			port: 1338,
			hostname: "127.0.0.1",
			rejectUnauthorized: false,
			requestCert: true,
			agent: false
		}, (res) => {

			res.setEncoding("utf8");

			assert.strictEqual(200, res.statusCode, "request statusCode is incorrect");

			let str = "";
			res.on("data", (chunk) => {
				str += chunk;
			}).on("error", (err) => {
				done(err);
			}).on("end", () => {

				assert.strictEqual(message, str, "request response is incorrect");
				done();

			});

		}).on("error", (err) => {
			done(err);
		}).end();

	}).timeout(5000);

	it("should request second server with path", (done) => {

		https.request({
			port: 1338,
			path: "/test",
			hostname: "127.0.0.1",
			rejectUnauthorized: false,
			requestCert: true,
			agent: false
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
