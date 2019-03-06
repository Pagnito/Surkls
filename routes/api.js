const requireLogin = require('../middlewares/requireLogin');
const redClient = require('../database/redis');
const User = require('../database/models/user-model');
const Msgs = require('../database/models/msg-model');
module.exports = (app) => {
	app.get('/api/dms/:id', (req,res)=>{
		User.findById({_id:req.params.id}).then(user=>{
			let sorted = user.dms.sort((a,b)=>{
				return b.latest_date - a.latest_date; 
			})
			res.json(sorted)
		})
	})
	app.get('/api/dm_thread/:id', (req,res)=>{
		Msgs.findById({_id:req.params.id}).then(thread=>{
			if(thread){
				res.json(thread.msgs)
			} else {
				res.json([])
			}
			
		})
	})
	app.get('/api/sessions', (req,res)=>{
			redClient.hgetall('rooms', (err, data)=>{
			res.json(data)
		})
	})	
};
