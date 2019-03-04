const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const MsgsSchema = new Schema({
  msgs:[
    {
      userName: String,
      msg: String,
      avatarUrl: String,
      user_id: String
    }
  ] 
});
const Msgs = mongoose.model('msgs', MsgsSchema);
module.exports = Msgs;