module.exports = (req,res,next) => {
  if(req.user){
    next()
  } else {
    res.status(401).json({err:'You are not logged in'})
  }
}