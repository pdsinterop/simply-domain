const net = require("net");
const https = require("node:https");
const server = net.createServer();
const config = {
  host: "0.0.0.0",
  port: 3000,
};
const dns = require("dns");

/// Establishes a connection to target URL via client to proxy
server.on("connection", function (clientToProxySocket) {
  console.log("Client connected to proxy");
  clientToProxySocket.once("data", function (data) {
    /// Check if the connection is HTTP or HTTPS
    let isTLSConnection = data.toString().indexOf("CONNECT") !== -1;

    let serverPort = 80;
    let serverAddress;

    if (isTLSConnection) {
      serverPort = 443;

      serverAddress = data
        .toString()
        .split("CONNECT")[1]
        .split(" ")[1]
        .split(":")[0];
    } else {
      serverAddress = data.toString().split("Host: ")[1].split("\n")[0];
    }

    let serverConfig = {
      host: serverAddress,
      port: serverPort,
    };

    console.log(serverConfig.host);

    /// Create a connection from proxy to destination server
    let proxyToServerSocket = net.createConnection(serverConfig, function () {
      console.log("Proxy connected to server");
    });

    /// Stream the data to the server
    if (isTLSConnection) {
      clientToProxySocket.write("HTTP/1.1 200 OK\r\n\n");
    } else {
      proxyToServerSocket.write(data);
    }

    /// Set the pipeline from [client -> proxy] to [proxy -> server]
    clientToProxySocket.pipe(proxyToServerSocket);
    /// Set the pipeline from [server -> proxy] to [proxy -> client]
    proxyToServerSocket.pipe(clientToProxySocket);

    // Get all TXT records from _dnslink.hostname
    dns.resolveTxt("_dnslink." + serverConfig.host, function (err, records) {
      if (err) {
        //console.log(err);
        return;
      }

      //console.log("TXT-Records: %s", JSON.stringify(records, 0, 2));

      if (!Array.isArray(records[0])) {
        return;
      } else if (records[0][0].includes("dnslink")) {
        let data = records[0][0].replace("dnslink=", "");
        console.log(data);
        https.get(data, function (res) {
          console.log("Statuscode: " + res.statusCode);
        });
      }
    });

    proxyToServerSocket.on("error", function (err) {
      //console.log("Proxy to server error");
      //console.log(err);
    });

    clientToProxySocket.on("error", function (err) {
      //console.log("Client to proxy error");
      //console.log(err);
    });
  });
});

/// error handling
server.on("error", function (err) {
  console.log("An internal error has occurred!");
  console.log(err);
});

server.on("close", function () {
  console.log("Client disconnected");
});

server.listen(config, function () {
  console.log("Server listening to " + config.host + ":" + config.port);
});
