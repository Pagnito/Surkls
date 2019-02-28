const sessions = require('./session-sockets');
const dms = require('./msgs-sockets')
module.exports = (io, app) => {  
  io.on('connection', (socket)=>{
   
     sessions(io,socket)
  })
}