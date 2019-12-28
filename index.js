/**
* @author Kinjal Ray
* API for Invoice Management System
*/

/*Required Dependencies start*/
const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors());

const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();

const bcrypt = require('bcrypt');
const saltRounds = 12;

const User = require('./db_schema').User;
/*Required Dependencies end*/


/*Create new User*/
app.post('/new' , bodyParser, (req , res) => {
  const uname = req.body.uname;
  const pass = req.body.pass;

  if(uname.length < 4)
  {
    res.json({msg: '<span class="text-danger">Username should be at least 4 characters long</span>'});
  }
  if(pass.length < 8)
  {
    res.json({msg: '<span class="text-danger">Password should be at least 8 characters long</span>'});
  }
  User.findOne({userId: uid} , (error , user) => {
    console.log(user);
    if(user == null)
    {
      bcrypt.hash(pass , saltRounds , (err , hash) => {
        let user = {userId: uid, password: hash};
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
})



var server = app.listen(4000, function () {
  console.log('Server running at http://localhost:' + server.address().port)
})
