/*
    ~ * ~ * ~ * 
    SERVER
    ~ * ~ * ~ * 
*/

//create server
let port = process.env.PORT || 8000;
let express = require('express');
const e = require('express');
let app = express();
let server = require('http').createServer(app).listen(port, function(){
  console.log('Server is listening at port: ', port);
});

//where we look for files
app.use(express.static('public'));

//
// FUNCTIONS
//
