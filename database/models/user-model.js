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
  surkl: String,
  subscriptions: [String],
  dms: [{threadId:String,userId:String}],
  messangers: [String],
  followers: [Object],
  following:[String]
});
const User = mongoose.model('users', UserSchema);
module.exports = User;