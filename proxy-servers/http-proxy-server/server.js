const net = require("net");
const server = net.createServer();
const config = {
  host: "0.0.0.0",
  port: 8080,
};

/// Establishes a connection to target URL via client to proxy
server.on("connection", function (clientToProxySocket) {
  console.log("Client connected to proxy");
  clientToProxySocket.once("data", function (data) {
    /// Check if the connection is HTTP or HTTPS
    let isTLSConnection = data.toString().indexOf("CONNECT") !== -1;

    let serverPort = 80
    let serverAddress;

    if(isTLSConnection) {
      serverPort = 443;

      serverAddress = data
        .toString()
        .split("CONNECT")[1]
        .split(" ")[1]
        .split(":")[0];
    } else {
      serverAddress = data
        .toString()
        .split("Host: ")[1]
        .split("\n")[0];
    }

    let serverConfig = {
      host: serverAddress,
      port: serverPort
    };

    /// Create a connection from proxy to destination server
    let proxyToServerSocket = net.createConnection(serverConfig, function(){
      console.log(data.toString());
    });

    if(isTLSConnection) {
      clientToProxySocket.write("HTTP/1.1 200 OK\r\n\n")
    } else {
      proxyToServerSocket.write(data);
    }

    /// Set the pipeline from client>proxy to proxy>server socket
    clientToProxySocket.pipe(proxyToServerSocket);
    /// Set the pipeline from server>proxy to proxy>client
    proxyToServerSocket.pipe(clientToProxySocket);

    proxyToServerSocket.on("error", function(err){
      console.log("Proxy to server error");
      console.log(err);
    });

    clientToProxySocket.on("error", function(err){
      console.log("Client to proxy error");
      console.log(err);
    })
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
