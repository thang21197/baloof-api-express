var express = require('express');
var router = express.Router();
const User = require ('../model/Users');
const {registerValidation,loginValidation, updateValidation} = require('../validation');
const bcrypt = require('bcryptjs');
const  jwt = require('jsonwebtoken');
const verify= require('./middleware/verifyToken');
/* GET home page. */

router.get('/', function(req, res) {
    //    const user = new User({
    //        name: req.body.name,
    //        email: req.body.email,
    //    })
      res.send('Register');
  });

// Register
router.post('/register', async (req, res) =>{
    // Lest validate the data before we a user
    const {error} = registerValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // Checking if the username is already in the data base
    const emailExist = await User.findOne({email: req.body.email});
    const usernameExist = await User.findOne({username: req.body.username});
    if(emailExist || usernameExist) return res.status(400).send('Email or Username already exists');    


    // Has passwords
    const salt = await bcrypt.genSalt(10);
    const hashPawword = await bcrypt.hash(req.body.password, salt);

   const user = new User({
       username: req.body.username,
       email: req.body.email,
       role:req.body.role,
       password:hashPawword,
       displayname:req.body.displayname,
       phone_number:req.body.phone_number,
   })

   try {
       const savedUser = await user.save();
       res.send(savedUser);
   } catch (error) {
       res.status(400).send(error)
   }
});
// Login
router.post('/login', async (req,res) => {   
    // Lest validate the data before we a user
    // res.send('asdasd');

    const {error}  = loginValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    // Checking if the user exist
    const user  = await User.findOne({$or:[{username: req.body.username},{email: req.body.username}]});
    if(!user) return res.status(400).send('User is not found');

    // Password is correct
    const validPass = await bcrypt.compare(req.body.password , user.password);
    if(!validPass) return res.status(400).send('Invalid password');

    // Create and assign a token
    const token = jwt.sign({
        _id:user._id,
        displayname:user.displayname,
        email:user.email,
        role:user.role,
        phone_number:user.phone_number,
    }, process.env.TOKEN_SECRET);
    res.header('Authorization', token).send(token);
    res.send('Logged in! ');
} )

// Get current user
router.get('/profile', verify, async (req,res) => {
    const currentUser= await User.findOne({_id: req.body.profile._id});
    res.send(currentUser);
} )

// Update user
router.put('/profile/update', verify, async (req,res) => {
    // validation
    const {error} = updateValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    // res.send(req.body.profile);
    // Has password
    const salt = await bcrypt.genSalt(10);
    const oldData = await User.findOne({_id:req.body.profile._id}).select('password username');
    const newPhonenumber= (req.body.phone_number) ? req.body.phone_number: '';
    const newDisplayName= (req.body.displayname) ? req.body.displayname: oldData.username;
    const hashPassword = (req.body.password) ? await bcrypt.hash(req.body.password, salt):oldData.password;
    
    // res.send(oldPassword);
    const userUpdate = await User.findOneAndUpdate({_id:req.body.profile._id},{
        displayname : newDisplayName,
        phone_number: newPhonenumber,
        password    : hashPassword,
    })
    res.send('Updating account successful');
})

module.exports = router;

