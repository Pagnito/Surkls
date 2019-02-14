const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const msgSchema = new Schema({
  msg: {
    userName: String,
    msg:String
  }
})
const MsgsSchema = new Schema({
  msgs: [msgSchema]
});
const Msgs = mongoose.model('msgs', MsgsSchema);
module.exports = Msgs;