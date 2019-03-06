const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SurklSchema = new Schema({
  name:String,
  members:String,
  events: String 
});
const Surkl = mongoose.model('surkls', SurklSchema);
module.exports = Surkl;