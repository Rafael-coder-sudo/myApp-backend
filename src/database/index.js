const mongoose = require('mongoose');

const authConfig = require('../config/auth.json');

mongoose.connect(authConfig.database
  , { useMongoClient: true });
mongoose.Promise = global.Promise;

module.exports = mongoose;
