/* module define section */
var http = require("https");
const express = require("express");
const socket = require("socket.io");
const app = express();
const spawn = require('child_process').spawn;
/* end of module section */

// global variable
var result;
var userInfo = [];

/* server open section */
let server = app.listen(4000, function () {
	console.log("Server is running");
	fileRead(); // alternative of initialize
});
function fileRead() {
	// file module used
	const readline = require('readline');
	const fs = require('fs');
	const { listenerCount } = require("process");
	const userFileName = "./userInfo.txt";

	// read user info from txt file
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
function checkUser() { // debug function
	for (const user of userInfo) {
		console.log("Username: " + user.name + ", Password: " + user.password + ", Room: " + user.room);
	}
}
/* end of server open section */

/* server flow section */
app.use(express.static("public"));
let io = socket(server);

io.on("connection", function (socket) { // the set of WebRTC methods
	console.log("User Connected :" + socket.id); // debug message

	socket.on("connectStart", function (name, pass) { // login
		for (const user of userInfo) {
			if (user.name == name && user.password == pass) {
				socket.emit("connectAgreed", user.room);
				return;
			}
		}
		socket.emit("connectReject");
	});
	socket.on("join", function (roomName) { // access granted
		let rooms = io.sockets.adapter.rooms;
		let room = rooms.get(roomName);

		if (room == undefined) { // when nobody was in the room
			socket.join(roomName);
			socket.emit("created");
		} else if (room.size == 1) { // when someone was in the room
			socket.join(roomName);
			socket.emit("joined");
		} else { // when there is no seat
			socket.emit("full");
		}
		console.log(rooms); // debug
	});

	/* broadcast a user's message to all users */
	socket.on("ready", function (roomName) { // when a user is ready to stream
		socket.broadcast.to(roomName).emit("ready");
	});
	socket.on("candidate", function (candidate, roomName) { // find candidates
		console.log(candidate);
		socket.broadcast.to(roomName).emit("candidate", candidate);
	});
	socket.on("offer", function (offer, roomName) { // offer WebRTC request
		socket.broadcast.to(roomName).emit("offer", offer);
	});
	socket.on("answer", function (answer, roomName) { // answer for the request
		socket.broadcast.to(roomName).emit("answer", answer);
	});
	socket.on("leave", function (roomName) { // someone left from the room
		socket.leave(roomName);
		socket.broadcast.to(roomName).emit("leave");
		console.log(io.sockets.adapter.rooms);
	});
	socket.on("sendingMessage", function (roomName, data) { // chatting
		socket.broadcast.to(roomName).emit("broadcastMessage", data);
	});
	socket.on("startTimer", function (roomName, data) { // timer & detection start
		socket.broadcast.to(roomName).emit("startTimer", data);
		console.log("Python Module start");

		result = spawn('python', ['./opencv/model.py']); // execute python from javascript
		result.stdout.on('data', function (data) { console.log(data.toString()); });
		result.stderr.on('data', function (data) { console.log(data.toString()); });
	});
	socket.on("stopTimer", function (roomName, data) { // timer ends
		socket.broadcast.to(roomName).emit("stopTimer", data);
	});
	/* end of message broadcast section */
});
/* end of server flow section */