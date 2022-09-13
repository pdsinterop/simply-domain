let dns = require("native-dns");
let server = dns.createServer();

server.on("listening", function(){
    console.log("server listening on", server.address())
  }
);
server.on("close", function(){
  console.log("server closed", server.address());
});
server.on("error", function(err, buff, req, res){
  console.error(err.stack);
});
server.on("socketError", function(err, socket){
  console.error(err);
});

server.serve(53);
