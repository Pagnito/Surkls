const GoogleStrategy = require('passport-google-oauth20').Strategy;
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
					let img = typeof(profile._json.image.url) ==='string' ? profile._json.image.url : '';
					let email = typeof(profile.emails[0].value) ==='string' ? profile.emails[0].value : '';
					let userName = typeof(profile.displayName) ==='string' ? profile.displayName : '';
					let googleId = typeof(profile.id) ==='string' ? profile.id : '';					
					let imgUrl = img.substring(0,img.length-2) + '100';
					
					const newUser = new User({
						email: email,
						userName: userName,
						googleId: googleId,
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
