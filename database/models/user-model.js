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
  theme: String,
  surkls: [String]
});
const User = mongoose.model('users', UserSchema);
module.exports = User;