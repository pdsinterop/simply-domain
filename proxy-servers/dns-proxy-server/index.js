let dns = require("native-dns");
let server = dns.createServer();
let async = require("async");

let authority = { address: "8.8.8.8", port: 53, type: "udp" };

function requestHandler(request, response) {
  console.log(
    "request from",
    request.address.address,
    "for",
    request.question[0].name
  );

  let f = []; // array of functions

  // proxy all questions
  // since proxying is asynchronous, store all callbacks
  request.question.forEach((question) => {
    f.push((cb) => proxy(question, response, cb));
  });

  // do the proxying in parallel
  // when done, respond to the request by sending the response
  async.parallel(f, function () {
    response.send();
  });
}

function proxy(question, response, callback) {
  console.log("proxying", question.name);

  var request = dns.Request({
    question: question, // forwarding the question
    server: authority, // this is the DNS server we are asking
    timeout: 1000,
  });

  // when we get answers, append them to the response
  request.on("message", function (err, msg) {
    if (err) {
      console.log(err);
      return;
    }

    msg.answer.forEach(function (ans) {
      response.answer.push(ans);
    });
  });

  request.on("end", callback);
  request.send();
}

server.on("listening", function(){
    console.log("server listening on", server.address())
  }
);
server.on("request", requestHandler);
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
