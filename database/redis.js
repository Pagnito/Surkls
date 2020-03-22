const redis = require('redis');
let url = process.env.NODE_ENV === 'production' ? process.env.REDISCLOUD_URL : 'redis://127.0.0.1:6379';
let redClient = redis.createClient({
  host: url,
  no_ready_check: true,
  auth_pass: process.env.REDIS_PASSWORD,
});
module.exports = redClient;