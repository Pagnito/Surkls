const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: String,
  hashedPassword: String,
  googleId: String,
  twitterId: String,
  twitchId: String,
  userName: String,
  avatarUrl: String,
  quote: String,
  mySurkl: {
    name: String,
    surkl_id: String,
    bannerUrl: String,
    motto: String
  },
  memberOf:{
    surkl_id: String,
    name: String
  },
  lastActive: { type: Date, default: Date.now },
  notifs: [{
    source: {
      name:String,
      source_id:String,
      bannerUrl: String,
      adminName: String,
      avatarUrl:String
    },
    notifType: String,
    text: String,
    date: { type: Date, default: Date.now }
  }],
  dms: [{
    user_id:String,
    thread_id: String,
    avatarUrl: String,
    userName: String,
    latestMsg: String,
    notif: Boolean,
    latest_date: { type: Date, default: Date.now }
  }],
  notif_count:Number,
  new_msg_count: Number,
  messangers: [String],
  following:[String]
});
const User = mongoose.model('users', UserSchema);
module.exports = User;