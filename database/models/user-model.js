const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  email: String,
  hashedPassword: String,
  googleId: String,
  userName: {
    type: String,
    required: true
  },
  avatarUrl: String
});
const User = mongoose.model('users', UserSchema);
module.exports = User;