const mongoose = require('mongoose');

const authConfig = require('../config/auth.json');

mongoose.connect(authConfig.database
  , { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;

module.exports = mongoose;
