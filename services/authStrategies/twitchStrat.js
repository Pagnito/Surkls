const TwitchStrategy = require('passport-twitch').Strategy;
const passport = require('passport');
const keys = require('../../config/keys');
const User = require('../../database/models/user-model');

passport.serializeUser(function(user, done) {
	done(null, user._id); 
});
passport.deserializeUser(function(id, done) {
	User.findById(id).then(function(user) {
			done(null, user);
	});
});

passport.use(
	new TwitchStrategy(
		{
			clientID: keys.twitchClientID,
			clientSecret: keys.twitchClientSecret,
      callbackURL: '/auth/twitch/callback',
      scope: "user_read",
			proxy: true
		},
		function(accessToken, refreshToken, profile, done) {
			User.findOne({twitchId: profile.id }, function(err, user) {
				if (err) {
					return done(err);
				}
				if (user) {
					return done(err, user);
				} else {
          console.log(profile)
					let imgUrl = typeof(profile._json.logo) ==='string' ? profile._json.logo : '';
					let email = typeof(profile.email) ==='string' ? profile.email : '';
					let userName = typeof(profile.username) ==='string' ? profile.username : '';
					
					const newUser = new User({
						email: email,
						userName: userName,
						twitchId: profile.id.toString(),
						avatarUrl: imgUrl ?imgUrl : '/assets/whitehat.jpg'
					});
					newUser.save().then((user) => {
						return done(err, user);
					}).catch(err => {
						console.log(err);
					});;
				}
			});
		}
	)
);
