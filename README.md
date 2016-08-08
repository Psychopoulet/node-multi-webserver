# node-multi-webserver
A multi http server manager

# Installation

```bash
$ npm install node-multi-webserver
```

# Features

  run the same server with different configurations (ports, ssl, etc...)
  
  note : to use sockets on the same way, you should see the [node-multi-socketservers](https://www.npmjs.com/package/node-multi-socketservers) module

# Doc

* ``` object servers ``` servers managed (servers[x].options & servers[x].server)

* ``` constructor() ```

* ``` addServer(object options) : return Promise instance  ``` add server options (mandatory : "port" & "name" for http & https, + "key" & "cert" for https) (ssl : default = false)
* ``` setTimeout(number timeout) : return Promise instance ``` set timeout to all servers
* ``` listen(function requestListener) : return Promise instance ``` run your logic on all servers
* ``` close() : return Promise instance ``` close all servers & kill sockets (with "http-shutdown" module)
* ``` release() : return Promise instance ``` call "close" and forget servers options

# Examples

### with express

```js
const http = require("http"),
      https = require("https"),
      express = require("express"),
      multiservers = require("node-multi-webserver");

let servers = new multiservers(),
    app = express().get("/", (req, res) => {

  res.set("Content-Type", contentType).send(message);

});

return servers.addServer({
  port: 80,
  name: "http server"
}).then(() => {

  return servers.addServer({
    port: 443,
    name: "secure server",
    ssl: true,
    key: "YOUR_PRIVATE_KEY",
    cert: "YOUR_CERTIFICATE"
  });

}).then(() => {

  return servers.addServer({
    port: 1337,
    name: "admin server",
    key: "YOUR_PRIVATE_KEY",
    cert: "YOUR_CERTIFICATE"
  });

}).then(() => {

  return servers.setTimeout(2 * 1000);

}).then(() => {

  return servers.listen(app);

}).catch((err) => {

  console.log(err);

  servers.release().catch((err) => {
    console.log(err);
  });

});
```
### native

```js
const http = require("http"),
      https = require("https"),
      multiservers = require("node-multi-webserver");

let servers = new multiservers();

return servers.addServer({
  port: 80,
  name: "http server"
}).then(() => {

  return servers.addServer({
    port: 443,
    name: "secure server",
    ssl: true,
    key: "YOUR_PRIVATE_KEY",
    cert: "YOUR_CERTIFICATE"
  });

}).then(() => {

  return servers.addServer({
    port: 1337,
    name: "admin server",
    key: "YOUR_PRIVATE_KEY",
    cert: "YOUR_CERTIFICATE"
  });

}).then(() => {

  return servers.setTimeout(2 * 1000);

}).then(() => {

  return servers.listen((req, res) => {

    res.writeHead(200, {"Content-Type": contentType});
    res.end("hello world, from http:80, https:443 or https:1337");

  });

}).catch((err) => {

  console.log(err);

  servers.release().catch((err) => {
    console.log(err);
  });

});
```


# Tests

```bash
$ gulp
```

## License

  [ISC](LICENSE)
