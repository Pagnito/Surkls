const sessions = require('./session-sockets');
const dms = require('./msgs-sockets');
let socketObj;
module.exports = (io, app) => {  
  io.on('connection', (socket)=>{
      socketObj = socket;
     sessions(io,socket)
     console.log('ROUTING SOCKET')
  })
}