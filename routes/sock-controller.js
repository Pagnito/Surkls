const sessions = require('./session-sockets');
const dms = require('./msgs-sockets');
const surkl = require('./surkl-sockets');
module.exports = (io, app) => {  
  io.on('connection', (socket)=>{
     dms(io, socket, app)
     sessions(io,socket)
     surkl(io,socket)
  })
}