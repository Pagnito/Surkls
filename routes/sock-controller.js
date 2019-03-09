const sessions = require('./session-sockets');
const dms = require('./msgs-sockets');
const surkl = require('./surkl-sockets');
const notifs = require('./notif-sockets');
let connectedUsers = {};
let surkls = {};
module.exports = (io, app) => {  
  io.on('connection', (socket)=>{
    socket.on('setup', (user) => {
      user.socketId = socket.id;
      connectedUsers[user._id] = user;
      console.log('CONNECTED USERS', Object.keys(connectedUsers));
    });
     notifs(io, socket, connectedUsers)
     dms(io, socket, connectedUsers)
     sessions(io,socket)
     surkl(io,socket, connectedUsers)
  })
}