const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const MsgsSchema = new Schema({
  user1: String,
  user2: String,
  msgs:[
    {
      userName: String,
      msg: String
    }
  ] 
});
const Msgs = mongoose.model('msgs', MsgsSchema);
module.exports = Msgs;