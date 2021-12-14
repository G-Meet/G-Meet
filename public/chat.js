let socket = io.connect("http://192.9.85.187:4000"); // 192.9.85.34
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
let hour,minute,second;
//let screenVideo = document.getElementById("screen-video");
let screenRoom = document.getElementById("screen-room");
let roomName;
let creator = false;
let rtcPeerConnection;
let userStream;
let time;
let isTimerStop = false;
let screenSharingStream;
let muteFlag = false;
let hideCameraFlag = false;
let displayTime1 = document.getElementById("time1"); // nonCreator에서 보는 타이머
let displayTime2 = document.getElementById("time2"); //감독관이 보는 타이머
let setTimerButton = document.getElementById("setTime");
let timeInput = document.getElementById("time-input");
let startTimeButton = document.getElementById("startTimer");
let stopTimerButton = document.getElementById("stopTimer");
let graphDiv = document.getElementById("graphPic");

mainRoom.style = "display:none";
var picNum = 0;
var picInterval = 0;

var x ;
// Contains the stun server URL we will be using.
let iceServers = {
	iceServers: [
		{ urls: "stun:stun.services.mozilla.com" },
		{ urls: "stun:stun.l.google.com:19302" },
	],
};

stopTimerButton.addEventListener("click",function(){
	if(creator){
		if(isTimerStop){
			stopTimerButton.innerHTML="stop";
			isTimerStop = false;
			socket.emit("stopTimer",roomName,{
				t: time,
			});
			x = setInterval(function(){
				minute = parseInt(time/60);
				second = time%60;
				if(second <= 9){
					displayTime2.innerHTML = "<p class=\"timer\">" + minute + ":" + "0"+second  + "</p>"; 
				}
				else{
					displayTime2.innerHTML = "<p class=\"timer\">" + minute + ":" + second  + "</p>"; 
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
				if(isTimerStop){
					clearInterval(x);
				}
				if(time < 0){
					clearInterval(x);
					displayTime2.innerHTML = "시험 종료";
				}
			},1000);
		}
		else{
			stopTimerButton.innerHTML="restart";
			isTimerStop = true;
			socket.emit("stopTimer",roomName);
			
		}
	}
});
setTimerButton.addEventListener("click",function(){
	if(creator){
		 time =parseInt(timeInput.value)*60;
		 minute = time/60;
		 second = time%60;
		console.log(minute);
		displayTime2.innerHTML = "<p class=\"timer\">" + minute + ":" + "00"  + "</p>";    
	}
});
startTimeButton.addEventListener("click",function(){
	if(creator && timeInput){
		socket.emit("startTimer",roomName,{
			t: time,
		});
		
		 x = setInterval(function(){
			minute = parseInt(time/60);
			second = time%60;
			if(second <= 9){
				displayTime2.innerHTML = "<p class=\"timer\">" + minute + ":" + "0"+second  + "</p>"; 
			}
			else{
				displayTime2.innerHTML = "<p class=\"timer\">" + minute + ":" + second  + "</p>"; 
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
			if(isTimerStop){
				clearInterval(x);
			}
			if(time < 0){
				clearInterval(x);
				displayTime2.innerHTML = "시험 종료";
			}
		},1000);
	}
	
});
socket.on("stopTimer",function(data){
	if(isTimerStop){
		
		isTimerStop = false;
		console.log("restart");
		var t = data.t;
		x = setInterval(function(){
			minute = parseInt(t/60);
			second = t%60;
			if(second <= 9){
				displayTime1.innerHTML = "<p class=\"timer\">" + minute + ":" + "0"+second  + "</p>"; 
			}
			else{
				displayTime1.innerHTML = "<p class=\"timer\">" + minute + ":" + second  + "</p>"; 
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
			if(isTimerStop){
				clearInterval(x);
			}
			if(t< 0){
				clearInterval(x);
				displayTime1.innerHTML = "시험 종료";
			}
		},1000);
	}
	else{
		
		isTimerStop = true;
		console.log("stop");
		
	}
});
socket.on("startTimer",function(data){
	var t = data.t;
	
	// 동시 타이머 돌리기
	 x = setInterval(function() {
		minute = parseInt(t/60);
		second = t%60;
		if(second <= 9){
			displayTime1.innerHTML = "<p class=\"timer\">" + minute + ":" + "0"+second  + "</p>"; 
		}
		else{
			displayTime1.innerHTML = "<p class=\"timer\">" + minute + ":" + second  + "</p>"; 
		}
		peerVideo.style="display:none";
		testPaper.style="display:block";
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
		if(isTimerStop){
			clearInterval(x);
		}
		if(t< 0){
			// peerVideo.style="display:block";
			testPaper.style="display:none";
			displayTime1.innerHTML = "시험 종료";
			clearInterval(x);
		}
	},1000);
});





chatButton.addEventListener("click",function(){
	socket.emit("sendingMessage", roomName, {
		message: message.value,
		userName: userName.value,
	  });
	chatlog.innerHTML +=
    "<p><strong>" + userName.value + ": </strong>" + message.value + "</p>";
});

socket.on("broadcastMessage", function (data) {
	//alert(data.message);
	chatlog.innerHTML +=
    "<p><strong>" + data.userName + ": </strong>" + data.message + "</p>";
});


muteButton.addEventListener("click", function () {
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

hideCameraButton.addEventListener("click", function () {
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

leaveRoomButton.addEventListener("click", function () {
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

	/*
	// 위에 한 줄과 아래 두줄은 같은 의미
	 userVideo.srcObject.getTracks()[0].stop();
	userVideo.srcObject.getTracks()[1].stop();
	 */
});

socket.on("leave", function () {
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


joinButton.addEventListener("click", function () {
	if (examName.value == "") {
		alert("정확한 수험번호를 입력하세요");
	} else if (userPassword.value == "") {
		alert("정확한 비밀번호를 입력하세요");
	} else {
		socket.emit("connectStart", examName.value, userPassword.value);
	}
});

socket.on("connectAgreed", function (roomN) {
	roomName = roomN;
	socket.emit("join", roomName);
});
socket.on("connectReject", function (roomN) {
	alert("잘못된 입력입니다. 다시 입력해주세요.");
	examName.innerHTML = "";
	userPassword.innerHTML = "";
});

// Triggered when a room is succesfully created.

socket.on("created", function () {
	creator = true;

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
			timerSet.style="display:block";
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

// Triggered when a room is succesfully joined.

socket.on("joined", function () {
	creator = false;

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

// Triggered when a room is full (meaning has 2 people).

socket.on("full", function () {
	alert("Room is Full, Can't Join");
});

// Triggered when a peer has joined the room and ready to communicate.
// ready상태인 소켓을 전달 받음 -> RTCPeerConnection 객체 생성
socket.on("ready", function () {
	if (creator) {
		rtcPeerConnection = new RTCPeerConnection(iceServers);
		rtcPeerConnection.onicecandidate = OnIceCandidateFunction;
		rtcPeerConnection.ontrack = OnTrackFunction;
		rtcPeerConnection.addTrack(userStream.getTracks()[0], userStream);
		rtcPeerConnection.addTrack(userStream.getTracks()[1], userStream);
		/* 일단 시작부터 displaySTream도 추가해보려고  */
		//  rtcPeerConnection.addTrack(screenSharingStream.getTracks()[0],screenSharingStream);
		console.log("display capture success")
		/* 여기까지 추가한겨 */
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

// Triggered on receiving an ice candidate from the peer.

socket.on("candidate", function (candidate) {
	let icecandidate = new RTCIceCandidate(candidate);
	rtcPeerConnection.addIceCandidate(icecandidate);
});

// Triggered on receiving an offer from the person who created the room.

socket.on("offer", function (offer) {
	if (!creator) {
		rtcPeerConnection = new RTCPeerConnection(iceServers);
		rtcPeerConnection.onicecandidate = OnIceCandidateFunction;
		rtcPeerConnection.ontrack = OnTrackFunction;
		rtcPeerConnection.addTrack(userStream.getTracks()[0], userStream);
		rtcPeerConnection.addTrack(userStream.getTracks()[1], userStream);
		/* 일단 시작부터 displaySTream도 추가해보려고  */
		//rtcPeerConnection.addTrack(screenSharingStream.getTracks()[0],screenSharingStream);
		console.log("display capture success")
		/* 여기까지 추가한겨 */
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

// Triggered on receiving an answer from the person who joined the room.

socket.on("answer", function (answer) {
	rtcPeerConnection.setRemoteDescription(answer);
});

// Implementing the OnIceCandidateFunction which is part of the RTCPeerConnection Interface.

function OnIceCandidateFunction(event) {
	console.log("Candidate");
	if (event.candidate) {
		socket.emit("candidate", event.candidate, roomName);
	}
}

// Implementing the OnTrackFunction which is part of the RTCPeerConnection Interface.

function OnTrackFunction(event) {
	peerVideo.srcObject = event.streams[0];
	peerVideo.onloadedmetadata = function (e) {
		peerVideo.play();
	};

}

// 감독관 - 감독관의 웹캠 화면 필요x
// 응시자 - 본인 웹캠과 감독관의 공유 화면 필요


