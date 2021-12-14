

var http = require("https");
const express = require("express");
const socket = require("socket.io");
const app = express();
const spawn = require('child_process').spawn;
var result;
var userInfo = [];
//Starts the server

let server = app.listen(4000, function () {
  console.log("Server is running");

  fileRead();
});

function fileRead() {
  // fs(파일시스템) 모듈 사용
  const readline = require('readline');
  const fs = require('fs');
  const { listenerCount } = require("process");
  const userFileName = "./userInfo.txt";

  var rl = readline.createInterface({
    input: fs.createReadStream(userFileName),
    output: process.stdout,
    terminal: false
  });
  rl.on('line', function (text) {
    if (text != "") {
      var obj = new Object();
      obj.name = text.split(" ")[0];
      obj.password = text.split(" ")[1];
      obj.room = text.split(" ")[2];

      userInfo.push(obj);
    }
  });
}

function checkUser() {
  for (const user of userInfo) {
    console.log("Username: " + user.name + ", Password: " + user.password + ", Room: " + user.room);
  }
}


app.use(express.static("public"));

//Upgrades the server to accept websockets.

let io = socket(server);

//Triggered when a client is connected.



// var os = require('os');
// var nodeStatic = require('node-static');

// const socketIO = require('socket.io');
// const https = require('https');
// const fs = require('fs');
// const options = { 
//   key: fs.readFileSync('./private.pem'), 
//   cert: fs.readFileSync('./public.pem') 
// }; 
//   var fileServer = new(nodeStatic.Server)(); 
//   let app = https.createServer(options, (req,res)=>{ 
//     fileServer.serve(req, res); 
//   }).listen(4000);

/* peer가 서버에 접속시, main.js(클라이언트측)의 window.room = prompt("Enter room name:")에 의해
사용자에게 room id를 얻고 var socket = id.connect()로 서버와 소켓 연결
socket.emit('create or join',room)을 통해 서버에게 알림 */



// console.log("starting server....");
// var io = socketIO.listen(app);





io.on("connection", function (socket) {
  //checkUser();
  console.log("User Connected :" + socket.id);

  //Triggered when a peer hits the join room button.

  socket.on("connectStart", function(name,pass) {
    for (const user of userInfo) {
      if (user.name == name && user.password == pass) {
        socket.emit("connectAgreed", user.room);
        return;
      }
    }
    socket.emit("connectReject");
  });

  socket.on("join", function (roomName) {
    let rooms = io.sockets.adapter.rooms;
    let room = rooms.get(roomName);

    //room == undefined when no such room exists.
    if (room == undefined) {
      socket.join(roomName);
      socket.emit("created");
    } else if (room.size == 1) {
      //room.size == 1 when one person is inside the room.
      socket.join(roomName);
      socket.emit("joined");
    } else {
      //when there are already two people inside the room.
      socket.emit("full");
    }
    console.log(rooms);
  });

  //Triggered when the person who joined the room is ready to communicate.
  socket.on("ready", function (roomName) {
    socket.broadcast.to(roomName).emit("ready"); //Informs the other peer in the room.
  });

  //Triggered when server gets an icecandidate from a peer in the room.

  socket.on("candidate", function (candidate, roomName) {
    console.log(candidate);
    socket.broadcast.to(roomName).emit("candidate", candidate); //Sends Candidate to the other peer in the room.
  });

  //Triggered when server gets an offer from a peer in the room.

  socket.on("offer", function (offer, roomName) {
    socket.broadcast.to(roomName).emit("offer", offer); //Sends Offer to the other peer in the room.
  });

  //Triggered when server gets an answer from a peer in the room.

  socket.on("answer", function (answer, roomName) {
    socket.broadcast.to(roomName).emit("answer", answer); //Sends Answer to the other peer in the room.
  });

socket.on("leave", function(roomName){
      socket.leave(roomName);
      socket.broadcast.to(roomName).emit("leave");
	console.log(io.sockets.adapter.rooms);
  });

  socket.on("sendingMessage", function (roomName, data) {
    socket.broadcast.to(roomName).emit("broadcastMessage", data);
  });
  socket.on("startTimer", function(roomName,data){
    socket.broadcast.to(roomName).emit("startTimer", data);
    console.log("Python Module start");

    result = spawn('python', ['./opencv/model.py']);

    result.stdout.on('data', function(data) { console.log(data.toString()); });
    result.stderr.on('data', function(data) { console.log(data.toString()); });
  });
  socket.on("stopTimer", function(roomName,data){
    socket.broadcast.to(roomName).emit("stopTimer",data);
  });
  //console.log("Websocket Connected", socket.id);
});



