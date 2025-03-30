/*
    ~ * ~ * ~ * 
    SERVER
    CA Curriculum Visualization
    Prototype v0
    
    August Luhrs and Despina Papadopolous
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

// MARK: db and api
//database [nedb]
var Datastore = require('nedb')
  , db = new Datastore({filename: './data/table.db', autoload: true});

//airtable api
require('dotenv').config();
const Airtable = require('airtable');
// Airtable.configure({ apiKey: process.env.AIRTABLE_API_KEY, endpointUrl: 'https://api.airtable.com'});
// Airtable.base('appcobkaG3sQ76P9k');
var base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base('appcobkaG3sQ76P9k');

//stores the object that's created from the db/api and sent to clients on start
let tableCourses = {};

//for now, just checks api for updates once a day
const date = new Date();
let day = (date.getMonth() * 100) + date.getDate(); //shh 100 is workaround for variable days per month
// db.insert({log: "v0.3", data: {lastUpdated: 0}}, function(err, newDocs){
//   if (err){
//     console.log(err);
//     return;
//   }
//   db.update({log: "v0.3"}, { $set: {"data.lastUpdated" : day} }, {upsert: true}, function(err, numUpdated, wasUpserted){
//     console.log(numUpdated);
//     console.log(wasUpserted);
//     if (err) {
//       console.log(err);
//     }
//   });
// });
db.find({log: "v0.3"}, async function (err, docs){
  if (docs.length > 1){
    console.log('hmm');
    console.log(docs);
  } else if (docs.length = 1){
    if (docs[0].data.lastUpdated != day){
      console.log('new day, needs update');
      let courses = await updateTable();
      db.update({table: "v0.3"}, {$set: {courses: courses}}, {upsert: true}, function (err, numUpdated, hasUpserted){
        if (err){
          console.log('update error:' + err);
          return;
        }
        db.update({log: "v0.3"}, { $set: {"data.lastUpdated" : day} }, {upsert: true}, function(err, numUpdated, wasUpserted){
          console.log("docs updated: " + numUpdated);
          // console.log(wasUpserted);
          tableCourses = courses;
          console.log("tableCourses created from api");
          if (err) {
            console.log(err);
          }
        });
      });
    } else {
      console.log('already updated table today');
      db.find({table: "v0.3"}, async function (err, docs){
        tableCourses = docs[0].courses;
        console.log("tableCourses loaded from db");
      });
    }

  } else {
    console.log("idk");
  }
  if (err) {
    console.log(err);
  }
});


//https://airtable.com/appcobkaG3sQ76P9k/api/docs#javascript/
async function updateTable(){
  console.log("updating table");
  let courses = {};
  // await async function(){
  await new Promise((resolve) => {
    base('SOURCE').select({
      maxRecords: 100,
    }).eachPage(async function page(records, fetchNextPage) {
        // This function (`page`) will get called for each page of records.
        records.forEach(async function(record) {
            // console.log('Retrieved', record.get('Course'));
            courses[`${record.fields.Course}`] = record.fields;
            // console.log(record.fields.Image);
        });
        fetchNextPage(); //built in?
    }, function done(err) {
      if (err) { console.error(err); return; }
      resolve(true); //hmm?????
    });
  });
    
    // return Promise.resolve();
  console.log("courses collected from api");
  return Promise.resolve(courses);
}

//send client test json with fetch
app.get("/data", (req, res) => {
  res.json(tableCourses);
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
