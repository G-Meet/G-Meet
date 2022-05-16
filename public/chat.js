/* server info */
let serverLink = "http://192.9.85.187:4000";
let socket = io.connect(serverLink);

/* HTML elements */
let divVideoChatLobby = document.getElementById("video-chat-lobby");
let divVideoChat = document.getElementById("video-chat-room");
let joinButton = document.getElementById("join");
let userVideo = document.getElementById("user-video");
let peerVideo = document.getElementById("peer-video");
let userName = document.getElementById("numberInput");
let examName = document.getElementById("numberInput");
let userPassword = document.getElementById("passwordInput");
var message = document.getElementById("chat-input");
let muteButton = document.getElementById("mute");
let hideCameraButton = document.getElementById("hideCamera");
let leaveRoomButton = document.getElementById("leaveRoom");
let buttonForMeeting = document.getElementById("button-for-meeting");
let mainRoom = document.getElementById("main-room");
let chatButton = document.getElementById("chat-button");
var chatlog = document.getElementById("chatlog");
let testPaper = document.getElementById("test-paper");
let nonCratorSet = document.getElementById("nonCreator-set");
let timerSet = document.getElementById("creator-set");
let displayTime1 = document.getElementById("time1"); // timer that the user see
let displayTime2 = document.getElementById("time2"); //timer that the eximanator see
let setTimerButton = document.getElementById("setTime");
let timeInput = document.getElementById("time-input");
let startTimeButton = document.getElementById("startTimer");
let stopTimerButton = document.getElementById("stopTimer");
let graphDiv = document.getElementById("graphPic"); // graph phase
let screenRoom = document.getElementById("screen-room");
/* end of HTML elements */

/* global variable initialization */
let hour, minute, second;
let roomName;
let creator = false;
let rtcPeerConnection;
let userStream;
let time;
let isTimerStop = false;
let screenSharingStream;
let muteFlag = false;
let hideCameraFlag = false;

// initialize status
mainRoom.style = "display:none";
var picNum = 0;
var picInterval = 0;
var x;

// Contains the stun server URL we will be using.
let iceServers = {
	iceServers: [
		{ urls: "stun:stun.services.mozilla.com" },
		{ urls: "stun:stun.l.google.com:19302" },
	],
};

/* timer section */
stopTimerButton.addEventListener("click", function () { // ends timer
	if (creator) {
		if (isTimerStop) { // if timer were stopped
			stopTimerButton.innerHTML = "stop";
			isTimerStop = false;
			socket.emit("stopTimer", roomName, {
				t: time,
			});
			x = setInterval(function () { // start new timer
				minute = parseInt(time / 60);
				second = time % 60;
				if (second <= 9) {
					displayTime2.innerHTML = "<p class=\"timer\">" + minute + ":" + "0" + second + "</p>";
				}
				else {
					displayTime2.innerHTML = "<p class=\"timer\">" + minute + ":" + second + "</p>";
				}

				/* graph paste */
				if (picInterval >= 1) {
					var graphPath = "http://192.9.85.187:4000/plotImage/room1-graph.png?time=" + new Date().getTime();
					picNum += 1;
					graphDiv.src = graphPath;
					picInterval = -1;
				}
				/* ----------- */

				time--;
				picInterval += 1;
				console.log(time);
				if (isTimerStop) {
					clearInterval(x);
				}
				if (time < 0) {
					clearInterval(x);
					displayTime2.innerHTML = "시험 종료";
				}
			}, 1000);
		}
		else { // stop the timer
			stopTimerButton.innerHTML = "restart";
			isTimerStop = true;
			socket.emit("stopTimer", roomName);

		}
	}
});
setTimerButton.addEventListener("click", function () { // sets timer
	if (creator) {
		time = parseInt(timeInput.value) * 60;
		minute = time / 60;
		second = time % 60;
		console.log(minute);
		displayTime2.innerHTML = "<p class=\"timer\">" + minute + ":" + "00" + "</p>";
	}
});
startTimeButton.addEventListener("click", function () { // starts timer
	if (creator && timeInput) { // if timeInput was set ( not 0 )
		socket.emit("startTimer", roomName, { // broadcast start execution
			t: time,
		});

		x = setInterval(function () { // starts new timer
			minute = parseInt(time / 60);
			second = time % 60;
			if (second <= 9) {
				displayTime2.innerHTML = "<p class=\"timer\">" + minute + ":" + "0" + second + "</p>";
			}
			else {
				displayTime2.innerHTML = "<p class=\"timer\">" + minute + ":" + second + "</p>";
			}

			/* graph paste */
			if (picInterval >= 1) {
				var graphPath = "http://192.9.85.187:4000/plotImage/room1-graph.png?time=" + new Date().getTime();
				picNum += 1;
				graphDiv.src = graphPath;
				picInterval = -1;
			}
			/* ----------- */

			time--;
			picInterval += 1;
			console.log(time);
			if (isTimerStop) {
				clearInterval(x);
			}
			if (time < 0) {
				clearInterval(x);
				displayTime2.innerHTML = "시험 종료";
			}
		}, 1000);
	}

});
socket.on("stopTimer", function (data) { // stop the timer for joinner's section
	if (isTimerStop) { // restart the timer
		isTimerStop = false;
		console.log("restart");
		var t = data.t;
		x = setInterval(function () {
			minute = parseInt(t / 60);
			second = t % 60;
			if (second <= 9) {
				displayTime1.innerHTML = "<p class=\"timer\">" + minute + ":" + "0" + second + "</p>";
			}
			else {
				displayTime1.innerHTML = "<p class=\"timer\">" + minute + ":" + second + "</p>";
			}

			/* graph paste */
			if (picInterval >= 1) {
				var graphPath = "http://192.9.85.187:4000/plotImage/room1-graph.png?time=" + new Date().getTime();
				picNum += 1;
				graphDiv.src = graphPath;
				picInterval = -1;
			}
			/* ----------- */

			t--;
			picInterval += 1;
			if (isTimerStop) {
				clearInterval(x);
			}
			if (t < 0) {
				clearInterval(x);
				displayTime1.innerHTML = "시험 종료";
			}
		}, 1000);
	}
	else { // stop the timer
		isTimerStop = true;
		console.log("stop");
	}
});
socket.on("startTimer", function (data) { // start the timer for joinner's section
	var t = data.t;

	x = setInterval(function () {
		minute = parseInt(t / 60);
		second = t % 60;
		if (second <= 9) {
			displayTime1.innerHTML = "<p class=\"timer\">" + minute + ":" + "0" + second + "</p>";
		}
		else {
			displayTime1.innerHTML = "<p class=\"timer\">" + minute + ":" + second + "</p>";
		}
		peerVideo.style = "display:none";
		testPaper.style = "display:block";
		/* graph paste */
		if (picInterval >= 1) {
			var graphPath = "http://192.9.85.187:4000/plotImage/room1-graph.png?time=" + new Date().getTime();
			picNum += 1;
			graphDiv.src = graphPath;
			picInterval = -1;
		}
		/* ----------- */

		t--;
		picInterval += 1;
		if (isTimerStop) {
			clearInterval(x);
		}
		if (t < 0) {
			// peerVideo.style="display:block";
			testPaper.style = "display:none";
			displayTime1.innerHTML = "시험 종료";
			clearInterval(x);
		}
	}, 1000);
});
/* end of timer section */

/* chatting section */
chatButton.addEventListener("click", function () { // broadcast chatting message to all users
	socket.emit("sendingMessage", roomName, {
		message: message.value,
		userName: userName.value,
	});
	chatlog.innerHTML += "<p><strong>" + userName.value + ": </strong>" + message.value + "</p>";
});
socket.on("broadcastMessage", function (data) { // get chatting message from server
	chatlog.innerHTML += "<p><strong>" + data.userName + ": </strong>" + data.message + "</p>";
});
/* end of chatting section */

/* utility button section */
muteButton.addEventListener("click", function () { // toggle mute
	muteFlag = !muteFlag;
	if (muteFlag) {
		userStream.getTracks()[0].enabled = false;
		// init(constraints);
		// startRecording();
		document.getElementById("mute1").src = "./img/icon/micOffButton.png";
	}
	else {
		userStream.getTracks()[0].enabled = true;
		// stopRecording();
		document.getElementById("mute1").src = "./img/icon/micOnButton.png";
	}
});
hideCameraButton.addEventListener("click", function () { // toggle camera
	hideCameraFlag = !hideCameraFlag;
	if (hideCameraFlag) {
		userStream.getTracks()[1].enabled = false;
		document.getElementById("hide1").src = "./img/icon/videoOffButton.png";
		// downloadVideo();

	}
	else {
		userStream.getTracks()[1].enabled = true;
		document.getElementById("hide1").src = "./img/icon/videoOnButton.png";
	}
});
leaveRoomButton.addEventListener("click", function () { // toggle room left button
	socket.emit("leave", roomName);
	divVideoChatLobby.style = "display:block";
	mainRoom.style = "display:none";
	if (userVideo.srcObject) {
		userVideo.srcObject.getTracks().forEach((track) => track.stop());
	}
	if (peerVideo.srcObject) {
		peerVideo.srcObject.getTracks().forEach((track) => track.stop());
	}
	if (rtcPeerConnection) {
		rtcPeerConnection.ontrack = null;
		rtcPeerConnection.onicecandidate = null;
		rtcPeerConnection.close();
		rtcPeerConnection = null;
	}
});
/* end of utility button section */

/* login & logout section */
socket.on("leave", function () { // someone left the room
	if (rtcPeerConnection) {
		rtcPeerConnection.ontrack = null;
		rtcPeerConnection.onicecandidate = null;
		rtcPeerConnection.close();
		rtcPeerConnection = null;
	}
	if (peerVideo.srcObject) {
		peerVideo.srcObject.getTracks().forEach((track) => track.stop());
	}
	if (rtcPeerConnection) {
		rtcPeerConnection.ontrack = null;
		rtcPeerConnection.onicecandidate = null;
		rtcPeerConnection.close();
		rtcPeerConnection = null;
	}
});
joinButton.addEventListener("click", function () { // login
	if (examName.value == "") {
		alert("정확한 수험번호를 입력하세요");
	} else if (userPassword.value == "") {
		alert("정확한 비밀번호를 입력하세요");
	} else {
		socket.emit("connectStart", examName.value, userPassword.value);
	}
});
socket.on("connectAgreed", function (roomN) { // permission accepted
	roomName = roomN;
	socket.emit("join", roomName);
});
socket.on("connectReject", function (roomN) { // permission denied
	alert("잘못된 입력입니다. 다시 입력해주세요.");
	examName.innerHTML = "";
	userPassword.innerHTML = "";
});
socket.on("created", function () { // when nobody was in the room
	creator = true; // I'm the creator of this room

	// media initialize
	navigator.mediaDevices
		.getUserMedia({
			audio: true,
			video: { width: 720, height: 720 },
		})
		.then(function (stream) {
			/* use the stream */
			userStream = stream;
			divVideoChatLobby.style = "display:none";
			mainRoom.style = "display:block";
			timerSet.style = "display:block";
			userVideo.srcObject = stream;
			userVideo.onloadedmetadata = function (e) {
				userVideo.play();
			};
		})
		.catch(function (err) {
			/* handle the error */
			alert("Couldn't Access User Media");
		});
});
socket.on("joined", function () { // when somebody was in the room
	creator = false; // I'm not the creator

	// media initialize
	navigator.mediaDevices
		.getUserMedia({
			audio: true,
			video: { width: 720, height: 720 },
		})
		.then(function (stream) {
			/* use the stream */
			userStream = stream;
			divVideoChatLobby.style = "display:none";
			mainRoom.style = "display:block";
			nonCratorSet.style = "display:block";
			userVideo.srcObject = stream;
			userVideo.onloadedmetadata = function (e) {
				userVideo.play();
			};
			socket.emit("ready", roomName);
		})
		.catch(function (err) {
			/* handle the error */
			alert("Couldn't Access User Media");
		});
});
socket.on("full", function () { // when there is no seat left
	alert("Room is Full, Can't Join");
});
/* end of login & logout section */

/* WebRTC trigger section */
socket.on("ready", function () {
	if (creator) {
		rtcPeerConnection = new RTCPeerConnection(iceServers);
		rtcPeerConnection.onicecandidate = OnIceCandidateFunction;
		rtcPeerConnection.ontrack = OnTrackFunction;
		rtcPeerConnection.addTrack(userStream.getTracks()[0], userStream);
		rtcPeerConnection.addTrack(userStream.getTracks()[1], userStream);
		console.log("display capture success")

		rtcPeerConnection
			.createOffer()
			.then((offer) => {
				rtcPeerConnection.setLocalDescription(offer);
				socket.emit("offer", offer, roomName);
			})

			.catch((error) => {
				console.log(error);
			});
	}
});
socket.on("candidate", function (candidate) {
	let icecandidate = new RTCIceCandidate(candidate);
	rtcPeerConnection.addIceCandidate(icecandidate);
});
socket.on("offer", function (offer) {
	if (!creator) {
		rtcPeerConnection = new RTCPeerConnection(iceServers);
		rtcPeerConnection.onicecandidate = OnIceCandidateFunction;
		rtcPeerConnection.ontrack = OnTrackFunction;
		rtcPeerConnection.addTrack(userStream.getTracks()[0], userStream);
		rtcPeerConnection.addTrack(userStream.getTracks()[1], userStream);
		console.log("display capture success")

		rtcPeerConnection.setRemoteDescription(offer);
		rtcPeerConnection
			.createAnswer()
			.then((answer) => {
				rtcPeerConnection.setLocalDescription(answer);
				socket.emit("answer", answer, roomName);
			})
			.catch((error) => {
				console.log(error);
			});
	}
});
socket.on("answer", function (answer) {
	rtcPeerConnection.setRemoteDescription(answer);
});
function OnIceCandidateFunction(event) {
	console.log("Candidate");
	if (event.candidate) {
		socket.emit("candidate", event.candidate, roomName);
	}
}
function OnTrackFunction(event) {
	peerVideo.srcObject = event.streams[0];
	peerVideo.onloadedmetadata = function (e) {
		peerVideo.play();
	};

}
/* end of WebRTC trigger section */