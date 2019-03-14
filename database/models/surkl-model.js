const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SurklSchema = new Schema({
  name:String,
  category: String,
  description: String,
  bannderUrl: String,
  motto: String,
  admin: {
    admin_id: String,
    nameUrl: String,
    avatarUrl: String
  },
  memberIds: [String],
  members:[{
    userName:String,
    avatarUrl:String,
    user_id: String
  }],
  events: [String] 
});
const Surkl = mongoose.model('surkls', SurklSchema);
module.exports = Surkl;