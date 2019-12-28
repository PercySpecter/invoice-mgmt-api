
var uri = 'mongodb://localhost:27017/invoice';

var _ = require('lodash');
var mongoose = require('mongoose');
mongoose.connect(uri);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log('db connected');
});

var userSchema = mongoose.Schema ({
  username: String,
  password: String
});

exports.User = mongoose.model('User', userSchema);
