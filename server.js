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

// node cache -- storing json from api in memory
const NodeCache = require('node-cache');
const ClassCache = new NodeCache();
require('dotenv').config();

//airtable api
const Airtable = require('airtable');
// Airtable.configure({ apiKey: process.env.AIRTABLE_API_KEY, endpointUrl: 'https://api.airtable.com'});
// Airtable.base('appcobkaG3sQ76P9k');
var base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base('appcobkaG3sQ76P9k');
//testing api --> cache
// const https = require('node:https');

// ClassCache.set("testJSON", )
// loadTable();
let testCache = {};

//https://airtable.com/appcobkaG3sQ76P9k/api/docs#javascript/
base('apitest').select({
    maxRecords: 100,
  }).eachPage(function page(records, fetchNextPage) {
      // This function (`page`) will get called for each page of records.
      // ClassCache.set('testRecords', records);
      records.forEach(function(record) {
          // console.log('Retrieved', record.get('Course'));
          testCache[`${record.fields.Course}`] = record.fields;
          // console.log(record.fields.Image);
      });
      // console.log(ClassCache.get('testRecords'))
      fetchNextPage(); //built in?
  }, function done(err) {
      if (err) { console.error(err); return; }
});

//send client test json with fetch
app.get("/data", (req, res) => {
  res.json(testCache);
});
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
  
  socket.on('reset', ()=>{
    console.log('resetting');
    fishtank.emit('reset');
  });
   
  socket.on('disconnect', () => {
    console.log('remote disconnected: ' + socket.id + "\n");
  });

});


//
// FUNCTIONS
//
