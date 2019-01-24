const GoogleStrategy = require('passport-google-oauth20').Strategy;
const passport = require('passport');
const keys = require('../../config/keys');
const User = require('../../database/models/user-model');

passport.serializeUser(function(user, done) {
	done(null, user._id); 
});
passport.deserializeUser(function(id, done) {
	console.log('wtf', id)
	User.findById(id).then(function(user) {
			done(null, user);
	});
});

passport.use(
	new GoogleStrategy(
		{
			clientID: keys.googleClientID,
			clientSecret: keys.googleClientSecret,
			callbackURL: '/auth/google/callback',
			proxy: true
		},
		function(accessToken, refreshToken, profile, done) {
			User.findOne({ googleId: profile.id }, function(err, user) {
				if (err) {
					return done(err);
				}
				if (user) {
					return done(err, user);
				} else {
					
					let str = profile._json.image.url;
					let imgUrl = str.substring(0,str.length-2) + '100';
					const newUser = new User({
						email: profile.emails[0].value,
						userName: profile.displayName,
						googleId: profile.id,
						avatarUrl: imgUrl
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
