var app = require('./app');
var http = require('http').Server(app);
var io = require('socket.io')(http);

var util = require('util');

var clients = [];
var nicks = [];
var chatlog = [];

io.on('connection', function(socket) {
  console.log('a user connected.');
  socket.on('login', function(username){
    console.log(username + ' is trying to login.');
    var found = false;
    for (var k in nicks) {
      if (nicks[k] === username) {
        console.log('repeated nickname: ' + username);
        socket.emit('loginfail', 'nickname has already taken');
        found = true;
        break;
      }
    }
    if (found === false) {
      var pack = {};
      pack.nicks = nicks;
      pack.chatlog = chatlog;
      socket.emit('loginok', JSON.stringify(pack));
      socket.nick = username;
      clients[username] = socket;
      nicks.push(username);
      socket.broadcast.emit('hi', username);
      console.log(username + ' has joined this room.');
    }
  });
  socket.on('disconnect', function(){
    delete clients[socket.nick];
    nicks.splice(nicks.indexOf(socket.nick), 1);
    io.emit('bye', socket.nick);
  });
  socket.on('all', function(msg) {
    chatlog.push(msg);
    if (chatlog.length >= 16) chatlog.shift();
    socket.broadcast.emit('say', msg);
  })
});

module.exports = http;
