const requireLogin = require('../middlewares/requireLogin');
const redClient = require('../database/redis');
const User = require('../database/models/user-model');
const Msgs = require('../database/models/msg-model');
const Surkl = require('../database/models/surkl-model');
module.exports = (app) => {
	app.get('/api/surkl/:id', requireLogin, (req, res) => {
		Surkl.findById({ _id: req.params.id }).then((surkl) => {
			res.json(surkl);
		});
	});
	app.get('/api/surkls', (req, res) => {
		Surkl.find().then((surkls) => {
			res.json(surkls);
		});
	});
	app.get('/api/notifs/:id', requireLogin, (req, res) => {
		if (req.params.id !== undefined && req.params.id.length > 0 && req.params.id !== 'undefined') {
			User.findById({ _id: req.params.id }).then((user) => {
				let sorted = user.notifs.sort((a, b) => {
					return b.latest_date - a.latest_date;
				});
				res.json(sorted);
			});
		}
	});
	app.get('/api/dms/:id', requireLogin, (req, res) => {
		if (req.params.id !== undefined && req.params.id.length > 0 && req.params.id !== 'undefined') {
			User.findById({ _id: req.params.id }).then((user) => {
				let sorted = user.dms.sort((a, b) => {
					return b.latest_date - a.latest_date;
				});
				res.json(sorted);
			});
		}
	});
	app.get('/api/dm_thread/:id', requireLogin, (req, res) => {
		if (req.params.id !== undefined && req.params.id.length > 0 && req.params.id !== 'undefined') {
			Msgs.findById({ _id: req.params.id }).then((thread) => {
				if (thread) {
					res.json(thread.msgs);
				} else {
					res.json([]);
				}
			});
		}
	});
	app.get('/api/sessions', (req, res) => {
		redClient.hgetall('rooms', (err, data) => {
			res.json(data);
		});
	});
	app.get('/api/surkls_msgs', requireLogin, (req, res) => {
		redClient.hgetall('surkls-msgs', (err, data) => {
			res.json(data);
		});
	});
	/////////////////////////////////////////////////POSTS/////////////////////////////////////////////
	app.post('/api/surkl/new', requireLogin, (req, res) => {
		let admin = {
			userName: req.user.userName,
			avatarUrl: req.user.avatarUrl,
			user_id: req.user._id
		};
		let newSurkl = new Surkl({
			admin: admin,
			name: req.body.name,
			motto: req.body.motto,
			category: req.body.category,
			members: [ admin ]
		});
		newSurkl.save().then((surkl) => {
			res.json(surkl);
			let mySurkl = {
				name: surkl.name,
				surkl_id: surkl._id,
				bannerUrl: surkl.bannerUrl,
				motto: surkl.motto
			};
			User.updateOne({ _id: req.body.admin }, { $set: { mySurkl: mySurkl } }).exec();
		});
	});
	////////////////////////////////////////////////DELETES////////////////////////////////////////////
	app.delete(
		'/api/surkl/delete/:id',
		requireLogin, (req, res) => {
			Surkl.findById({ _id: req.params.id }).then((surkl) => {
				User.updateOne({ _id: req.user._id }, { $unset: { mySurkl: 1 } }).exec();
				User.updateMany({ _id: { $in: surkl.memberIds } }, { $unset: { memberOf: 1 } }).exec();
			});
			Surkl.deleteOne({ _id: req.params.id }).then(() => {
				res.json({ msg: 'Deleted Surkl' });
			});
		}
	);
	
	/////////////////////////////////////////////////EDITS/////////////////////////////////////////////
	app.put('/api/user/update', requireLogin, (req, res) => {
		User.findByIdAndUpdate({_id: req.user._id},{$set:req.body},{new:true},(err,up)=>{
			res.json(up)
		})
	});
	app.put('/api/user/update/username', requireLogin, (req, res) => {
		User.findById({_id:req.user._id}).then(user=>{
			User.findOne({userName: req.body.userName}).then(contender=>{
				if(contender){
					res.json({err: "Name already exists"})
				} else {
					user.userName = req.body.userName
					user.save().then(saved=>{
						res.json(saved);
					})
				}
			})
		})
	});
	app.put('/api/surkl/member/add/:id', requireLogin, (req, res) => {
		Surkl.findOneAndUpdate({ _id: req.params.id }, { $push: { members: req.body } }, { new: true }, (err, up) => {
			if (err) console.log(err);
			res.json(up);
		});
	});

	
	app.put('/api/surkl/leave/:id', requireLogin, (req, res) => {
		Surkl.findById({_id: req.params.id}).then(surkl=>{
			let regex = RegExp(req.user._id);
			let filteredIds = surkl.memberIds.filter(mem=>{
				console.log(mem===req.user._id)
				return mem.indexOf(req.user._id)<0;
			});
			let filtered = surkl.members.filter(mem=>{
				return regex.test(mem.user_id) === false
			});
			surkl.members = filtered
			surkl.memberIds = filteredIds;
			surkl.save().then(()=>{
				User.findByIdAndUpdate({_id: req.user._id}, {$unset:{memberOf: 1}},{new:true},(err,up)=>{
					res.json(up)
				})
			})
		})
	});
	app.put('/api/surkl/update/:id', requireLogin, (req, res) => {
		if(req.body.name){
			User.findByIdAndUpdate({_id: req.user._id}, {$set:{'mySurkl.name': req.body.name}}).exec()
		}
		if(req.body.motto){
			User.findByIdAndUpdate({_id: req.user._id}, {$set:{'mySurkl.motto': req.body.motto}}).exec()
		}		
		Surkl.findByIdAndUpdate({_id: req.params.id},{$set:req.body},{new:true},(err,up)=>{
			res.json(up)
		})
	});
	app.put('/api/surkl/update_admin/:id', requireLogin, (req, res) => {
		let admin = req.body.admin;
		let surkl = {
			surkl_id: req.body.surkl_id,
			name: req.body.name
		}
		User.findByIdAndUpdate({_id: req.user._id}, {
			$unset:{
				mySurkl:1 
			},
			$set:{
				memberOf:surkl
			}}).exec()	
		User.findByIdAndUpdate({_id: req.body.admin.user_id},{
				 $set:{
					 mySurkl:surkl
				},
				$unset: {
					memberOf: 1
				}}).exec()	
		Surkl.findByIdAndUpdate({_id: req.params.id},{$set:{admin:admin}},{new:true},(err,up)=>{
			res.json(up)
		})
	});
	app.put('/api/surkl/create_event', requireLogin, (req, res) => {	
		Surkl.findByIdAndUpdate({_id: req.user._id},{$set:{event:req.body}},{new:true},(err,up)=>{
			res.json(up)
		})
	});
};
