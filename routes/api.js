module.exports = app => {
  app.get('/api', (req, res)=>{
    console.log(req.user);
    res.send('hello')
  })
}