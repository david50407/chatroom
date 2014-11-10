var socket = io();
var auth = false;
var mynick;
var online = [];

$(function() {
  $('#chatform').submit(function(){
    $('#inputbar').val().replace(/ /g, '');
    var content = func($('#inputbar').val());
    $('#inputbar').val('');
    if (content == "") return false;
    addmsg(mynick, content);
    var msg = {
      nick: mynick,
      msg: content
    };
    socket.emit('all', JSON.stringify(msg));
    return false;
  });

  $('#loginform').submit(function(){
    mynick = $('#nickinput').val();
    socket.emit('login', mynick);
    $('#nickinput').val('Pleas wait...')
      .css({color: '#aaa'});
    $('#nickinput').prop('disabled', true);
    return false;
  });
});

function func(cmd) {
  switch(cmd) {
    case '/clear':
      $('#chatlog').html('');
      return "";
    case '/who':
      console.log('get online');
      return "";
  }
  return cmd;
}

function newline(line) {
  $('#chatlog').append(line);
  var objDiv = document.getElementById("chatlog");
  objDiv.scrollTop = objDiv.scrollHeight;
}

function addmsg(user, msg) {
  msg = msg.replace(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?([^<]+)/g, '<center><iframe width="640" height="360" src="http://www.youtube.com/embed/$1?modestbranding=1&rel=0&wmode=transparent&theme=light&color=white" frameborder="0" allowfullscreen></iframe></center>').replace(/(?:http:\/\/)?(?:www\.)?(?:vimeo\.com)\/([^<]+)/g, '<center><iframe src="//player.vimeo.com/video/$1" width="640" height="360" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></center>').replace(/(?:http:\/\/)?(?:dailymotion\.com|dai\.ly)\/([^<]+)/g, '<center><iframe frameborder="0" width="560" height="315" src="http://www.dailymotion.com/embed/video/$1?logo=0&foreground=ffffff&highlight=1bb4c6&background=000000" allowfullscreen></iframe></center>');
  msg = msg.replace(/(^https?.+\.(jpg|png|gif|bmp|webp|svg))/, "<img src='\$1'>");
  var newmsg = $('<div class="line">'
      + '<span class="nick">' + user + '</span>'
      + ': '
      + '<span class="msg">' + msg + '</span>'
      +'</div>');
  newline(newmsg);
}

function newGuy(nick) {
  var element = $('<div class="userline">'
       + '<div class="head" style="background-image: url(img/jxcode_avatar.png)"></div>'
       + '<div class="user">'
       + nick 
       + '</div>'
       + '</div>');
  online[nick] = element;
  $('#online').append(element);
}

function delGuy(nick) {
  online[nick].remove();
  delete online[nick];
}

socket.on('loginok', function(msg) {
  var pack = JSON.parse(msg);
  auth = true;
  $('#lightbox').remove();
  $('#me').html(mynick + ':');
  for(var u in pack.nicks) {
    newGuy(pack.nicks[u]);
  }
  for(var m in pack.chatlog) {
    var l = JSON.parse(pack.chatlog[m]);
    addmsg(l.nick, l.msg);
  }
  $('#inputbar').focus();
});

socket.on('loginfail', function(msg) {
  $('#nickinput')
  .val('')
  .css({color: '#000'})
  .attr('placeholder', msg)
  .prop('disabled', false);
});

socket.on('hi', function(msg) {
  if (auth) {
    var line = $('<div class="line"># Server: ' + msg + ' joined.</div>');
    newline(line);
    newGuy(msg);
  }
});

socket.on('bye', function(msg) {
  if (auth) {
    var line = $('<div class="line"># Server: ' + msg + ' has left.</div>');
    newline(line);
    delGuy(msg);
  }
});

socket.on('say', function(msg){
  if (auth) {
    var m = JSON.parse(msg);
    addmsg(m.nick, m.msg);
  }
});
