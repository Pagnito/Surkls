const sessions = require('./session-sockets');
const dms = require('./msgs-sockets');
const surkl = require('./surkl-sockets');
const notifs = require('./notif-sockets');
const redClient = require('../database/redis');
let connectedUsers = {};
let surkls = {};

module.exports = (io, app) => {  
  io.on('connection', (socket)=>{
	/* redClient.flushdb( function (err, succeeded) {
    console.log(succeeded); // will be true if successfull
    }); */
    /* redClient.del('surkls-msgs', function (err, succeeded) {
      console.log(succeeded); // will be true if successfull
      }); */
   /*  redClient.del('rooms', function (err, succeeded) {
      if(err)console.log(err)
      console.log(succeeded); // will be true if successfull
      }); */
    /* redClient.hgetall('rooms',(err, str)=>{
      console.log(str)
    })
  */

    socket.on('setup', (user) => {
      user.socketId = socket.id;
      connectedUsers[user._id] = user;
      delete connectedUsers['undefined'];
      console.log('CONNECTED USERS', Object.keys(connectedUsers));
      socket.emit('setup-complete', Object.keys(connectedUsers).length)
    });

    notifs(io, socket, connectedUsers)
    dms(io, socket, connectedUsers)
    sessions(io,socket)
    surkl(io,socket, connectedUsers)
    
  })
}