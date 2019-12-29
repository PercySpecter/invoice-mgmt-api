
var uri = 'mongodb://localhost:27017/invoice';

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

var customerSchema = mongoose.Schema ({
  id: Number,
  name: String,
  address: String,
  phone: String
});

var productSchema = mongoose.Schema ({
  id: Number,
  name: String,
  price: Number
});

var invoiceSchema = mongoose.Schema ({
  id: Number,
  customer_id: Number,
  discount: Number,
  total: Number
});

exports.User = mongoose.model('User', userSchema);
exports.Customer = mongoose.model('Customer', customerSchema);
exports.Product = mongoose.model('Product', productSchema);
exports.Invoice = mongoose.model('Invoice', invoiceSchema);
