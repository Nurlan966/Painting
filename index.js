var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;
    
app.get('/', function(req, res){
  res.sendFile(__dirname + '/days/day22.html');
});
app.get('/day22-controler', function(req, res){
  res.sendFile(__dirname + '/days/day22-controler.html');
});
app.get('/day23', function(req, res){
  res.sendFile(__dirname + '/days/day23.html');
}); 
app.get('/day23-controler', function(req, res){
  res.sendFile(__dirname + '/days/day23-controler.html');
});
app.get('/day24', function(req, res){
  res.sendFile(__dirname + '/days/day24.html');
});
app.get('/day25', function(req, res){
  res.sendFile(__dirname + '/days/day25.html');
});
app.get('/day26', function(req, res){
  res.sendFile(__dirname + '/days/day26.html');
});
app.get('/day28', function(req, res){
  res.sendFile(__dirname + '/days/day28.html');
});
app.get('/day30', function(req, res){
  res.sendFile(__dirname + '/days/day30.html');
});
app.get('/main.css', function(req, res){
  res.sendFile(__dirname + '/public/stylesheets/main.css');
});

var users = {};
var users26 = {};
var board30 = {};
io.on('connection', function(client) {
  client.emit('users base', users, users26);
  client.on('board create', function(boardname){
    if (boardname in board30){
      client.emit('board errore', boardname, " уже занята");
    }
    else{
      client.join(boardname);
      board30[boardname] = {};
      client.emit('user connected30', client.id, boardname);
    }
  });
  client.on('board join', function(boardname){
    if (boardname in board30){
        client.join(boardname);
        client.emit('user connected30', client.id, boardname);
        client.emit('users base30', board30, boardname);
      }
    else{
        client.emit('board errore', boardname, " не создана") 
    }   
  });
  client.on('user done30', function (x, y, color, size, boardname){
    board30[boardname][client.id] = { 
      x: x,  
      y: y, 
      color: color, 
      size: size 
    };
    client.broadcast.to(boardname).emit('user done30', x, y, client.id ,color, size, board30);
  });
   
  client.on('move done30', function(obj, ID, boardname, color, size){
    client.broadcast.to(boardname).emit('sprite change coord30', obj, color, size, ID);
    board30[boardname][ID].x = obj.x;
    board30[boardname][ID].y = obj.y;
  });         
            
  client.emit('user connected', client.id);
  client.on('user done26', function(color, size, x, y){
    users26[client.id] = {
      color: color,
      size: size,
      x: x,
      y: y
    }
   client.broadcast.emit('user done26', x, y, color, size, client.id)
  });
  client.on('user done', function(coordx, coordy, ID, color, size){
    users[client.id] = {
      x: coordx,
      y: coordy,
      Id: ID,
      color: color,
      size: size
    }
    io.sockets.emit('user done', coordx, coordy, ID, color, size)
    client.broadcast.emit('user done24', coordx, coordy, ID, color, size)
  });
  client.on('move done', function(obj, ID){
    client.broadcast.emit('sprite change coord25', obj, users[ID].color, users[ID].size);
    client.broadcast.emit('sprite change coord',  ID,  obj);
    client.emit('move done', ID, obj);
    users[client.id].x =  obj.x;
    users[client.id].y =  obj.y;
    //if( users26.length != 0) {users26[client.id].x =  obj.x;
    //users26[client.id].y =  obj.y;}
  });
  client.on('disconnect', function(){
    for(boardname in board30){
      for(user in board30[boardname]){
        if (client.id == user){
          client.broadcast.to(boardname).emit('user disconnected30', client.id);
          delete board30[boardname][client.id];
        }
      }
    }
    client.broadcast.emit('user disconnected', client.id);
    delete users26[client.id];
    delete users[client.id];
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
