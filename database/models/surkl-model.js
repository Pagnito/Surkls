const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SurklSchema = new Schema({
  name:String,
  category: String,
  description: String,
  bannderUrl: String,
  motto: String,
  currentTrack: String,
  admin: {
    user_id: String,
    userName: String,
    avatarUrl: String
  },
  memberIds: [String],
  requests: [String],
  members:[{
    user_id: String,
    userName:String,
    avatarUrl:String    
  }],
  events: [String] 
});
const Surkl = mongoose.model('surkls', SurklSchema);
module.exports = Surkl;