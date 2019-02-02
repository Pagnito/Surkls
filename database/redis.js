const redis = require('redis');
let redClient = redis.createClient('redis://127.0.0.1:6379');
module.exports = redClient;