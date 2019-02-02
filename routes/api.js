const requireLogin = require('../middlewares/requireLogin');
const redClient = require('../database/redis')
module.exports = (app) => {

	app.get('/api/sessions', (req,res)=>{
			redClient.hgetall('rooms', (err, data)=>{
			res.json(data)
		})
	})	
};
