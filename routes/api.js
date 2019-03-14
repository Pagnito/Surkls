const requireLogin = require('../middlewares/requireLogin');
const redClient = require('../database/redis');
const User = require('../database/models/user-model');
const Msgs = require('../database/models/msg-model');
const Surkl = require('../database/models/surkl-model');
module.exports = (app) => {

	app.get('/api/surkl/:id', requireLogin, (req,res)=>{
		Surkl.findById({_id:req.params.id}).then(surkl=>{
			res.json(surkl)
		})
	})
	app.get('/api/notifs/:id', requireLogin, (req,res)=>{
		if(req.params.id!==undefined && req.params.id.length>0 && req.params.id!=='undefined'){
			User.findById({_id:req.params.id}).then(user=>{
				let sorted = user.notifs.sort((a,b)=>{
					return b.latest_date - a.latest_date; 
				})
				res.json(sorted)
			})
		}
	})
	app.get('/api/dms/:id', requireLogin, (req,res)=>{
		if(req.params.id!==undefined && req.params.id.length>0 && req.params.id!=='undefined'){
			User.findById({_id:req.params.id}).then(user=>{
				let sorted = user.dms.sort((a,b)=>{
					return b.latest_date - a.latest_date; 
				})
				res.json(sorted)
			})
		}
	})
	app.get('/api/dm_thread/:id', requireLogin, (req,res)=>{
		if(req.params.id!==undefined && req.params.id.length>0 && req.params.id!=='undefined'){
			Msgs.findById({_id:req.params.id}).then(thread=>{
				if(thread){
					res.json(thread.msgs)
				} else {
					res.json([])
				}
			})
		}
	})
	app.get('/api/sessions', (req,res)=>{
			redClient.hgetall('rooms', (err, data)=>{
			res.json(data)
		})
	})	
	app.get('/api/surkls_msgs', requireLogin, (req,res)=>{
		redClient.hgetall('surkls-msgs', (err, data)=>{
		res.json(data)
	})
})
/////////////////////////////////////////////////POSTS/////////////////////////////////////////////
app.post('/api/surkl/new',requireLogin, (req,res)=>{
	console.log(req.user)
	let admin = {
		userName: req.user.userName,
		avatarUrl: req.user.avatarUrl,
		user_id: req.user._id,		
	}
	let newSurkl = new Surkl({
		admin: req.body.admin,
		name: req.body.name,
		motto: req.body.motto,
		category: req.body.category,
		members: [admin]
	})
	newSurkl.save().then(surkl=>{
		res.json(surkl)
		let mySurkl = {
			name: surkl.name,
			surkl_id: surkl._id,
			bannerUrl: surkl.bannerUrl
		}
		User.updateOne({_id:req.body.admin}, {$set:{mySurkl:mySurkl}}).exec()
	})	
})
////////////////////////////////////////////////DELETES////////////////////////////////////////////
app.delete('/api/surkl/delete/:id', /* requireLogin, */ (req,res)=>{
	Surkl.findById({_id: req.params.id}).then(surkl=>{
		User.updateOne({_id:surkl.admin}, {$set:{mySurkl:{}}}).exec()
		User.updateMany({_id: {$in:surkl.memberIds}}, {$set:{memberOf:{}}}).exec()
	})
	Surkl.deleteOne({_id:req.params.id}).then(()=>{
		res.json({msg:'Deleted Surkl'})
	})		
})






/////////////////////////////////////////////////EDITS/////////////////////////////////////////////
app.put('/api/surkl/member/add/:id', requireLogin, (req,res)=>{
	Surkl.findOneAndUpdate({_id: req.params.id}, {$push:{members: req.body}}, {new:true},(err,up)=>{
		if(err)console.log(err)
		res.json(up)
	})
})
}