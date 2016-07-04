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

describe("create one http server", function() {

	before(function() { return servers.release(); });
	after(function() { return servers.release(); });

	it("should create http server", function() {

		return servers.addServer({
			port: 1337,
			name: "basic http server",
			ssl: false
		}).then(function() {

			return servers.listen(function(req, res) {

				res.writeHead(200, {"Content-Type": contentType});
				res.end(message);

			});

		}).then(function() {

			assert.strictEqual(1, servers.servers.length, "server number is incorrect");

			assert.strictEqual(1337, servers.servers[0].options.port, "first server name is incorrect");
			assert.strictEqual("basic http server", servers.servers[0].options.name, "first server name is incorrect");
			assert.strictEqual(false, servers.servers[0].options.ssl, "first server ssl is incorrect");

			return Promise.resolve();

		});

	});

	it("should request this server with wrong port", function(done) {

		http.request({
			port: 1338,
			hostname: "127.0.0.1"
		}, function(res) {

			res.on("error", function () {
				done();
			}).on("end", function () {
				done("Request passed");
			});

		}).on("error", function () {
			done();
		}).end();

	}).timeout(5000);

	it("should request this server with right data", function(done) {

		http.request({
			port: 1337,
			hostname: "127.0.0.1"
		}, function(res) {

			res.setEncoding("utf8");

			assert.strictEqual(200, res.statusCode, "request statusCode is incorrect");
			assert.strictEqual(contentType, res.headers["content-type"], "request content-type is incorrect");

			let str = "";
			res.on("data", function (chunk) {
				str += chunk;
			}).on("error", function (err) {
				done(err);
			}).on("end", function () {

				assert.strictEqual(message, str, "request response is incorrect");
				done();

			});

		}).on("error", function (err) {
			done(err);
		}).end();

	}).timeout(5000);

	it("should stop the server", function() {

		return servers.release();

	});

});

describe("create two http servers", function() {

	before(function() { return servers.release(); });
	after(function() { return servers.release(); });

	it("should create servers", function() {

		return servers.addServer({
			port: 1337,
			name: "basic http server",
			ssl: false
		}).then(function() {

			return servers.addServer({
				port: 1338,
				name: "admin server",
				ssl: false
			});

		}).then(function() {

			return servers.listen(function(req, res) {

				res.writeHead(200, {"Content-Type": contentType});
				res.end(message);

			});

		}).then(function() {

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

	it("should request these servers with wrong port", function(done) {

		http.request({
			port: 1339,
			hostname: "127.0.0.1"
		}, function(res) {

			res.on("error", function () {
				done();
			}).on("end", function () {
				done("Request passed");
			});

		}).on("error", function () {
			done();
		}).end();

	}).timeout(5000);

	it("should request first server", function(done) {

		http.request({
			port: 1337,
			hostname: "127.0.0.1"
		}, function(res) {

			res.setEncoding("utf8");

			assert.strictEqual(200, res.statusCode, "request statusCode is incorrect");
			assert.strictEqual(contentType, res.headers["content-type"], "request content-type is incorrect");

			let str = "";
			res.on("data", function (chunk) {
				str += chunk;
			}).on("error", function (err) {
				done(err);
			}).on("end", function () {

				assert.strictEqual(message, str, "request response is incorrect");
				done();

			});

		}).on("error", function (err) {
			done(err);
		}).end();

	}).timeout(5000);

	it("should request second server", function(done) {

		http.request({
			port: 1338,
			hostname: "127.0.0.1"
		}, function(res) {

			res.setEncoding("utf8");

			assert.strictEqual(200, res.statusCode, "request statusCode is incorrect");
			assert.strictEqual(contentType, res.headers["content-type"], "request content-type is incorrect");

			let str = "";
			res.on("data", function (chunk) {
				str += chunk;
			}).on("error", function (err) {
				done(err);
			}).on("end", function () {

				assert.strictEqual(message, str, "request response is incorrect");
				done();

			});

		}).on("error", function (err) {
			done(err);
		}).end();

	}).timeout(5000);

	it("should stop the server", function() {

		return servers.release();

	});

});

describe("create two http servers with one in ssl", function() {

	before(function() {
		return servers.release().then(function() { return fs.rmdirpProm(crtpath); });
	});

	after(function() {
		return servers.release().then(function() { return fs.rmdirpProm(crtpath); });
	});

	it("should create servers", function() {

		return servers.addServer({
			port: 1337,
			name: "basic http server",
			ssl: false
		}).then(function() {

			return SSL.createCertificate(serverkey, servercsr, servercrt);

		}).then(function(data) {

			return servers.addServer({
				port: 1338,
				name: "basic https server",
				ssl: true,
				key: data.privateKey,
				cert: data.certificate
			});

		}).then(function() {

			return servers.listen(function(req, res) {

				res.writeHead(200, {"Content-Type": contentType});
				res.end(message);

			});

		}).then(function() {

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

	it("should request these servers with wrong port", function(done) {

		http.request({
			port: 1339,
			hostname: "127.0.0.1"
		}, function(res) {

			res.on("error", function () {
				done();
			}).on("end", function () {
				done("Request passed");
			});

		}).on("error", function () {
			done();
		}).end();

	}).timeout(5000);

	it("should request first server", function(done) {

		http.request({
			port: 1337,
			hostname: "127.0.0.1"
		}, function(res) {

			res.setEncoding("utf8");

			assert.strictEqual(200, res.statusCode, "request statusCode is incorrect");
			assert.strictEqual(contentType, res.headers["content-type"], "request content-type is incorrect");

			let str = "";
			res.on("data", function (chunk) {
				str += chunk;
			}).on("error", function (err) {
				done(err);
			}).on("end", function () {

				assert.strictEqual(message, str, "request response is incorrect");
				done();

			});

		}).on("error", function (err) {
			done(err);
		}).end();

	}).timeout(5000);

	it("should request second server", function(done) {

		https.request({
			port: 1338,
			hostname: "127.0.0.1",
			rejectUnauthorized: false,
			requestCert: true,
			agent: false
		}, function(res) {

			res.setEncoding("utf8");

			assert.strictEqual(200, res.statusCode, "request statusCode is incorrect");
			assert.strictEqual(contentType, res.headers["content-type"], "request content-type is incorrect");

			let str = "";
			res.on("data", function (chunk) {
				str += chunk;
			}).on("error", function (err) {
				done(err);
			}).on("end", function () {

				assert.strictEqual(message, str, "request response is incorrect");
				done();

			});

		}).on("error", function (err) {
			done(err);
		}).end();

	}).timeout(5000);

	it("should stop the server", function() {

		return servers.release();

	});

});

describe("create two http servers with one in ssl with express", function() {

	let app = express().get("/", function (req, res) {

		res.set("Content-Type", contentType).send(message);

	}).get("/test", function (req, res) {

		res.set("Content-Type", contentType).send("Hello World 2");

	});

	before(function() {
		return servers.release().then(function() { return fs.rmdirpProm(crtpath); });
	});

	after(function() {
		return servers.release().then(function() { return fs.rmdirpProm(crtpath); });
	});

	it("should create servers", function() {

		return servers.addServer({
			port: 1337,
			name: "basic http server",
			ssl: false
		}).then(function() {

			return SSL.createCertificate(serverkey, servercsr, servercrt);

		}).then(function(data) {

			return servers.addServer({
				port: 1338,
				name: "basic https server",
				ssl: true,
				key: data.privateKey,
				cert: data.certificate
			});

		}).then(function() {

			return servers.listen(app);

		}).then(function() {

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

	it("should request these servers with wrong port", function(done) {

		http.request({
			port: 1339,
			hostname: "127.0.0.1"
		}, function(res) {

			res.on("error", function () {
				done();
			}).on("end", function () {
				done("Request passed");
			});

		}).on("error", function () {
			done();
		}).end();

	}).timeout(5000);

	it("should request first server", function(done) {

		http.request({
			port: 1337,
			hostname: "127.0.0.1"
		}, function(res) {

			res.setEncoding("utf8");

			assert.strictEqual(200, res.statusCode, "request statusCode is incorrect");

			let str = "";
			res.on("data", function (chunk) {
				str += chunk;
			}).on("error", function (err) {
				done(err);
			}).on("end", function () {

				assert.strictEqual(message, str, "request response is incorrect");
				done();

			});

		}).on("error", function (err) {
			done(err);
		}).end();

	}).timeout(5000);

	it("should request second server", function(done) {

		https.request({
			port: 1338,
			hostname: "127.0.0.1",
			rejectUnauthorized: false,
			requestCert: true,
			agent: false
		}, function(res) {

			res.setEncoding("utf8");

			assert.strictEqual(200, res.statusCode, "request statusCode is incorrect");

			let str = "";
			res.on("data", function (chunk) {
				str += chunk;
			}).on("error", function (err) {
				done(err);
			}).on("end", function () {

				assert.strictEqual(message, str, "request response is incorrect");
				done();

			});

		}).on("error", function (err) {
			done(err);
		}).end();

	}).timeout(5000);

	it("should request second server with path", function(done) {

		https.request({
			port: 1338,
			path: "/test",
			hostname: "127.0.0.1",
			rejectUnauthorized: false,
			requestCert: true,
			agent: false
		}, function(res) {

			res.setEncoding("utf8");

			assert.strictEqual(200, res.statusCode, "request statusCode is incorrect");

			let str = "";
			res.on("data", function (chunk) {
				str += chunk;
			}).on("error", function (err) {
				done(err);
			}).on("end", function () {

				assert.strictEqual("Hello World 2", str, "request response is incorrect");
				done();

			});

		}).on("error", function (err) {
			done(err);
		}).end();

	}).timeout(5000);

	it("should stop the server", function() {

		return servers.release();

	});

});
