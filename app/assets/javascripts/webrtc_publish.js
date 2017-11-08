var PeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
var IceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.RTCIceCandidate;
var SessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.RTCSessionDescription;
if (! navigator.getUserMedia) { navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia; };
var localVideo;
var localPc; // PeerConnection
var ws_socket;

function initWebRTCVideo(streamName, renderTo, terminateFun, hostport) {
  localVideo = renderTo;
  localVideo.autoplay = true;
  localVideo.controls = true;
  localVideo.muted = true;
  localVideo.addEventListener('loadedmetadata', function() {
    console.log('Local video videoWidth: ' + this.videoWidth + 'px,  videoHeight: ' + this.videoHeight + 'px');
  });

  // Set up websocket connection
  var ws_protocol = hostport.indexOf("https:") == -1 ? "ws:" : "wss:";
  ws_socket = new WebSocket(ws_protocol +"//"+hostport.split("//")[1]+"/"+streamName+"/webrtc/publish");
  ws_socket.onopen = function(evt) { getMedia(); }
  ws_socket.onclose = function(evt) { console.log("WebRTC control websocket closed: ", evt.reason); terminateFun(); };
  ws_socket.onmessage = onWSMessage;
}

function stopWebRTCVideo() {
  localPc && localPc.close();
  localPc = null;
  if (localVideo && localVideo.srcObject) { 
    localVideo.srcObject.getTracks().forEach(function(track, idx, tracks) {
      track.stop();
    });
  }
  ws_socket && ws_socket.close();
}


function onWSMessage(evt) {
  var message = JSON.parse(evt.data);
  console.log(message.type);

  if (message.type === 'answer') {
    console.log("new answer from remote to local: ", message.sdp);
    localPc.setRemoteDescription(new SessionDescription(message), function() {
      console.log("success adding answer");
    }, function(reason) {
      console.log("failed to set remote answer",reason);
    });
  } 
  else if (message.type === 'candidate') {
    var candidate = new IceCandidate(message.candidate);
    console.log("new ice candidate from '"+message.stream_id+"'", candidate);
    localPc.addIceCandidate(candidate, function() {
      console.log("added remote ICE on local");
    }, function(err) {
      console.log("failed to add ICE from remote:",err);
    });
  }
}

function sendMessage(msg) {
  // console.log("send message",msg);
  ws_socket.send(JSON.stringify(msg));
}


function getMedia() {
  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({audio: true, video: true})
    .then(gotStream)
    .catch(getMediaFailed);
  }
  else {
    navigator.getUserMedia({audio: true, video: true},
    gotStream, getMediaFailed);
  }
}

function getMediaFailed(error) {
  console.log("GetMedia failed: ", error)
}

function gotStream(stream) {
  //localVideo.src = URL.createObjectURL(stream);
  localVideo.srcObject = stream;

  console.log("got stream", stream, URL.createObjectURL(stream));
  localPc = new PeerConnection(null);
  localPc.stream_id = "local1";
  localPc.addStream(stream);
  localPc.onicecandidate = gotIceCandidate;
  localPc.ontrack = gotRemoteTrack;

  // createOffer

  console.log("creating offer with",localPc.stream_id);

  if (navigator.mediaDevices.getUserMedia) {
    localPc.createOffer({"offerToReceiveAudio":true,"offerToReceiveVideo":true})
    .then(gotLocalDescription)
    .catch(function(error) { console.log(error) });
  } else {
    localPc.createOffer(
      gotLocalDescription,
      function(error) { console.log(error) },
      { 'mandatory': { 'OfferToReceiveAudio': true, 'OfferToReceiveVideo': true } }
    );
  }
}


function gotLocalDescription(description){
  console.log("got local description", description.sdp);
  localPc.setLocalDescription(description);
  sendMessage(description);
}


function gotIceCandidate(event){
  console.log("got local ice candidate");
  if (event.candidate) {
    sendMessage({
      type: 'candidate',
      stream_id : "local1",
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate
    });
  }
}

function gotRemoteTrack(event){
  console.log("got remote track", event); // , URL.createObjectURL(event.stream));
  // document.getElementById("remoteVideo").src = URL.createObjectURL(event.stream);
}
