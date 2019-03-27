const passport = require('passport');
const User = require('../database/models/user-model');
const Surkl = require('../database/models/surkl-model');
const requireLogin = require('../middlewares/requireLogin');
const crypto = require('crypto');
const keys = require('../config/keys');
require('../services/authStrategies/googleStrat');
require('../services/authStrategies/twitterStrat');
require('../services/authStrategies/localStrat');
require('../services/authStrategies/twitchStrat');
module.exports = (app) => {
	///////////////////////////////////////////twitter auth////////////////////////////////////////////
	app.get('/auth/twitter', passport.authenticate('twitter', { scope: [ 'profile', 'email' ] }));
  app.get('/auth/twitter/callback', 
    passport.authenticate('twitter', { failureRedirect: '/' }), function(req, res) {
		res.redirect('/');
	});
	///////////////////////////////////////////google auth////////////////////////////////////////////
	app.get('/auth/google', passport.authenticate('google', { scope: [ 'profile', 'email' ] }));
  app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/' }), function(req, res) {
		res.redirect('/');
	});
	///////////////////////////////////////////local auth/////////////////////////////////////////////
	app.post('/auth/login', passport.authenticate('local'), (req,res)=>{
		res.json(req.user)
	});
	app.post('/auth/register', (req,res)=>{
		console.log(req.body)
		User.findOne({email:req.body.email}).then(user=>{
			if(user){
				console.log(user)
				res.status(401).json({msg:"Email already exists"})
			} else {
				const hashedPassword = crypto.createHmac('sha256', keys.cookieSecret)
                   .update(req.body.password)
                   .digest('hex');
				let newUser = new User ({
					email: req.body.email,
					userName: req.body.userName,
					hashedPassword: hashedPassword,
					avatarUrl: '/assets/whitehat.jpg'
				})
				newUser.save().then(()=>{
					passport.authenticate('local')(req,res, ()=>{
						if(req.user){
							res.json(req.user);
						} else {
							res.status(401).json({msg: 'Couldnt find user'})
						}						
					})
				})
			}
		})
	})
	///////////////////////////////////////////twitch auth////////////////////////////////////////////
	app.get('/auth/twitch', passport.authenticate('twitch'));
  app.get('/auth/twitch/callback', 
    passport.authenticate('twitch', { failureRedirect: '/' }), function(req, res) {
		res.redirect('/');
	});
	/////////////////////////////////////////account routes///////////////////////////////////////////
	app.put('/account/update', requireLogin, (req, res) => {
		let userProps = req.body;
		User.findOneAndUpdate({ email: req.user.email }, { $set: userProps }, { new: true })
			.then((user) => {
				if (user) {
					let userRes = {
						email: user.email,
						userName: user.userName,
						_id: user._id
					};
					res.json(userRes);
				} else {
					res.status(404).json({ err: 'User not found' });
				}
			})
			.catch((err) => {
				res.status(500).json({ err: 'Internal server error' });
			});
	});

	app.delete('/account/delete', requireLogin, (req, res) => {
		User.findById({ _id: req.user._id })
			.then((user) => {
				if(user.mySurkl.name){
					Surkl.findOneAndDelete({_id:user.mySurkl.surkl_id}).exec()
				}
				if(user.memberOf.surkl_name){
					Surkl.findById({_id: user.memberOf.surkl_id}).then(surkl=>{
						let filtered = surkl.members.filter(mem=>{
							return mem.user_id!==user._id
						})
						surkl.members = filtered;	
						surkl.save()					
					})
				}			
					user.delete().then(res.json({msg:"Deleted"}))
			})
			.catch((err) => {
				res.status(500).json({ err: 'Could not delete your account' });
			});
	});
	app.get('/auth/logout', requireLogin, (req,res)=>{
		req.logout();
		res.redirect("/");
	})
	app.get('/account', requireLogin, (req, res) => {
		if (req.user) {
			let userRes = req.user
			res.json(userRes);
		} else {
			res.status(401).end();
		}
	});
}