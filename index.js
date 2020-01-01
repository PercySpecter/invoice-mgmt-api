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
const Invoice = require('./db_schema').Invoice;
const InvoiceItem = require('./db_schema').InvoiceItem;
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
app.get('/users', (req, res) => {
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
      res.send({token: ''});
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
          res.send({token: ''});
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
/***Product API end***/

/***Invoice API start***/
/*Add new Invoice*/
app.post('/api/invoices' , [bodyParser, isAuthenticated], (req , res) => {
  Invoice.find({} , (error , invoices) => {
    let id = invoices.reduce((max , curr) => {
      max = curr.id > max ? curr.id : max;
      return max;
    } , 0);

    let invoice = {
              "id": id,
              "customer_id": 0,
              "discount": 0,
              "total": 0
           };
    Object.assign(invoice , req.body);
    invoice.id = id + 1;
    console.log(invoice);
    Invoice.create(invoice , (error , new_invoice) => {
      console.log(new_invoice);
      res.json(new_invoice);
    });
  });
});

/*List all Invoices*/
app.get('/api/invoices', isAuthenticated, (req , res) => {
  Invoice.find({} , (error , invoices) => {
    res.json(invoices);
  });
});

/*Details of Invoice by id*/
app.get('/api/invoices/:id', isAuthenticated, (req , res) => {
  const id = req.params.id;
  Invoice.findOne({id: id} , (error , invoice) => {
    res.json(invoice);
  });
});

/*Edit details of an Invoice*/
app.put('/api/invoices/:id', [bodyParser, isAuthenticated], (req , res) => {
  const id = req.params.id;
  try {
    Invoice.findOne({id: id} , (error , invoice) => {
      if(invoice == null)
      {
        res.sendStatus(404);
      }
      else
      {
        Object.assign(invoice , req.body);
        invoice.id = id;
        Invoice.findOneAndUpdate({id: id} , invoice , () => {});
        res.json(invoice);
      }
    });
  }
  catch (e) {
    res.sendStatus(404);
  }
});

/*Delete an Invoice*/
app.delete('/api/invoices/:id', isAuthenticated, (req , res) => {
  const id = req.params.id;
  Invoice.deleteOne({id: id} , (error , result) => {
    res.json(result);
  });
});
/***Invoice API end***/

/***InvoiceItem API start***/
/*Add new InvoiceItem*/
app.post('/api/invoices/:inv_id/items' , [bodyParser, isAuthenticated], (req , res) => {
  const inv_id = req.params.inv_id;
  InvoiceItem.find({invoice_id: inv_id} , (error , invoiceItems) => {
    let id = invoiceItems.reduce((max , curr) => {
      max = curr.id > max ? curr.id : max;
      return max;
    } , 0);

    let invoiceItem = {
              "id": id,
              "invoice_id": inv_id,
              "product_id": 0,
              "quantity": 0
           };
    Object.assign(invoiceItem , req.body);
    invoiceItem.id = id + 1;
    invoiceItem.invoice_id = inv_id;
    console.log(invoiceItem);
    InvoiceItem.create(invoiceItem , (error , new_invoiceItem) => {
      console.log(new_invoiceItem);
      res.json(new_invoiceItem);
    });
  });
});

/*List all InvoiceItems*/
app.get('/api/invoices/:inv_id/items', isAuthenticated, (req , res) => {
  const inv_id = req.params.inv_id;
  InvoiceItem.find({invoice_id: inv_id} , (error , invoiceItems) => {
    res.json(invoiceItems);
  });
});

/*Details of InvoiceItem by id*/
app.get('/api/invoices/:inv_id/items/:id', isAuthenticated, (req , res) => {
  const id = req.params.id;
  const inv_id = req.params.inv_id;
  InvoiceItem.findOne({invoice_id: inv_id, id: id} , (error , invoiceItem) => {
    res.json(invoiceItem);
  });
});

/*Edit details of an InvoiceItem*/
app.put('/api/invoices/:inv_id/items/:id', [bodyParser, isAuthenticated], (req , res) => {
  const id = req.params.id;
  const inv_id = req.params.inv_id;
  try {
    InvoiceItem.findOne({invoice_id: inv_id, id: id} , (error , invoiceItem) => {
      if(invoiceItem == null)
      {
        res.sendStatus(404);
      }
      else
      {
        Object.assign(invoiceItem , req.body);
        invoiceItem.id = id;
        invoiceItem.invoice_id = inv_id;
        InvoiceItem.findOneAndUpdate({invoice_id: inv_id, id: id} , invoiceItem , () => {});
        res.json(invoiceItem);
      }
    });
  }
  catch (e) {
    res.sendStatus(404);
  }
});

/*Delete an InvoiceItem*/
app.delete('/api/invoices/:inv_id/items/:id', isAuthenticated, (req , res) => {
  const id = req.params.id;
  const inv_id = req.params.inv_id;
  InvoiceItem.deleteOne({invoice_id: inv_id, id: id} , (error , result) => {
    res.json(result);
  });
});
/***InvoiceItem API end***/


var server = app.listen(4000, function () {
  console.log('Server running at http://localhost:' + server.address().port)
})
