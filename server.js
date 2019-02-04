const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const compression = require('compression')
const path = require("path");
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 4000;
const ip = require('ip');
const api = require('./routes/api');
const auth = require('./routes/auth');
const sessionSockets = require('./routes/session-sockets');
const mongoose = require("mongoose");
const keys = require("./config/keys");
const passport = require("passport");
const cookieSession = require("cookie-session");
const helmet = require('helmet');
const cors = require('cors');
////load schema models/////
//@TODO set up security policy header
console.log('\x1b[35m', 'IP is ', ip.address(), '\x1b[0m')
//////connect to database//////
mongoose.set('useFindAndModify', false);
mongoose
  .connect(
    keys.mongoURI,
    { useNewUrlParser: true }
  )
  .then(() => console.log('\x1b[33m%s\x1b[0m', "Connected To Mongo"))
  .catch(err => console.log(err));

/////////////////////////////////////middlewares/////////////////////////////////////

app.use(helmet())
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({ 
  keys: [keys.cookieSecret],
  maxAge: 22222222222, 
  }));
app.use(passport.initialize());
app.use(passport.session());

////use cookie session to encrypt cookie from authentication and admniister its lifespan////


////////////////////////////////////activate routes/////////////////////////////////
api(app);
auth(app);
sessionSockets(io, app);
/* if (process.env.NODE_ENV == "production") { */
  app.use(express.static(path.resolve(__dirname, "client", "build")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
  });
//}
server.listen(PORT/* ,'192.168.1.4' */, ()=>{
  console.log('\x1b[35m%s\x1b[0m', "BACKEND ON PORT 4000");
  console.log('\x1b[36m%s\x1b[0m', "FRONTEND ON PORT 3000")
});
