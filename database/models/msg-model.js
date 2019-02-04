const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MsgSchema = new Schema({
  userName: String,
  avatarUrl: String
});
const Msg = mongoose.model('msgs', MsgSchema);
module.exports = Msg;