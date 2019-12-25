const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const User = require('../database/models/user-model');

//const redClient = require('../database/redis');


module.exports = (io, socket, connectedUsers) => {
}