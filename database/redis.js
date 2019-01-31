const redis = require('redis');
let redClient = redis.createClient();
module.exports = redClient;