const passport = require('passport');
require('../services/authStrategies/googleStrat')
module.exports = app => {
  app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/dashboard');
  });
}