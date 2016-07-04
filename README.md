# node-multi-webserver
A multi http server manager

# Installation

```bash
$ npm install node-multi-webserver
```

# Features

  run the same server with different configurations (ports, ssl, etc...)

# Doc

* ``` object servers ``` servers managed (servers[x].options & servers[x].server)

* ``` constructor() ```

* ``` addServer(object options) : return Promise instance  ``` add server options (mandatory : "port" & "name" for http & https, + "privatekey" & "certificate" for https) (ssl : default = false)
* ``` listen(function requestListener) : return Promise instance ```
* ``` close() : return Promise instance ``` close all servers
* ``` release() : return Promise instance ``` call "close" and forget servers options

# Examples

```js
const http = require("http"), https = require("https"), multiservers = require("node-multi-webserver");

let servers = new multiservers();

    return servers.addServer({
      port: 80,
      name: "http server"
    }).then(function() {

      return servers.addServer({
        port: 443,
        name: "secure server",
        ssl: true,
        privatekey: "YOUR_PRIVATE_KEY",
        certificate: "YOUR_CERTIFICATE"
      });

    }).then(function() {

      return servers.addServer({
        port: 1337,
        name: "admin server",
        privatekey: "YOUR_PRIVATE_KEY",
        certificate: "YOUR_CERTIFICATE"
      });

    }).then(function() {

      return servers.listen(function(req, res) {

        res.writeHead(200, {"Content-Type": contentType});
        res.end("hello world, from http:80, https:443 or https:1337");

      });

    }).then(function() {

      return new Promise(function(resolve, reject) {

        http.request({
          port: 80,
          hostname: "127.0.0.1"
        }, function(res) {

          res.setEncoding("utf8");

          let str = "";
          res.on("data", function (chunk) {
            str += chunk;
          }).on("error", function (err) {
            reject(err);
          }).on("end", function () {

            resolve(str);

          });

        }).on("error", function (err) {
          reject(err);
        }).end();

      });

    }).then(function(messageStart) {
      console.log(messageStart);
    });
```

# Tests

```bash
$ gulp
```

## License

  [ISC](LICENSE)
