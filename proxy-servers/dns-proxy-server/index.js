let server = dns.createServer();

server.on('listening', function(){
  console.log(`Server listening on ${server.address()}`);
})
server.on('error', function(err, buff, req, res){
  console.error(err.stack);
})

server.serve(53)