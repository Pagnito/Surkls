const redis = require('redis');
let url = process.env.NODE_ENV === 'production' ? process.env.REDIS_URL : 'redis://127.0.0.1:6379';
let redClient = redis.createClient(url);
module.exports = redClient;