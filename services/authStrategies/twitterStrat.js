const TwitterStrategy = require('passport-twitter').Strategy;
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
	new TwitterStrategy(
		{
			consumerKey: keys.twitterConsumerKey,
			consumerSecret: keys.twitterConsumerSecret,
			callbackURL: '/auth/twitter/callback',
			userProfileURL: "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true",
			proxy: true
		},
		function(accessToken, refreshToken, profile, done) {
			console.log(profile)
			User.findOne({ twitterId: profile.id }, function(err, user) {
				if (err) {
					return done(err);
				}
				if (user) {
					return done(err, user);
				} else {
						let imgUrl = typeof(profile.photos[0].value) === 'string' ? profile.photos[0].value : '';
						let userName = typeof(profile.displayName) === 'string' ? profile.displayName : '';
						let twitterId = typeof(profile.id) === 'string' ? profile.id : '';
						let email = typeof(profile.email) === 'string' ? profile.email : '';				
					  const newUser = new User({
						email: email,
						userName: userName,
						twitterId: twitterId,
						avatarUrl: imgUrl ? imgUrl : '/assets/whitehat.jpg'
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
