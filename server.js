/*
    ~ * ~ * ~ * 
    SERVER
    ~ * ~ * ~ * 
*/


//create server
let port = process.env.PORT || 8000;
const express = require('express');
let app = express();
let httpServer = require('http').createServer(app);
const { instrument, RedisStore } = require("@socket.io/admin-ui");

//where we look for files
app.use(express.static('public'));

// MARK: Socket Server
const { Server } = require('socket.io');
const io = new Server(httpServer, {
  cors: {
    origin: true,
    credentials: true //for sticky cookie ;>
  },
  cookie: true, //https://socket.io/how-to/deal-with-cookies
  connectionStateRecovery : {
    // https://socket.io/docs/v4/connection-state-recovery
    maxDisconnectionDuration: 10 * 60 * 1000,
  }
});

// https://socket.io/docs/v4/admin-ui/
instrument(io, {
  auth: false,
  mode: "production",
  readonly: false,
  namespaceName: "/admin", //default
  // store: new RedisStore(redisClient), //stores session IDs for reconnect
});

httpServer.listen(port, function(){
  console.log('Server is listening at port: ', port);
});

/*
let port = process.env.PORT || 8000;
let express = require('express');
const e = require('express');
let app = express();
let server = require('http').createServer(app).listen(port, function(){
  console.log('Server is listening at port: ', port);
});

//where we look for files
app.use(express.static('public'));
*/

//
//  SOCKET STUFF
//

//wall-mounted monitors with no cursors
let fishtank = io.of('/fishtank');

fishtank.on('connection', (socket) => {
  console.log('fishtank connected: ' + socket.id);

  socket.on('disconnect', () => {
    console.log('fishtank disconnected: ' + socket.id + "\n");
  });

});

//phone controllers
let remote = io.of('/remote');

remote.on('connection', (socket) => {
  console.log('remote connected: ' + socket.id);

  socket.on('mouseMoved', (data) => {
    // console.log(data);
    fishtank.emit('mouseMoved', data);
  }); 

  socket.on('mouseClicked', ()=>{
    console.log('click');
    fishtank.emit('mouseClicked');
  });
   
  socket.on('disconnect', () => {
    console.log('remote disconnected: ' + socket.id + "\n");
  });

});


//
// FUNCTIONS
//
