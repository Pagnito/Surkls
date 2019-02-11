const Twit = require('twit')
const keys = require('../config/keys')
module.exports = (app)=> {
  var T = new Twit({
    consumer_key: keys.twitterConsumerKey ,
    consumer_secret: keys.twitterConsumerSecret,
    access_token: keys.twitterAccessToken,
    access_token_secret: keys.twitterAccessTokenSecret
  })
  app.get('/api/search/tweets/:keyword',(req,res)=>{
    T.get('search/tweets', { q: `${req.params.keyword} since:2018-12-01`, count: 50 }, function(err, data, response) {
      let filteredTwits = [];
      let statusObj = {};
      let respon = typeof(data) ==='object' ? data : {};
      if(Object.keys(respon).lenth>0){
      for(let tweet of data.statuses){
        statusObj = {
          user: {
            name: tweet.user.name,
            id: tweet.user.id,
            screen_name: tweet.user.screen_name,
            location: tweet.user.location,
            description: tweet.user.description,
            url: tweet.user.url,
            followers: tweet.user.followers_count,
            img: tweet.user.profile_image_url,
            httpsImg: tweet.user.profile_image_url_https
          },
          tweetId: tweet.id_str,
          date: tweet.created_at,
          text: tweet.text,
          retweets: tweet.retweet_count,
          fav_count: tweet.favorite_count
        }
        filteredTwits.push(statusObj);
      }
    }
      res.json(filteredTwits)
     })
  })
  app.get('/api/search/twitters/:keyword',(req,res)=>{ 
    T.get('users/search', { q: `${req.params.keyword} since:2018-12-01`, count: 50 }, function(err, data, response) {
      //console.log(data.statuses)
      let filteredTwits = [];
      let twitterObj = {};
      let respon = typeof(data) ==='object' ? data : {};
      if(Object.keys(respon).lenth>0){
        for(let twitter of data){
          twitterObj = {
            id: twitter.id,
            id_str: twitter.id_str,
            name: twitter.name,
            screen_name: twitter.screen_name,
            location: twitter.location,
            description: twitter.description,
            url: twitter.url,
            latestStatus: twitter.status,
            profile_banner: twitter.profile_banner_url,
            avatar_https: twitter.profile_image_url_https,
            avatar:twitter.profile_image_url,
            followers_count: twitter.followers_count,
            friends_count: twitter.friends_count,
            statuses_count: twitter.statuses_count,
          }
          filteredTwits.push(twitterObj);
        }    
      }  
      res.json(filteredTwits)
     })
  })
  app.get('/api/twitter/trends', (req,res)=>{
    T.get('trends/place', { id: `23424977`}, function(err, data, response) {
      if(err) console.log(err)
      let respon = typeof(data[0].trends)==='array' ? data[0].trends : ['Something wrong with the server', err];
      res.json(respon)
     })
  })
}
