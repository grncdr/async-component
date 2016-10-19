var hs = require("http-server");
var chokidar = require('chokidar-socket-emitter');
var server = hs.createServer({ "root": process.cwd(), cache: -1 });
chokidar({ app: server.server, relativeTo: process.cwd(), dir: process.cwd(), path: process.cwd() });
server.listen(8080);
