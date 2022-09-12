const express = require('express');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
const dns = require('dns');

// Create express server
const app = express();

// Config
const PORT = 3000;
const HOST = 'localhost';
const API_SERVICE_URL = 'https://jsonplaceholder.typicode.com';
const HOSTNAME = "akdev.nl";
var BLACKLIST = ["8.8.8.8"]; // Set blacklist, could be with ip or with hostname
var WHITELIST = ["127.0.0.1"]; // Set whitelist, could be with ip or with hostname

// var getClientIp = function (req) {
//   var ipAddress = req.connection.remoteAddress;

//   if(!ipAddress){
//     return '';
//   }

//   // convert to valid ip address
//   if(ipAddress.substr(0, 7) == "::ffff:"){
//     ipAddress = ipAddress.substr(7);
//   }

//   return ipAddress;
// };

// FIXME: A simplified way to check for blacklisted/whitelisted items
// app.use(function(req, res){
//   var ipAddress = getClientIp(req);
//   var isBlacklisted = BLACKLIST.indexOf(ipAddress) !== -1;
//   var isWhitelisted = WHITELIST.indexOf(ipAddress) !== 1;

//   if (isBlacklisted) {
//     res.send(ipAddress + " IP has been blacklisted!");
//   } else if (isWhitelisted) {
//     res.send(ipAddress + " IP has been whitelisted!");
//   } else {
//     next();
//   }
// })

//Logging the http request
app.use(morgan('dev'));

// Autorization handling
// app.use('', function(req, res, next){
//   if (req.headers.authorization) {
//     next();
//   } else {
//     console.log("Authorization handling failed!");
//     res.sendStatus(403);
//   }
// })

// Proxy endpoints
app.use('/json_placeholder', createProxyMiddleware({
  target: API_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    [`/json_placeholder`]: ''
  }
}))

// Get IP address form hostname
dns.lookup(HOSTNAME, function (err, address) {
  if (err) {
    console.log(err);
    return;
  }
  console.log('IP Addresses: %j', address);
});


var c = [
  ["docusign=1b0a6754-49b1-4db5-8540-d2c12664b289"],
  ["onetrust-domain-verification=de01ed21f2fa4d8781cbc3ffb89cf4ef"],
  [
    "atlassian-domain-verification=5YjTmWmjI92ewqkx2oXmBaD60Td9zWon9r6eakvHX6B77zzkFQto8PQ9QsKnbf4I",
  ],
  ["google-site-verification=TV9-DBe4R80X4v0M4U_bd_J9cpOJM0nikft0jAgjmsQ"],
  ["globalsign-smime-dv=CDYX+XFHUw2wml6/Gb8+59BsH31KzUr6c1l2BPvqKX8="],
  ["MS=E4A68B9AB2BB9670BCE15412F62916164C0B20BB"],
  ["webexdomainverification.8YX6G=6e6922db-e3e6-4a36-904e-a805c28087fa"],
  ["docusign=05958488-4752-4ef2-95eb-aa7ba8a3bd0e"],
  ["facebook-domain-verification=22rm551cu4k0ab0bxsw536tlds4h95"],
  ["apple-domain-verification=30afIBcvSuDV2PLX"],
  ["google-site-verification=wD8N7i1JTNTkezJ49swvWW48f8_9xveREV4oB-0Hf5o"],
  ["v=spf1 include:_spf.google.com ~all"],
];

// Get All records from hostname
dns.resolveAny(HOSTNAME, function (err, records) {
  if (err) {
    console.log(err);
    return;
  }

  console.log("TXT-Records: %j", records);
});

// Start the proxy
app.listen(PORT, HOST, function(){
  console.log(`Starting Proxy at ${HOST}:${PORT}`);
})
