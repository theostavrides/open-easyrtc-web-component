// require('dotenv').config()
process.title        = "node-easyrtc";
const path           = require('path');
const http           = require("http");
const express        = require("express");
const serveStatic    = require('serve-static');
const socketIo       = require("socket.io");
const easyrtc        = require("open-easyrtc");
const app            = express();
const webServer      = http.createServer(app);
const socketServer   = socketIo.listen(webServer, {"log level":1});
const cookieParser   = require('cookie-parser');

app.use(express.static(path.join(__dirname, 'src')));
app.use(cookieParser())
app.engine('html', require('ejs').renderFile);


// ---------------------- ROUTES -----------------------

app.get('/', (req, res) => {
  res.render('index.html');
})

//----------------------- EASYRTC -----------------------

easyrtc.setOption("logLevel", "debug");

easyrtc.events.on("easyrtcAuth", function(socket, easyrtcid, msg, socketCallback, callback) {
  // Overriding the default easyrtcAuth listener, only so we can directly access its callback
  easyrtc.events.defaultListeners.easyrtcAuth(socket, easyrtcid, msg, socketCallback, function(err, connectionObj){
    if (err || !msg.msgData || !msg.msgData.credential || !connectionObj) {
      callback(err, connectionObj);
      return;
    }
    connectionObj.setField("credential", msg.msgData.credential, {"isShared":false});
    console.log("["+easyrtcid+"] Credential saved!", connectionObj.getFieldValueSync("credential"));
    callback(err, connectionObj);
  });
});

easyrtc.events.on("roomJoin", function(connectionObj, roomName, roomParameter, callback) {
  // Only allow a client to join room if there are less than 2 clients in it.
  connectionObj.generateRoomList((err, roomList) => {
    if (roomList[roomName].numberClients < 2) {
      easyrtc.events.defaultListeners.roomJoin(connectionObj, roomName, roomParameter, callback);
    }
  })
});

easyrtc.events.on("msgTypeGetRoomList", function(connectionObj, socketCallback, next){
  socketCallback(connectionObj.util.getErrorMsg("MSG_REJECT_NO_ROOM_LIST"));   // do not allow clients to access list of rooms on app.
});


var rtc = easyrtc.listen(app, socketServer, null, function(err, rtcRef) {
  rtcRef.events.on("roomCreate", function(appObj, creatorConnectionObj, roomName, roomOptions, callback) {
    appObj.events.defaultListeners.roomCreate(appObj, creatorConnectionObj, roomName, roomOptions, callback);
  });
});

webServer.listen(8080, function () {
    console.log('listening on http://localhost:8080');
});
