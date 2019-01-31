const requireLogin = require('../middlewares/requireLogin');
const redClient = require('../database/redis')
module.exports = (app) => {

	app.get('/api/sessions', (req,res)=>{
		console.log('API REDIS')
			redClient.hgetall('rooms', (err, data)=>{
			console.log(data)
			res.json(data)
		})
	})	
};
