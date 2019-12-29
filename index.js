/**
* @author Kinjal Ray
* API for Invoice Management System
*/

/*Required Dependencies start*/
const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors());

const bodyParser = require('body-parser').json();
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();

const bcrypt = require('bcrypt');
const saltRounds = 12;

const User = require('./db_schema').User;
const Customer = require('./db_schema').Customer;
const Product = require('./db_schema').Product;
/*Required Dependencies end*/


/*Middleware to authenticate token*/
function isAuthenticated(req, res, next) {
    if (typeof req.headers.authorization !== "undefined") {
        let token = req.headers.authorization.split(" ")[1];
        jwt.verify(token, process.env.PRIVATE_KEY, (err, user) => {
            if (err)
            {
                res.status(500).json({ error: "Not Authorized" });
            }
            req.user = user;
            next();
        });
    }
    else
    {
        res.status(500).json({ error: "Not Authorized" });
    }
}

/*Add new User*/
app.post('/new' , bodyParser, (req , res) => {
  const uname = req.body.uname;
  const pass = req.body.pass;
  console.log(req.body);

  if(uname.length < 4)
  {
    res.json({msg: '<span class="text-danger">Username should be at least 4 characters long</span>'});
  }
  if(pass.length < 8)
  {
    res.json({msg: '<span class="text-danger">Password should be at least 8 characters long</span>'});
  }
  User.findOne({username: uname} , (error , user) => {
    console.log(user);
    if(user == null)
    {
      bcrypt.hash(pass , saltRounds , (err , hash) => {
        let user = {username: uname, password: hash};
        User.create(user , (error , new_user) => {
          console.log(new_user);
          res.json({msg: '<span class="text-success">Sign Up completed successfully!</span>'});
        })
      })
    }
    else
    {
      res.json({msg: '<span class="text-danger">UserID already taken! Use a different UserID.</span>'});
    }
  })
});

/*Get list of Users*/
app.get('/users', function (req, res) {
  try {
    User.find({} , (error , users) => {
      let unames = users.map((user) => user.username);
      res.json(unames);
    });
  }
  catch (e) {
    res.sendStatus(404);
  }
});

/*Authorize User and create token*/
app.post('/auth', bodyParser, (req , res) => {
  const uname = req.body.uname;
  const pass = req.body.pass;
  User.findOne({username: uname} , (error , user) => {
    console.log(user);
    if(error || user == null)
    {
      res.sendStatus(403);
    }
    else
    {
      bcrypt.compare(pass , user.password , (err , result) => {
        if(result)
        {
          let token = jwt.sign({ uid: user._id, username: uname }, process.env.PRIVATE_KEY);
          res.json({token: token});
        }
        else
        {
          res.sendStatus(403);
        }
      })
    }
  })
});

// app.get('/test', isAuthenticated, function (req, res) {
//     res.json(req.user);
// })

/***Customer API start***/
/*Add new Customer*/
app.post('/api/customers' , [bodyParser, isAuthenticated], (req , res) => {
  Customer.find({} , (error , customers) => {
    let id = customers.reduce((max , curr) => {
      max = curr.id > max ? curr.id : max;
      return max;
    } , 0);

    let customer = {
              "id": id,
              "name": "",
              "address": "",
              "phone": ""
           };
    Object.assign(customer , req.body);
    customer.id = id + 1;
    console.log(customer);
    Customer.create(customer , (error , new_customer) => {
      console.log(new_customer);
      res.json(new_customer);
    });
  });
});

/*List all Customers*/
app.get('/api/customers', isAuthenticated, (req , res) => {
  Customer.find({} , (error , customers) => {
    res.json(customers);
  });
});

/*Details of Customer by id*/
app.get('/api/customers/:id', isAuthenticated, (req , res) => {
  const id = req.params.id;
  Customer.findOne({id: id} , (error , customer) => {
    res.json(customer);
  });
});

/*Edit details of a Customer*/
app.put('/api/customers/:id', [bodyParser, isAuthenticated], (req , res) => {
  const id = req.params.id;
  try {
    Customer.findOne({id: id} , (error , customer) => {
      if(customer == null)
      {
        res.sendStatus(404);
      }
      else
      {
        Object.assign(customer , req.body);
        customer.id = id;
        Customer.findOneAndUpdate({id: id} , customer , () => {});
        res.json(customer);
      }
    });
  }
  catch (e) {
    res.sendStatus(404);
  }
});

/*Delete a Customer*/
app.delete('/api/customers/:id', isAuthenticated, (req , res) => {
  const id = req.params.id;
  Customer.deleteOne({id: id} , (error , result) => {
    res.json(result);
  });
});
/***Customer API end***/

/***Product API start***/
/*Add new Product*/
app.post('/api/products' , [bodyParser, isAuthenticated], (req , res) => {
  Product.find({} , (error , products) => {
    let id = products.reduce((max , curr) => {
      max = curr.id > max ? curr.id : max;
      return max;
    } , 0);

    let product = {
              "id": id,
              "name": "",
              "price": 0
           };
    Object.assign(product , req.body);
    product.id = id + 1;
    console.log(product);
    Product.create(product , (error , new_product) => {
      console.log(new_product);
      res.json(new_product);
    });
  });
});

/*List all Products*/
app.get('/api/products', isAuthenticated, (req , res) => {
  Product.find({} , (error , products) => {
    res.json(products);
  });
});

/*Details of Product by id*/
app.get('/api/products/:id', isAuthenticated, (req , res) => {
  const id = req.params.id;
  Product.findOne({id: id} , (error , product) => {
    res.json(product);
  });
});

/*Edit details of a Product*/
app.put('/api/products/:id', [bodyParser, isAuthenticated], (req , res) => {
  const id = req.params.id;
  try {
    Product.findOne({id: id} , (error , product) => {
      if(product == null)
      {
        res.sendStatus(404);
      }
      else
      {
        Object.assign(product , req.body);
        product.id = id;
        Product.findOneAndUpdate({id: id} , product , () => {});
        res.json(product);
      }
    });
  }
  catch (e) {
    res.sendStatus(404);
  }
});

/*Delete a Product*/
app.delete('/api/products/:id', isAuthenticated, (req , res) => {
  const id = req.params.id;
  Product.deleteOne({id: id} , (error , result) => {
    res.json(result);
  });
});

/***Product API start***/


var server = app.listen(4000, function () {
  console.log('Server running at http://localhost:' + server.address().port)
})
