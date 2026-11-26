const User = require('../models/User');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

function sendError(res, status, code, message) {
  res.status(status);
  res.json({
    success: false,
    error: {
      code: code,
      message: message,
    },
  });
}

//helper REGEX function
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function registerUser(req, res, next) {
  try {
    if (!req.body) {
      sendError(res, 400, 'VALIDATION_ERROR', 'Request body is required.');
      return;
    }
    // req.body is the parsed JSON object. .name and .email are its fields.
    // let because later steps will reassign them (trim, lowercase).
       let name = req.body.name;
       let email = req.body.email;
    let password = req.body.password;


    //name

    
    if (typeof name !== 'string') {
      sendError(res, 400, 'VALIDATION_ERROR', 'Name is required.');
      return;
    }
    
    name = name.trim();
    
    if (name.length === 0) {
      sendError(res, 400, 'VALIDATION_ERROR', 'Name is required.');
      return;
    }
    //email
   
    
    if (typeof email !== 'string') {
      sendError(res, 400, 'VALIDATION_ERROR', 'Email is required.');
      return;
    }
    
    email = email.trim();
    email = email.toLowerCase();
    
    if (email.length === 0) {
      sendError(res, 400, 'VALIDATION_ERROR', 'Email is required.');
      return;
    }
    if (!isValidEmail(email)) {
      sendError(res, 400, 'VALIDATION_ERROR', 'Email is invalid.');
      return;
    }
    
    //password


    
    if (typeof password !== 'string') {
      sendError(res, 400, 'VALIDATION_ERROR', 'Password is required.');
      return;
    }
    
    if (password.length === 0) {
      sendError(res, 400, 'VALIDATION_ERROR', 'Password is required.');
      return;
    }
    
    if (password.length < 8) {
      sendError(res, 400, 'VALIDATION_ERROR', 'Password must be at least 8 characters.');
      return;
    }

 
    //send responser body and end response
    const passwordHash = await bcrypt.hash(password, 10);
    
    const user = await User.create({
      name: name,
      email: email,
      passwordHash: passwordHash,
    });
    
    const safeUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };
    
    res.status(201);
    res.json({
      success: true,
      data: {
        user: safeUser,
      },
    });
  } catch (error) { 
    //exception path
    if (error.code === 11000) {
       sendError(res, 409, 'EMAIL_IN_USE', 'An account with this email already exists.');
       return;
     }
    next(error);
  } 
}

router.post('/register', registerUser);

module.exports = router;