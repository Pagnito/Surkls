const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../../database/models/user-model');
const crypto = require('crypto');
const keys = require('../../config/keys');
passport.serializeUser(function(user, done){
  done(null, user.id)
});
passport.deserializeUser(function(id, done){
  User.findOne({_id: id}).then(user=>{
    done(null, user);
  });
});
passport.use(new LocalStrategy({
  passwordField: 'password',
  usernameField: 'email'
}, function(email, password, done){
  const hashedPassword = crypto.createHmac('sha256', keys.cookieSecret)
                   .update(password)
                   .digest('hex');
  User.findOne({email: email}).then(user=>{
    if(user){
      if(hashedPassword===user.hashedPassword){
        let userRes = {
          email: user.email,
          userName: user.userName,
          _id:user._id,
          avatarUrl: user.avatarUrl,
          dms: user.dms
        }
        done(null, userRes)
      } else {
        done(null, false)
      }     
    } else {
      done(null, false)
    }
  })
}));